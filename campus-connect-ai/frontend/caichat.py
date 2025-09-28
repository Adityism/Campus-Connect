# kichat.py
import sys
# force streamlit port if not set
if not any(arg.startswith("--server.port") for arg in sys.argv):
    sys.argv += ["--server.port", "8505"]


import streamlit as st
import requests
import json
import sseclient
from datetime import datetime
from typing import List, Dict

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

def make_assistant_msg(text: str) -> Dict:
    return {"role": "assistant", "content": text, "time": now_iso()}


# Streaming version for GPT-like typing effect

# Streaming using SSEClient for proper event streaming
def stream_prompt_to_backend(prompt: str):
    try:
        resp = requests.post(API_STREAM_URL, json={"prompt": prompt}, verify=False, stream=True)
        client = sseclient.SSEClient(resp)
        for event in client.events():
            if event.data.strip():
                data = json.loads(event.data)
                if "token" in data:
                    yield data["token"]
                elif data.get("event") == "end":
                    break
    except Exception as e:
        yield f"Error: {e}"

def render_messages(messages: List[Dict]):
    for msg in messages:
        role = msg.get("role", "assistant")
        content = msg.get("content", "")
        with st.chat_message(role):
            st.markdown(content)

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

def ping_backend():
    try:
        r = requests.get(API_URL.replace("/api/query", "/api/services"), timeout=2)
        st.session_state["server_status"] = "online" if r.ok else "online (limited)"
    except Exception:
        st.session_state["server_status"] = "offline"

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
        for token in stream_prompt_to_backend(prompt):
            full_reply += token
            placeholder.markdown(full_reply + " ▍")
        placeholder.markdown(full_reply)
    st.session_state["messages"].append(make_assistant_msg(full_reply))


# Remove fallback "Send last message" button since streaming is now default and send_prompt_to_backend is gone

col_a, col_b = st.columns([1, 3])
with col_a:
    if st.button("Clear Chat"):
        st.session_state["messages"] = []
        st.rerun()
with col_b:
    st.caption("CAI — Campus Connect AI")