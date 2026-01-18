import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getProjects, createProject, deleteProject } from "../services/api";
const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    fetchProjects();
  }, []);
  const fetchProjects = async () => {
    try {
      const response = await getProjects();
      setProjects(response.data.data);
    } catch (err) {
      setError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };
  const handleCreateProject = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createProject({ name, description });
      setName("");
      setDescription("");
      setShowForm(false);
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create project");
    }
  };
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteProject(id);
        fetchProjects();
      } catch (err) {
        setError("Failed to delete project");
      }
    }
  };
  if (loading) return <div>Loading...</div>;
  return (
    <>
      <Navbar />
      <div className="container">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h1>My AI Agents</h1>
          <button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Create New Agent"}
          </button>
        </div>
        {showForm && (
          <div className="card">
            <h3>Create New AI Agent</h3>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label>Agent Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Customer Support Bot"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does this agent do?"
                />
              </div>
              <button type="submit">Create Agent</button>
              {error && <div className="error">{error}</div>}
            </form>
          </div>
        )}
        {projects.length === 0 ? (
          <div className="card">
            <p>No AI agents yet. Create your first one!</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "20px" }}>
            {projects.map((project) => (
              <div key={project._id} className="card">
                <h3>{project.name}</h3>
                <p>{project.description || "No description"}</p>
                <div
                  style={{ marginTop: "15px", display: "flex", gap: "10px" }}
                >
                  <Link to={`/project/${project._id}`}>
                    <button>Open Chat</button>
                  </Link>
                  <button
                    onClick={() => handleDelete(project._id)}
                    style={{ background: "#dc3545" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
export default Dashboard;