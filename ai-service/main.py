from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import chromadb
from pypdf import PdfReader
import os

app = FastAPI()

# embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

# chroma setup
client = chromadb.Client()
collection = client.get_or_create_collection("docs")


class Question(BaseModel):
    question: str


# ---------- Upload ----------
@app.post("/upload")
async def upload(file: UploadFile = File(...)):

    path = f"uploads/{file.filename}"

    with open(path, "wb") as f:
        f.write(await file.read())

    text = ""

    if file.filename.endswith(".pdf"):
        reader = PdfReader(path)
        for page in reader.pages:
            text += page.extract_text()

    else:
        with open(path, "r", encoding="utf-8") as f:
            text = f.read()

    chunks = [text[i:i+500] for i in range(0, len(text), 500)]

    for i, chunk in enumerate(chunks):

        embedding = model.encode(chunk).tolist()

        collection.add(
            documents=[chunk],
            embeddings=[embedding],
            ids=[f"{file.filename}_{i}"]
        )

    return {"message": "Uploaded and indexed"}


# ---------- Ask ----------
@app.post("/ask")
def ask(q: Question):

    query_embedding = model.encode(q.question).tolist()

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=2
    )

    docs = results["documents"][0]

    answer = "\n".join(docs)

    return {
        "answer": answer
    }