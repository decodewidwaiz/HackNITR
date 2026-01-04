import pandas as pd
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
import pickle

# Load data
df = pd.read_csv("data/plant_diseases.csv")

# Combine text fields
documents = (
    df["crop"] + " " +
    df["disease"] + " " +
    df["symptoms"] + " " +
    df["treatment"]
).tolist()

# Load embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Create embeddings
embeddings = model.encode(documents)

# Create FAISS index
dimension = embeddings.shape[1]
index = faiss.IndexFlatL2(dimension)
index.add(np.array(embeddings))

# Save index and metadata
faiss.write_index(index, "faiss_index.bin")
with open("metadata.pkl", "wb") as f:
    pickle.dump(documents, f)

print("✅ Data indexed successfully")