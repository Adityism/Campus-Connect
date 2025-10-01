# rag/prompt.py
from typing import List, Dict, Optional
from textwrap import shorten

SYSTEM_INSTRUCTION = (
    "You are Campus Connect AI, a helpful, professional, and student-friendly assistant. "
    "Always prioritize the provided CONTEXT blocks from university documents. "
    "If context is missing or incomplete, you may use your own general knowledge to give a helpful and accurate answer. "
    "Always explain clearly and structure your answers for students."
)

def build_prompt(question: str, retrieved: List[Dict], history: Optional[List[Dict]] = None, max_context_chars: int = 4000) -> str:
    """
    retrieved: list of metadata dicts with fields 'source', 'chunk_id', 'text'
    We'll attach chunks in order. Truncate each chunk if needed.
    history: list of previous chat turns (dicts with 'role' and 'content')
    """
    ctx_parts = []
    total = 0
    for i, d in enumerate(retrieved):
        text = d.get("text", "")
        snippet = text if len(text) <= 1000 else shorten(text, width=1000, placeholder=" ...")
        block = f"{snippet}\n"
        if total + len(block) > max_context_chars:
            break
        ctx_parts.append(block)
        total += len(block)
    context_str = "\n\n".join(ctx_parts) if ctx_parts else ""
    history_str = ""
    if history:
        for turn in history[-3:]:  # keep last 3 exchanges
            role = turn.get("role", "user").capitalize()
            content = turn.get("content", "").strip()
            history_str += f"{role}: {content}\n"
    prompt = f"{SYSTEM_INSTRUCTION}\n\nCONVERSATION HISTORY:\n{history_str}\n\nCONTEXT:\n{context_str}\n\nQUESTION: {question}\n\nAnswer concisely."
    return prompt