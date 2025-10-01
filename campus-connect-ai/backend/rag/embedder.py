# rag/embedder.py
import numpy as np
from sentence_transformers import SentenceTransformer
import torch
from diskcache import Cache
from typing import List
from rag.config import EMBEDDING_MODEL, BATCH_SIZE, CACHE_DIR
from rag.utils import sha256_bytes

_cache = Cache(CACHE_DIR / "embedder")  # small LRU on disk

class Embedder:
    def __init__(self, model_name=EMBEDDING_MODEL, batch_size=BATCH_SIZE):
        device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = SentenceTransformer(model_name, device=device)
        self.batch_size = batch_size

    def _chunk_hash(self, text: str) -> str:
        return sha256_bytes(text.encode("utf-8"))

    def embed(self, texts: List[str]) -> np.ndarray:
        # returns normalized float32 embeddings
        out = []
        to_compute = []
        compute_indexes = []
        for i, t in enumerate(texts):
            key = self._chunk_hash(t)
            v = _cache.get(key, None)
            if v is not None:
                out.append(v)
            else:
                out.append(None)
                to_compute.append(t)
                compute_indexes.append(i)

        if to_compute:
            emb_batch = self.model.encode(
                to_compute,
                batch_size=self.batch_size,
                convert_to_numpy=True,
                show_progress_bar=False,
                normalize_embeddings=True,
            ).astype("float32")

            j = 0
            for i in compute_indexes:
                _cache[self._chunk_hash(texts[i])] = emb_batch[j]
                out[i] = emb_batch[j]
                j += 1

        return np.vstack(out).astype("float32")