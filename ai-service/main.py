# pyrefly: ignore [missing-import]
from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import chromadb
from pypdf import PdfReader
import os
import torch
from transformers import AutoModelForQuestionAnswering, AutoTokenizer

app = FastAPI()

# embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

# chroma setup
client = chromadb.Client()
collection = client.get_or_create_collection("docs")

# qa model
qa_model_name = "deepset/roberta-base-squad2"
qa_tokenizer = AutoTokenizer.from_pretrained(qa_model_name)
qa_model = AutoModelForQuestionAnswering.from_pretrained(qa_model_name)


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

    if not docs:
        return {"answer": "No relevant context found in uploaded documents."}

    context = " ".join(docs)

    inputs = qa_tokenizer(q.question, context, return_tensors="pt", max_length=512, truncation=True)
    with torch.no_grad():
        outputs = qa_model(**inputs)
    
    answer_start_index = outputs.start_logits.argmax()
    answer_end_index = outputs.end_logits.argmax()
    
    predict_answer_tokens = inputs.input_ids[0, answer_start_index : answer_end_index + 1]
    extracted_answer = qa_tokenizer.decode(predict_answer_tokens, skip_special_tokens=True)

    if not extracted_answer.strip():
        extracted_answer = "Could not find a direct answer in the text."

    return {
        "answer": extracted_answer
    }