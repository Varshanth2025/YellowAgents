import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Auth
export const register = (data) => api.post("/auth/register", data);
export const login = (data) => api.post("/auth/login", data);
export const getMe = () => api.get("/auth/me");

// Projects
export const getProjects = () => api.get("/projects");
export const getProject = (id) => api.get(`/projects/${id}`);
export const createProject = (data) => api.post("/projects", data);
export const deleteProject = (id) => api.delete(`/projects/${id}`);

// Prompts
export const getPrompt = (projectId) =>
  api.get(`/projects/${projectId}/prompt`);
export const createOrUpdatePrompt = (projectId, data) =>
  api.post(`/projects/${projectId}/prompt`, data);

// Chat
export const sendMessage = (projectId, data) =>
  api.post(`/chat/${projectId}`, data);
export const getChatHistory = (projectId, sessionId) =>
  api.get(`/chat/${projectId}/history?sessionId=${sessionId || ""}`);

// Files
export const uploadFile = (projectId, formData) =>
  api.post(`/projects/${projectId}/files`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
export const getProjectFiles = (projectId) =>
  api.get(`/projects/${projectId}/files`);
export const getFile = (projectId, fileId) =>
  api.get(`/projects/${projectId}/files/${fileId}`);
export const deleteFile = (projectId, fileId) =>
  api.delete(`/projects/${projectId}/files/${fileId}`);

export default api;
