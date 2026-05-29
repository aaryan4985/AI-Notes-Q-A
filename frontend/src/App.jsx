import { useState } from "react";
import "./index.css";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  const [loadingUpload, setLoadingUpload] = useState(false);

  const askQuestion = async () => {
    if (!question) return;
    setLoadingAnswer(true);
    try {
      const response = await fetch("http://localhost:8080/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();
      setAnswer(data.answer);
    } catch (error) {
      console.error("Ask failed", error);
      setAnswer("Error fetching answer.");
    } finally {
      setLoadingAnswer(false);
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) return;
    setLoadingUpload(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://localhost:8080/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.text();
      console.log("Upload response:", data);
      alert("Upload successful! Document is indexed.");
    } catch (error) {
      console.error("Upload failed", error);
      alert("Upload failed.");
    } finally {
      setLoadingUpload(false);
    }
  };

  return (
    <div className="bauhaus-container">
      <div className="geometric-accents">
        <div className="geo-circle"></div>
        <div className="geo-square"></div>
      </div>
      
      <div className="bauhaus-header">
        <h1>NOTES Q&A</h1>
      </div>

      <div className="bauhaus-content">
        <div className="bauhaus-section">
          <div className="bauhaus-label">1. Upload Document</div>
          <div className="input-group">
            <div className="file-input-wrapper">
              <span className="file-input-btn">
                {selectedFile ? selectedFile.name : "CHOOSE FILE"}
              </span>
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />
            </div>
            <button className="bauhaus-button blue" onClick={uploadFile} disabled={loadingUpload}>
              {loadingUpload ? "WAIT..." : "UPLOAD"}
            </button>
          </div>
        </div>

        <div className="bauhaus-section">
          <div className="bauhaus-label">2. Ask Question</div>
          <div className="input-group">
            <input
              className="bauhaus-input"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="ENTER YOUR QUERY..."
            />
            <button className="bauhaus-button" onClick={askQuestion} disabled={loadingAnswer}>
              {loadingAnswer ? "THINKING..." : "ASK"}
            </button>
          </div>
        </div>

        <div className="bauhaus-section">
          <div className="bauhaus-label">3. Answer</div>
          <div className="bauhaus-answer-box">
            {answer ? answer : <span style={{color: '#7a7a7a'}}>Waiting for question...</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;