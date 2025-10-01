# rag/vectorstore.py
import faiss
import numpy as np
import pickle
from pathlib import Path
from typing import List, Dict, Tuple
from rag.config import FAISS_INDEX, DOC_STORE, INDEX_DIR

class VectorStore:
    def __init__(self, dim: int, index_path=FAISS_INDEX, meta_path=DOC_STORE):
        self.index_path = Path(index_path)
        self.meta_path = Path(meta_path)
        self.dim = dim
        self._index = None
        self._metadatas = []   # list aligned with FAISS rows
        self._load()

    def _create_index(self):
        # cosine similarity via inner product on normalized vectors
        idx = faiss.IndexFlatIP(self.dim)
        return idx

    def _load(self):
        INDEX_DIR.mkdir(parents=True, exist_ok=True)
        if self.index_path.exists() and self.meta_path.exists():
            try:
                self._index = faiss.read_index(str(self.index_path))
                with open(self.meta_path, "rb") as f:
                    self._metadatas = pickle.load(f)
                return
            except Exception:
                # fallback: create fresh
                self._index = self._create_index()
                self._metadatas = []
        else:
            self._index = self._create_index()
            self._metadatas = []

    def add(self, embeddings: np.ndarray, metadatas: List[Dict]):
        if embeddings.shape[1] != self.dim:
            raise ValueError("dim mismatch")
        self._index.add(embeddings)
        self._metadatas.extend(metadatas)

    def search(self, q_embedding: np.ndarray, k: int = 4) -> List[Tuple[float, Dict]]:
        # q_embedding shape (dim,) or (1, dim)
        if q_embedding.ndim == 1:
            q_embedding = q_embedding.reshape(1, -1)
        if self._index.ntotal == 0:
            return []
        distances, idxs = self._index.search(q_embedding, k)
        results = []
        for dist, idx in zip(distances[0], idxs[0]):
            if idx < 0 or idx >= len(self._metadatas):
                continue
            results.append((float(dist), self._metadatas[idx]))
        return results

    def save(self):
        faiss.write_index(self._index, str(self.index_path))
        with open(self.meta_path, "wb") as f:
            pickle.dump(self._metadatas, f)

    @property
    def size(self):
        return self._index.ntotal