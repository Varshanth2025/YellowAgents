import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  getProject,
  getPrompt,
  createOrUpdatePrompt,
  sendMessage,
  getChatHistory,
  uploadFile,
  getProjectFiles,
  deleteFile,
} from "../services/api";

const Project = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [showPromptForm, setShowPromptForm] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);

  const sessionId = `session_${Date.now()}`;

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchData = async () => {
    try {
      const [projectRes, historyRes, filesRes] = await Promise.all([
        getProject(id),
        getChatHistory(id, sessionId),
        getProjectFiles(id),
      ]);

      setProject(projectRes.data.data);
      setMessages(historyRes.data.data);
      setFiles(filesRes.data.data || []);

      try {
        const promptRes = await getPrompt(id);
        setPrompt(promptRes.data.data.systemPrompt);
      } catch (err) {
        setShowPromptForm(true);
      }
    } catch (err) {
      setError("Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrompt = async (e) => {
    e.preventDefault();
    try {
      await createOrUpdatePrompt(id, { systemPrompt: prompt });
      setShowPromptForm(false);
      setError("");
    } catch (err) {
      setError("Failed to save prompt");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !prompt) {
      setError("Please set a system prompt first");
      return;
    }

    setSending(true);
    setError("");

    try {
      const response = await sendMessage(id, {
        message: input,
        sessionId: sessionId,
      });

      setMessages([
        ...messages,
        response.data.data.userMessage,
        response.data.data.assistantMessage,
      ]);
      setInput("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    const fileInput = e.target.file.files[0];
    const description = e.target.description.value;

    if (!fileInput) {
      setError("Please select a file");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", fileInput);
      formData.append("description", description);
      formData.append("purpose", "assistants");

      await uploadFile(id, formData);

      // Refresh files list
      const filesRes = await getProjectFiles(id);
      setFiles(filesRes.data.data || []);

      setShowFileUpload(false);
      e.target.reset();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
      await deleteFile(id, fileId);
      setFiles(files.filter((f) => f._id !== fileId));
    } catch (err) {
      setError("Failed to delete file");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <Navbar />
      <div className="container">
        <div style={{ marginBottom: "20px" }}>
          <Link to="/dashboard">← Back to Dashboard</Link>
        </div>

        <div className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h2>{project?.name}</h2>
              <p>{project?.description}</p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setShowFileUpload(!showFileUpload)}>
                📎 Files ({files.length})
              </button>
              <button onClick={() => setShowPromptForm(!showPromptForm)}>
                {showPromptForm ? "Hide" : "Edit"} System Prompt
              </button>
            </div>
          </div>
        </div>

        {showPromptForm && (
          <div className="card">
            <h3>System Prompt</h3>
            <form onSubmit={handleSavePrompt}>
              <div className="form-group">
                <label>Define your AI agent's behavior</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="You are a helpful customer support agent. Always be polite..."
                  style={{ minHeight: "150px" }}
                  required
                />
              </div>
              <button type="submit">Save Prompt</button>
            </form>
          </div>
        )}

        {showFileUpload && (
          <div className="card">
            <h3>📎 File Management</h3>

            <form onSubmit={handleFileUpload} style={{ marginBottom: "20px" }}>
              <div className="form-group">
                <label>Upload File (PDF, TXT, Code, Docs)</label>
                <input
                  type="file"
                  name="file"
                  accept=".pdf,.txt,.md,.json,.csv,.doc,.docx,.js,.py,.html,.css"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description (optional)</label>
                <input
                  type="text"
                  name="description"
                  placeholder="What is this file for?"
                />
              </div>
              <button type="submit" disabled={uploading}>
                {uploading ? "Uploading..." : "Upload File"}
              </button>
            </form>

            <h4>Uploaded Files ({files.length})</h4>
            {files.length === 0 ? (
              <p style={{ color: "#999" }}>No files uploaded yet</p>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {files.map((file) => (
                  <div
                    key={file._id}
                    style={{
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "5px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <strong>📄 {file.filename}</strong>
                      <div style={{ fontSize: "0.9em", color: "#666" }}>
                        {(file.size / 1024).toFixed(2)} KB • {file.mimeType}
                      </div>
                      {file.description && (
                        <div style={{ fontSize: "0.9em", fontStyle: "italic" }}>
                          {file.description}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteFile(file._id)}
                      style={{ background: "#dc3545" }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="card chat-container">
          <div className="messages">
            {messages.length === 0 ? (
              <p style={{ textAlign: "center", color: "#999" }}>
                No messages yet. Start a conversation!
              </p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id || msg._id} className={`message ${msg.role}`}>
                  <strong>{msg.role === "user" ? "You" : "AI"}:</strong>
                  <p>{msg.content}</p>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="message-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                prompt ? "Type your message..." : "Set a system prompt first"
              }
              disabled={sending || !prompt}
            />
            <button
              type="submit"
              disabled={sending || !prompt || !input.trim()}
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </form>

          {error && (
            <div className="error" style={{ padding: "10px" }}>
              {error}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Project;
