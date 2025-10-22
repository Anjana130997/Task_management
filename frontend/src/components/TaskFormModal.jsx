import React, { useState, useEffect } from "react";

export default function TaskFormModal({ initial = null, onClose, onSave }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "todo",
    due_date: "",
    tags: "",
    assigned_to: ""
  });

  useEffect(() => {
    if (initial) {
      setForm({
        ...initial,
        tags: (initial.tags || []).join(", ")
      });
    }
  }, [initial]);

  const handleSave = () => {
    const payload = {
      ...form,
      tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : []
    };
    onSave(payload);
  };

  return (
    <div className="modal">
      <div className="modal-card">
        <h3>{initial ? "Edit Task" : "New Task"}</h3>
        <input placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
        <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
        <div className="row">
          <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
            <option value="todo">Todo</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
        <input type="date" value={form.due_date || ""} onChange={e => setForm({...form, due_date: e.target.value})} />
        <input placeholder="Tags (comma separated)" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} />
        <div className="modal-actions">
          <button className="btn" onClick={handleSave}>{initial ? "Update" : "Create"}</button>
          <button className="btn subtle" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
