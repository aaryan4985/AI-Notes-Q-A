import { useState } from "react";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

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

  const uploadFile = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://localhost:8080/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.text();
      console.log("Upload response:", data);
      alert("Upload successful: " + data);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Upload failed");
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>AI Notes Q&A</h1>

      <div style={{ marginBottom: "20px" }}>
        <h3>Upload Document</h3>
        <input 
          type="file" 
          onChange={(e) => setSelectedFile(e.target.files[0])} 
        />
        <button onClick={uploadFile} style={{ marginLeft: "10px", padding: "10px" }}>
          Upload
        </button>
      </div>

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