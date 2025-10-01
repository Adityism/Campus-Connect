# caichat_integration.py
import streamlit as st
from rag.query import RAG
from rag.embedder import Embedder

st.set_page_config(page_title="UPES RAG Chat", layout="wide")
st.title("UPES RAG assistant")

# load global rag once
@st.cache_resource
def get_rag():
    rag = RAG.load()
    rag.warmup()
    return rag

rag = get_rag()
user = st.text_input("Ask about UPES:")
if st.button("Ask") and user.strip():
    with st.spinner("Searching documents and asking Ollama..."):
        res = rag.ask(user, k=6)
    st.markdown("**Answer:**")
    st.write(res["answer"])
    with st.expander("Sources and snippets"):
        for s in res["sources"]:
            st.markdown(f"- {s['source']} [{s['chunk_id']}] (score {s['score']:.3f})")
            st.text(s["text"][:800])