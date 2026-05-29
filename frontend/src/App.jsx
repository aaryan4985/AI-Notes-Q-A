import { useState } from "react";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const askQuestion = async () => {
    const response = await fetch(
      "http://localhost:8080/api/ask",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question,
        }),
      }
    );

    const data = await response.json();
    setAnswer(data.answer);
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>AI Notes Q&A</h1>

      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask something..."
        style={{
          width: "300px",
          padding: "10px",
        }}
      />

      <button
        onClick={askQuestion}
        style={{
          marginLeft: "10px",
          padding: "10px",
        }}
      >
        Ask
      </button>

      <h3>Answer:</h3>
      <p>{answer}</p>
    </div>
  );
}

export default App;