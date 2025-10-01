# rag/utils.py
import hashlib
import json
from pathlib import Path
from typing import List, Tuple, Dict
from pydantic import BaseModel
import pandas as pd
from bs4 import BeautifulSoup
from PyPDF2 import PdfReader

def sha256_bytes(data: bytes) -> str:
    h = hashlib.sha256()
    h.update(data)
    return h.hexdigest()

def file_fingerprint(path: Path) -> str:
    data = path.read_bytes()
    return sha256_bytes(data)

def text_from_pdf(path: Path) -> List[Tuple[str, Dict]]:
    reader = PdfReader(str(path))
    out = []
    for i, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        meta = {"source": str(path.name), "type": "pdf", "page": i + 1}
        out.append((text, meta))
    return out

def text_from_csv(path: Path) -> List[Tuple[str, Dict]]:
    df = pd.read_csv(path, dtype=str, keep_default_na=False)
    # convert rows to readable lines, chunk per 100 rows
    rows = df.fillna("").astype(str).values.tolist()
    text = "\n".join([", ".join(row) for row in rows])
    meta = {"source": str(path.name), "type": "csv"}
    return [(text, meta)]

def text_from_json(path: Path) -> List[Tuple[str, Dict]]:
    obj = json.loads(path.read_text(encoding="utf-8"))
    text = json.dumps(obj, indent=2, ensure_ascii=False)
    meta = {"source": str(path.name), "type": "json"}
    return [(text, meta)]

def text_from_html(path: Path) -> List[Tuple[str, Dict]]:
    soup = BeautifulSoup(path.read_text(encoding="utf-8"), "html.parser")
    # simple: extract visible text
    for script in soup(["script", "style"]):
        script.extract()
    text = soup.get_text(separator="\n")
    meta = {"source": str(path.name), "type": "html"}
    return [(text, meta)]

def text_from_txt(path: Path) -> List[Tuple[str, Dict]]:
    text = path.read_text(encoding="utf-8")
    meta = {"source": str(path.name), "type": "txt"}
    return [(text, meta)]

def load_file(path: Path):
    ext = path.suffix.lower()
    if ext == ".pdf":
        return text_from_pdf(path)
    if ext in {".csv", ".tsv"}:
        return text_from_csv(path)
    if ext in {".json"}:
        return text_from_json(path)
    if ext in {".html", ".htm"}:
        return text_from_html(path)
    if ext in {".txt", ".md"}:
        return text_from_txt(path)
    # fallback: read as text
    return [(path.read_text(encoding="utf-8", errors="ignore"), {"source": str(path.name), "type": "raw"})]