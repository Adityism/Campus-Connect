from dotenv import load_dotenv
load_dotenv()

import logging
import hashlib
import json
import time
import os
from typing import List, Dict, Optional
from diskcache import Cache
from rag.embedder import Embedder
from rag.vectorstore import VectorStore
from rag.config import (
    CACHE_DIR,
    RETRIEVAL_K,
)
from rag.prompt import build_prompt


# Google Gemini/Vertex AI
import vertexai
from vertexai.generative_models import GenerativeModel
import google.generativeai as genai

# Initialize Vertex AI. This will automatically use credentials from GOOGLE_APPLICATION_CREDENTIALS
vertexai.init()

logger = logging.getLogger("rag.query")
_cache = Cache(CACHE_DIR / "responses")



class RAG:
    def __init__(
        self,
        vectorstore: VectorStore,
        embedder: Embedder,
    ):
        self.vs = vectorstore
        self.embedder = embedder

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
        - Send to Google Gemini
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

        # 5. Call Google Gemini
        attempt, answer, error = 0, "", None
        while attempt <= retries:
            try:
                answer = self._call_google(
                    prompt, temperature=temperature, max_tokens=max_tokens
                )
                if answer.strip():
                    break
            except Exception as e:
                error = str(e)
                logger.error(f"[RAG] Google API call failed (attempt {attempt+1}): {e}")
                time.sleep(1)
            attempt += 1

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


    def _call_google(self, prompt: str, temperature: float = 0.0, max_tokens: int = 2048) -> str:
        """
        Send prompt to Google Gemini (Generative AI API) using service account credentials from env.
        Prioritize clarity, handle errors gracefully.
        """
        try:
            model_name = os.getenv("GOOGLE_MODEL", "gemini-1.5-flash")
            model = GenerativeModel(model_name)
            response = model.generate_content(
                prompt,
                generation_config={
                    "temperature": temperature,
                    "max_output_tokens": max_tokens,
                }
            )
            return response.text.strip() if response.text else "I don't know."
        except Exception as e:
            logger.error(f"[RAG] Google API call failed: {e}")
            return f"I don't know. (Error: {e})"

    # warmup() removed (Ollama-specific)