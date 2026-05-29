
# pyrefly: ignore [missing-import]
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Question(BaseModel):
    question: str

@app.get("/")
def home():
    return {"message": "AI service running"}

@app.post("/ask")
def ask(q: Question):
    return {
        "answer": f"You asked: {q.question}"
    }