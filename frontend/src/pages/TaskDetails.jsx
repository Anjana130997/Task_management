// src/pages/TaskDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";

export default function TaskDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();

  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);

  // -------------------- LOAD DATA --------------------
  const load = async () => {
    setLoading(true);
    try {
      // ✅ Make sure we're fetching comments from `/api/comments/:taskId`
      const [taskRes, commentsRes] = await Promise.all([
        api.getTask(id),
        api.getComments(id), // ✅ correct endpoint
      ]);
      setTask(taskRes.data);
      setComments(commentsRes.data || []);
    } catch (err) {
      console.error(err);
      alert("Could not load task details");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [id]);

  // -------------------- COMMENTS --------------------
  const addComment = async () => {
    if (!newComment.trim()) return;
    try {
      await api.addComment(id, {
        text: newComment,
        userName: user?.name || user?.email || "Anonymous",
      });
      setNewComment("");
      load();
    } catch (err) {
      console.error(err);
      alert("Failed to add comment");
    }
  };

  const startEdit = (comment) => setEditingComment({ ...comment });

  const saveEdit = async () => {
    try {
      await api.updateComment(editingComment.id, { text: editingComment.text });
      setEditingComment(null);
      load();
    } catch (err) {
      console.error(err);
      alert("Failed to update comment");
    }
  };

  const cancelEdit = () => setEditingComment(null);

  const deleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await api.deleteComment(commentId);
      load();
    } catch (err) {
      console.error(err);
      alert("Failed to delete comment");
    }
  };

  // -------------------- FILES --------------------
  const upload = async () => {
    if (!files.length) return alert("No files selected");
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    try {
      await api.uploadFiles(id, formData);
      setFiles([]);
      load();
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  const deleteFile = async (fileId) => {
    if (!window.confirm("Delete this file?")) return;
    try {
      await api.deleteFile(fileId);
      load();
    } catch (err) {
      console.error(err);
      alert("Failed to delete file");
    }
  };

  const downloadFile = async (fileId, name) => {
    try {
      const res = await api.downloadFile(fileId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", name);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error(err);
      alert("Failed to download file");
    }
  };

  // -------------------- RENDER --------------------
  if (loading) return <Loader />;
  if (!task) return <div className="empty">Task not found</div>;

  return (
    <div className="container">
      <button className="btn subtle" onClick={() => nav(-1)}>← Back</button>

      <h2>{task.title}</h2>
      <p className="muted">{task.description}</p>

      {/* FILE SECTION */}
      <div className="section">
        <h4>Attachments</h4>

        <div className="file-upload">
          <input
            type="file"
            multiple
            onChange={(e) => setFiles([...e.target.files])}
          />
          <button className="btn primary" onClick={upload}>Upload</button>
        </div>

        {task.files?.length ? (
          <ul className="file-list">
            {task.files.map((f) => (
              <li key={f.id} className="file-item">
                <span className="file-name">{f.originalName || f.name || f.file_name}</span>
                <div className="file-actions">
                  <button
                    className="btn small"
                    onClick={() => downloadFile(f.id, f.name || "file")}
                  >
                    Download
                  </button>
                  <button
                    className="btn danger small"
                    onClick={() => deleteFile(f.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="muted small">No files yet</div>
        )}
      </div>

      {/* COMMENTS SECTION */}
      <div className="section">
        <h4>Comments</h4>

        <div className="comment-form">
          <input
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button className="btn primary" onClick={addComment}>Post</button>
        </div>

        <ul className="comments">
          {comments.length ? (
            comments.map((c) => (
              <li key={c.id} className="comment-item">
                {editingComment && editingComment.id === c.id ? (
                  <div className="comment-edit">
                    <input
                      value={editingComment.text}
                      onChange={(e) =>
                        setEditingComment({ ...editingComment, text: e.target.value })
                      }
                    />
                    <div className="comment-actions">
                      <button className="btn primary small" onClick={saveEdit}>Save</button>
                      <button className="btn subtle small" onClick={cancelEdit}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="comment-text">{c.text}</div>
                    <div className="comment-meta">
                      By <strong>{c.authorName || c.userName || "Anonymous"}</strong>
                    </div>
                    <div className="comment-actions">
                      <button className="btn small" onClick={() => startEdit(c)}>Edit</button>
                      <button className="btn danger small" onClick={() => deleteComment(c.id)}>Delete</button>
                    </div>
                  </div>
                )}
              </li>
            ))
          ) : (
            <div className="muted small">No comments yet</div>
          )}
        </ul>
      </div>
    </div>
  );
}
