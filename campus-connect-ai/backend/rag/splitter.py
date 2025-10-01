# rag/splitter.py
from typing import List, Dict
import math
from hashlib import sha256
from rag.config import CHUNK_SIZE, CHUNK_OVERLAP

def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP):
    if not text:
        return []
    step = chunk_size - overlap
    chunks = []
    start = 0
    n = len(text)
    idx = 0
    while start < n:
        end = min(start + chunk_size, n)
        piece = text[start:end].strip()
        if piece:
            chunk_id = sha256(f"{start}:{end}:{piece[:64]}".encode("utf-8")).hexdigest()[:12]
            chunks.append({"id": chunk_id, "text": piece, "start": start, "end": end, "idx": idx})
            idx += 1
        if end == n:
            break
        start += step
    return chunks