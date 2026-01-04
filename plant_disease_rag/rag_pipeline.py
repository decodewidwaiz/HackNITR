import faiss
import pickle
import numpy as np
import streamlit as st
from sentence_transformers import SentenceTransformer
import google.generativeai as genai

# Load API key
API_KEY = st.secrets["GOOGLE_API_KEY"]

# Configure Gemini
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel("gemini-2.5-flash")

# Load embedding model & FAISS index
embedder = SentenceTransformer("all-MiniLM-L6-v2")
index = faiss.read_index("faiss_index.bin")

with open("metadata.pkl", "rb") as f:
    documents = pickle.load(f)

def predict_disease(crop, symptoms):
    query = f"{crop} plant with {symptoms}"
    query_embedding = embedder.encode([query]).astype("float32")

    distances, indices = index.search(query_embedding, k=3)
    retrieved_docs = [documents[i] for i in indices[0]]

    prompt = f"""
You are an expert agriculture assistant.

RULES:
- Use ONLY the context below
- If insufficient data, say:
  "Insufficient data to make a reliable diagnosis."

CONTEXT:
{retrieved_docs}

TASK:
1. Possible plant diseases
2. Reasons
3. Treatment / prevention
4. State uncertainty clearly
"""

    response = model.generate_content(prompt)
    return response.text
