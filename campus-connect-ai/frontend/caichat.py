# caiichat.py
import sys
# force streamlit port if not set
if not any(arg.startswith("--server.port") for arg in sys.argv):
    sys.argv += ["--server.port", "8505"]

import streamlit as st
import requests
import json
import sseclient
from datetime import datetime
from typing import List, Dict, Optional
from pathlib import Path

# Try to import local RAG. If present, we'll use it first.
LOCAL_RAG_AVAILABLE = False
try:
    from rag.query import RAG
    from rag.embedder import Embedder
    LOCAL_RAG_AVAILABLE = True
except Exception:
    LOCAL_RAG_AVAILABLE = False

API_URL = "https://localhost:5001/api/query"
API_STREAM_URL = "https://localhost:5001/api/query/stream"
REQUEST_TIMEOUT = 25  # seconds

st.set_page_config(page_title="Campus Connect AI (CAI)", page_icon="🤖", layout="wide")

# -------------------------
# Helpers
# -------------------------
def now_iso():
    return datetime.now().isoformat()

def make_user_msg(text: str) -> Dict:
    return {"role": "user", "content": text, "time": now_iso()}

# assistant message now optionally includes sources
def make_assistant_msg(text: str, sources: Optional[List[Dict]] = None) -> Dict:
    return {"role": "assistant", "content": text, "time": now_iso(), "sources": sources or []}

# Streaming version for GPT-like typing effect
# Existing backend SSE streaming - left intact for fallback
def stream_prompt_to_backend(prompt: str):
    try:
        resp = requests.post(API_STREAM_URL, json={"prompt": prompt, "history": st.session_state["messages"]}, verify=False, stream=True, timeout=REQUEST_TIMEOUT)
        client = sseclient.SSEClient(resp)
        for event in client.events():
            if not event.data:
                continue
            data = event.data.strip()
            if not data:
                continue
            try:
                payload = json.loads(data)
            except Exception:
                # If it's raw text, yield it
                yield data
                continue
            # maintain the backward compatible token/event shapes you used previously
            if "token" in payload:
                yield payload["token"]
            elif payload.get("event") == "end":
                break
            elif "text" in payload:
                yield payload["text"]
            elif payload.get("error"):
                yield f"Error: {payload.get('error')}"
    except Exception as e:
        yield f"Error: {e}"

# New: local RAG streaming emulator
def stream_prompt_to_local_rag(prompt: str, rag_instance: "RAG", k: int = 6, chunk_size: int = 64):
    """
    Calls rag.ask synchronously and yields the answer in small chunks to simulate streaming.
    Also returns the sources after the answer is complete via a final dict with key '__SOURCES__'
    """
    try:
        result = rag_instance.ask(prompt, k=k, use_cache=True)
        answer = result.get("answer", "") or ""
        sources = result.get("sources", [])
        # yield word by word for GPT-like streaming
        words = answer.split()
        for idx, word in enumerate(words):
            # Add a space after each word except the last
            yield word + (" " if idx < len(words) - 1 else "")
        # after full answer, yield a special JSON block indicating sources
        yield json.dumps({"__SOURCES__": sources})
    except Exception as e:
        yield f"Error: {e}"

def render_messages(messages: List[Dict]):
    for msg in messages:
        role = msg.get("role", "assistant")
        content = msg.get("content", "")
        with st.chat_message(role):
            st.markdown(content)
            # Removed sources/citations display

def save_current_chat(name: str):
    if "saved_chats" not in st.session_state:
        st.session_state["saved_chats"] = {}
    st.session_state["saved_chats"][name] = {
        "messages": st.session_state.get("messages", []),
        "saved_at": now_iso()
    }

def load_saved_chat(name: str):
    chat = st.session_state.get("saved_chats", {}).get(name)
    if chat:
        st.session_state["messages"] = chat["messages"].copy()

# -------------------------
# Session state init
# -------------------------
if "messages" not in st.session_state:
    st.session_state["messages"] = []

if "saved_chats" not in st.session_state:
    st.session_state["saved_chats"] = {}

if "server_status" not in st.session_state:
    st.session_state["server_status"] = "unknown"

# ping backend service status (no API shape changed)
def ping_backend():
    try:
        r = requests.get(API_URL.replace("/api/query", "/api/services"), timeout=2, verify=False)
        st.session_state["server_status"] = "online" if r.ok else "online (limited)"
    except Exception:
        st.session_state["server_status"] = "offline"

# -------------------------
# If local RAG available, load it as cached resource
# -------------------------
@st.cache_resource
def get_local_rag():
    if not LOCAL_RAG_AVAILABLE:
        return None
    try:
        rag = RAG.load()  # uses default config paths
        # warm up best-effort
        try:
            rag.warmup()
        except Exception:
            pass
        return rag
    except Exception:
        return None

_local_rag = get_local_rag() if LOCAL_RAG_AVAILABLE else None
USE_LOCAL_RAG = _local_rag is not None

# -------------------------
# Sidebar
# -------------------------
with st.sidebar:
    st.markdown("### Campus Connect AI (CAI)")
    col1, col2 = st.columns([1, 4])
    with col1:
        st.image("https://static.thenounproject.com/png/3636407-200.png", width=56)
    with col2:
        st.markdown("**Aditya**")
        st.caption("Student • Campus Connect")
    st.divider()

    if st.button("➕ New Chat"):
        st.session_state["messages"] = []
        st.rerun()

    st.markdown("#### Examples")
    example_prompts = [
        "What are today's announcements?",
        "Where is Dr. Rajesh's office located?",
        "How do I make an HTTP request in JavaScript?",
        "Explain short-circuit evaluation in boolean expressions."
    ]
    for ex in example_prompts:
        if st.button(ex, key=f"ex_{ex}"):
            st.session_state["messages"].append(make_user_msg(ex))
            st.rerun()

    st.divider()

    st.markdown("#### Saved Chats")
    if st.session_state["saved_chats"]:
        for name in list(st.session_state["saved_chats"].keys()):
            row = st.columns([0.75, 0.25])
            if row[0].button(name, key=f"load_{name}"):
                load_saved_chat(name)
                st.rerun()
            if row[1].button("✖", key=f"del_{name}"):
                st.session_state["saved_chats"].pop(name, None)
                st.rerun()
    else:
        st.caption("No saved chats yet")

    st.divider()

    chat_name = st.text_input("Save chat as", value=f"chat-{datetime.now().strftime('%Y%m%d-%H%M%S')}")
    if st.button("Save Chat"):
        save_current_chat(chat_name)
        st.success(f"Saved as {chat_name}")

    export_json = json.dumps({"messages": st.session_state["messages"]}, indent=2)
    st.download_button("Download Chat (JSON)", data=export_json,
                       file_name="CAI_chat.json", mime="application/json")
    st.divider()

    ping_backend()
    st.markdown(f"**Server:** {st.session_state['server_status']}")
    if st.button("Logout"):
        js = "window.location.href = '/logout';"
        st.components.v1.html(f"<script>{js}</script>", height=0)

# -------------------------
# Main Area
# -------------------------
st.markdown("## Live Chat")

render_messages(st.session_state["messages"])

prompt = st.chat_input("Type your message...")

if prompt:
    st.session_state["messages"].append(make_user_msg(prompt))
    with st.chat_message("user"):
        st.markdown(prompt)

    with st.chat_message("assistant"):
        placeholder = st.empty()
        full_reply = ""
        collected_sources = None

        # If local RAG is available, use it first. Otherwise fallback to backend SSE.
        if USE_LOCAL_RAG:
            # Use the RAG pipeline and simulate streaming (word-by-word)
            stream_gen = stream_prompt_to_local_rag(prompt, _local_rag, k=6, chunk_size=1)
        else:
            # fallback to backend streaming API
            stream_gen = stream_prompt_to_backend(prompt)

        for token in stream_gen:
            # local RAG yields a final JSON with "__SOURCES__"
            if isinstance(token, str) and token.startswith("Error:"):
                # show error inline and stop
                full_reply += "\n" + token
                placeholder.markdown(full_reply)
                break
            # handle special JSON sources marker
            if isinstance(token, str) and token.strip().startswith("{"):
                try:
                    j = json.loads(token)
                    if "__SOURCES__" in j:
                        collected_sources = j["__SOURCES__"]
                        # don't append the JSON marker to reply
                        continue
                except Exception:
                    # not our special JSON, just append raw token
                    pass
            # append token to display
            full_reply += token
            placeholder.markdown(full_reply + " ▍")

        # final display (remove trailing caret)
        placeholder.markdown(full_reply)
    # store assistant message without sources/citations
    st.session_state["messages"].append(make_assistant_msg(full_reply, sources=None))
    # Removed sources/citations expander after streaming

# Remove fallback "Send last message" button since streaming is now default and send_prompt_to_backend is gone

col_a, col_b = st.columns([1, 3])
with col_a:
    if st.button("Clear Chat"):
        st.session_state["messages"] = []
        st.rerun()
with col_b:
    st.caption("CAI — Campus Connect AI")