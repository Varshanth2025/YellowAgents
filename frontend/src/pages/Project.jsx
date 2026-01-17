import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  getProject,
  getPrompt,
  createOrUpdatePrompt,
  sendMessage,
  getChatHistory,
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
      const [projectRes, historyRes] = await Promise.all([
        getProject(id),
        getChatHistory(id, sessionId),
      ]);

      setProject(projectRes.data.data);
      setMessages(historyRes.data.data);

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
            <button onClick={() => setShowPromptForm(!showPromptForm)}>
              {showPromptForm ? "Hide" : "Edit"} System Prompt
            </button>
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
