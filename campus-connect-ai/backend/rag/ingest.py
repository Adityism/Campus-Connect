# rag/ingest.py
import argparse
from pathlib import Path
import json
import numpy as np
from tqdm import tqdm

from rag.utils import load_file, file_fingerprint
from rag.splitter import chunk_text
from rag.embedder import Embedder
from rag.vectorstore import VectorStore
from rag.config import INDEX_DIR, CHUNK_SIZE, CHUNK_OVERLAP

FINGERPRINTS = INDEX_DIR / "fingerprints.json"


def load_fingerprints():
    if FINGERPRINTS.exists():
        return json.loads(FINGERPRINTS.read_text())
    return {}


def save_fingerprints(d):
    FINGERPRINTS.write_text(json.dumps(d, indent=2))


def collect_files(paths):
    """Expand directories → collect allowed filetypes."""
    allowed_exts = {".pdf", ".csv", ".txt", ".json", ".html", ".htm"}
    out = []
    for p in paths:
        path = Path(p)
        if path.is_dir():
            for f in path.rglob("*"):
                if f.suffix.lower() in allowed_exts:
                    out.append(f)
        elif path.is_file() and path.suffix.lower() in allowed_exts:
            out.append(path)
        else:
            print(f"⚠️  Skipping unsupported file: {path}")
    return out


def ingest(files, reindex=False):
    files = collect_files(files)
    if not files:
        print("❌ No valid files found to ingest.")
        return

    fp_db = load_fingerprints()
    embedder = Embedder()
    dim = embedder.model.get_sentence_embedding_dimension()
    vs = VectorStore(dim)

    docs_to_add = []
    metadatas = []
    added, skipped, chunks_total = 0, 0, 0

    for path in files:
        fp = file_fingerprint(path)
        if not reindex and str(path.name) in fp_db and fp_db[str(path.name)] == fp:
            print(f"⏩ Skipping (already indexed): {path.name}")
            skipped += 1
            continue

        print(f"📄 Indexing: {path.name}")
        try:
            blocks = load_file(path)
        except Exception as e:
            print(f"❌ Failed to load {path.name}: {e}")
            continue

        chunk_count = 0
        for block_text, block_meta in blocks:
            chunks = chunk_text(block_text, CHUNK_SIZE, CHUNK_OVERLAP)
            texts = [c["text"] for c in chunks]
            if not texts:
                continue

            embeddings = embedder.embed(texts)
            for emb, ch in zip(embeddings, chunks):
                meta = {
                    "source": block_meta.get("source", path.name),
                    "chunk_id": ch["id"],
                    "text": ch["text"][:4000],  # store trimmed chunk
                }
                metadatas.append(meta)
                docs_to_add.append(emb)
                chunk_count += 1

        if chunk_count > 0:
            print(f"   ✅ {chunk_count} chunks added from {path.name}")
            added += 1
            chunks_total += chunk_count
            fp_db[str(path.name)] = fp
        else:
            print(f"⚠️  No content extracted from {path.name}")

    if docs_to_add:
        arr = np.vstack(docs_to_add).astype("float32")
        vs.add(arr, metadatas)
        vs.save()

    save_fingerprints(fp_db)
    print("\n=== Ingestion Summary ===")
    print(f"  ➕ Files indexed: {added}")
    print(f"  ⏩ Files skipped: {skipped}")
    print(f"  📚 Chunks added: {chunks_total}")
    print(f"  📦 Current index size: {vs.size}")
    print("=========================\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest documents into RAG vectorstore.")
    parser.add_argument("--files", nargs="+", required=True, help="Files or directories to ingest")
    parser.add_argument("--reindex", action="store_true", help="Force reindex even if fingerprint matches")
    args = parser.parse_args()
    ingest(args.files, reindex=args.reindex)