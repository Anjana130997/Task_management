// src/components/TaskCard.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function TaskCard({ task, onDelete, onEdit }) {
  return (
    <div className="card task-card">
      <div className="task-top">
        <h4>{task.title}</h4>
        <div className="badges">
          <span className={`badge ${task.priority}`}>{task.priority}</span>
          <span className="badge status">{task.status}</span>
        </div>
      </div>
      <p className="muted">{task.description || "No description"}</p>
      <div className="task-actions">
        <Link to={`/task/${task.id}`} className="btn subtle">Open</Link>
        <button className="btn" onClick={() => onEdit && onEdit(task)}>Edit</button>
        <button className="btn danger" onClick={() => onDelete(task.id)}>Delete</button>
      </div>
    </div>
  );
}
