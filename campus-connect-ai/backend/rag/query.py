import logging
import requests
import hashlib
import json
import time
from typing import List, Dict, Optional
from diskcache import Cache
from rag.embedder import Embedder
from rag.vectorstore import VectorStore
from rag.config import (
    OLLAMA_HOST,
    OLLAMA_MODEL,
    OLLAMA_KEEP_ALIVE,
    CACHE_DIR,
    RETRIEVAL_K,
)
from rag.prompt import build_prompt

logger = logging.getLogger("rag.query")
_cache = Cache(CACHE_DIR / "responses")


class RAG:
    def __init__(
        self,
        vectorstore: VectorStore,
        embedder: Embedder,
        ollama_host: str = OLLAMA_HOST,
        ollama_model: str = OLLAMA_MODEL,
    ):
        self.vs = vectorstore
        self.embedder = embedder
        self.ollama_host = ollama_host.rstrip("/")
        self.ollama_model = ollama_model

    @classmethod
    def load(cls, index_dir: Optional[str] = None):
        """Load embeddings + FAISS index into memory."""
        embedder = Embedder()
        dim = embedder.model.get_sentence_embedding_dimension()
        vs = VectorStore(dim)
        return cls(vs, embedder)

    def _cache_key(self, question: str, doc_ids: List[str]) -> str:
        s = question + "|" + "|".join(doc_ids)
        return hashlib.sha256(s.encode("utf-8")).hexdigest()

    def ask(
        self,
        question: str,
        history: Optional[List[Dict]] = None,
        k: int = RETRIEVAL_K,
        use_cache: bool = True,
        temperature: float = 0.0,
        max_tokens: int = 2048,
        retries: int = 1,
    ) -> Dict:
        """
        Ask a question to the RAG pipeline:
        - Embed and retrieve top-k chunks
        - Build context prompt
        - Send to Ollama
        Returns dict with {"answer": str, "sources": list, "used_context": bool, "error"?: str}
        """

        logger.info(f"[RAG] Question: {question[:120]}")

        # 1. Embed query
        q_emb = self.embedder.embed([question])[0]

        # 2. Retrieve documents
        hits = self.vs.search(q_emb, k=k)
        docs, doc_ids = [], []
        for score, md in hits:
            snippet = md["text"][:80].replace("\n", " ")
            logger.info(f"[RAG] Retrieved: {md['source']} [{md['chunk_id']}] "
                        f"score={score:.3f} snippet=\"{snippet}\"")
            docs.append({
                "score": score,
                "source": md["source"],
                "chunk_id": md["chunk_id"],
                "text": md["text"],
            })
            doc_ids.append(md["chunk_id"])

        used_context = len(docs) > 0

        # 3. Cache check
        cache_key = self._cache_key(question, doc_ids)
        if use_cache:
            cached = _cache.get(cache_key)
            if cached:
                logger.info("[RAG] Cache hit.")
                return cached

        # 4. Build context-aware prompt with history
        prompt = build_prompt(question, docs, history=history)
        logger.info(f"[RAG] Built prompt of length {len(prompt)}")

        # 5. Call Ollama
        attempt, answer, error = 0, "", None
        while attempt <= retries:
            try:
                answer = self._call_ollama(
                    prompt, temperature=temperature, max_tokens=max_tokens
                )
                if answer.strip():
                    break
            except Exception as e:
                error = str(e)
                logger.error(f"[RAG] Ollama call failed (attempt {attempt+1}): {e}")
                time.sleep(1)
            attempt += 1

    # If answer is empty, let the model respond naturally (do not force 'I don't know.')

        out = {
            "answer": answer.strip(),
            "sources": docs,
            "used_context": used_context,
        }
        if error:
            out["error"] = error

        # 6. Cache store
        if use_cache:
            _cache.set(cache_key, out, expire=60 * 60 * 24)

        return out

    def _call_ollama(
        self, prompt: str, temperature: float = 0.0, max_tokens: int = 2048
    ) -> str:
        """
        Try Ollama /api/chat, fallback to /api/generate.
        Returns plain text answer.
        """

        # --- Updated System Role ---
        system_message = (
            "You are Campus Connect AI, a professional and student-friendly assistant. "
            "Always prioritize the provided CONTEXT blocks from university documents. "
            "If context is missing or incomplete, you may use your own general knowledge "
            "to give a helpful and accurate answer. "
            "Always explain clearly, structure your answers for students, and cite context "
            "with [source:chunk_id] when you use it."
        )

        payload_chat = {
            "model": self.ollama_model,
            "messages": [
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt},
            ],
            "stream": False,
            "options": {"temperature": temperature, "num_predict": max_tokens},
            "keep_alive": OLLAMA_KEEP_ALIVE,
        }

        url_chat = f"{self.ollama_host}/api/chat"
        logger.info(f"[RAG] Sending prompt to Ollama at {url_chat}, "
                    f"model={self.ollama_model}, prompt len={len(prompt)}")
        resp = requests.post(url_chat, json=payload_chat, timeout=120)

        if resp.status_code == 404:
            # fallback to /generate
            payload_gen = {
                "model": self.ollama_model,
                "prompt": prompt,
                "stream": False,
                "options": {"temperature": temperature, "num_predict": max_tokens},
                "keep_alive": OLLAMA_KEEP_ALIVE,
            }
            url_gen = f"{self.ollama_host}/api/generate"
            logger.info(f"[RAG] Fallback to Ollama at {url_gen}")
            resp = requests.post(url_gen, json=payload_gen, timeout=120)

        resp.raise_for_status()
        data = resp.json()

        # parse different shapes
        if isinstance(data, dict):
            if "message" in data and isinstance(data["message"], dict):
                return data["message"].get("content", "").strip()
            if "response" in data:
                return data["response"].strip()
        if isinstance(data, str):
            return data.strip()

        return str(data)

    def warmup(self):
        """Preload Ollama model into memory to reduce cold latency."""
        url = f"{self.ollama_host}/api/generate"
        payload = {"model": self.ollama_model, "prompt": "warmup", "stream": False}
        try:
            requests.post(url, json=payload, timeout=10)
        except Exception as e:
            logger.warning(f"[RAG] Warmup failed: {e}")