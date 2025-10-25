// src/api/api.js
import axios from "axios";

export const BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
  withCredentials: false
});

api.interceptors.request.use(
  (config) => {
    try {
      const auth = localStorage.getItem("auth");
      if (auth) {
        const { token } = JSON.parse(auth);
        if (token) config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // ignore
    }
    return config;
  },
  (err) => Promise.reject(err)
);

export default {
  // 🔹 Auth
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  me: () => api.get("/auth/profile"),

  // 🔹 Tasks
  createTask: (data) => api.post("/tasks", data),
  getTasks: (params) => api.get("/tasks", { params }),
  getTask: (id) => api.get(`/tasks/${id}`),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),

  // 🔹 File Uploads
  uploadFiles: (id, formData) =>
    api.post(`/tasks/${id}/files`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    }),

  deleteFile: (fileId) => api.delete(`/files/${fileId}`),

  downloadFile: (fileId) =>
    api.get(`/files/${fileId}/download`, { responseType: "blob" }),

  // 🔹 Comments (fixed)
addComment: (taskId, data) => api.post(`/comments/${taskId}`, data),
getComments: (taskId) => api.get(`/comments/${taskId}`),
updateComment: (commentId, data) => api.put(`/comments/${commentId}`, data),
deleteComment: (commentId) => api.delete(`/comments/${commentId}`),


  // 🔹 Analytics
  overview: () => api.get("/analytics/overview"),
  performance: (params) => api.get("/analytics/performance", { params }),
  trends: (params) => api.get("/analytics/trends", { params }),
  exportTasks: () => api.get("/analytics/export")
};
