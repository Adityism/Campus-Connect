# rag/config.py
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
INDEX_DIR = BASE_DIR.parent / "vectorstore"      # final persisted index dir
DOC_STORE = INDEX_DIR / "docs.pkl"               # document metadata store
FAISS_INDEX = INDEX_DIR / "faiss.index"          # faiss binary
META_FILE = INDEX_DIR / "meta.json"              # index metadata (fingerprints etc.)
CACHE_DIR = BASE_DIR.parent / ".rag_cache"       # diskcache
EMBEDDING_MODEL = "all-MiniLM-L6-v2"             # sentence-transformers shorthand
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200
BATCH_SIZE = 64
OLLAMA_HOST = "http://localhost:11434"
OLLAMA_MODEL = "llama3:latest"                        # change to your local model tag
OLLAMA_KEEP_ALIVE = 300                          # seconds to keep model loaded
RETRIEVAL_K = 4