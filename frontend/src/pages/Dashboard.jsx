import React, { useEffect, useState } from "react";
import api from "../api/api";
import TaskCard from "../components/TaskCard";
import Loader from "../components/Loader";
import TaskFormModal from "../components/TaskFormModal";
import Confirm from "../components/Confirm";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 8 });
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [filters, setFilters] = useState({ search: "", status: "", priority: "" });
  const [confirm, setConfirm] = useState({ show: false, id: null });

  const fetchTasks = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.getTasks({ page, limit: meta.limit, ...filters });
      setTasks(res.data.tasks);
      setMeta(res.data.meta || { total: res.data.length || res.data.tasks?.length || 0, page, limit: meta.limit });
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks(1);
    // eslint-disable-next-line
  }, []);

  const openCreate = () => {
    setEditTask(null);
    setOpenForm(true);
  };

  const handleSave = async (payload) => {
    try {
      if (editTask) {
        await api.updateTask(editTask.id, payload);
      } else {
        await api.createTask(payload);
      }
      setOpenForm(false);
      fetchTasks(1);
    } catch (err) {
      console.error(err);
      alert("Error saving task");
    }
  };

  const handleDelete = (id) => setConfirm({ show: true, id });

  const confirmDelete = async () => {
    try {
      await api.deleteTask(confirm.id);
      setConfirm({ show: false, id: null });
      fetchTasks(meta.page);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="container page">
      <div className="page-head">
        <h2>Tasks</h2>
        <div>
          <button className="btn primary" onClick={openCreate}>New Task</button>
        </div>
      </div>

      <div className="filters">
        <input placeholder="Search..." value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} />
        <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
          <option value="">All status</option>
          <option value="todo">To do</option>
          <option value="in-progress">In progress</option>
          <option value="done">Done</option>
        </select>

        <select value={filters.priority} onChange={e => setFilters({...filters, priority: e.target.value})}>
          <option value="">All priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <button className="btn subtle" onClick={() => fetchTasks(1)}>Apply</button>
      </div>

      <div className="grid">
        {tasks.length ? tasks.map(t => <TaskCard key={t.id} task={t} onDelete={handleDelete} />) : <div className="empty">No tasks yet</div>}
      </div>

      <div className="pagination">
        <button className="btn subtle" onClick={() => fetchTasks(Math.max(1, meta.page - 1))}>Prev</button>
        <span>Page {meta.page}</span>
        <button className="btn subtle" onClick={() => fetchTasks(meta.page + 1)}>Next</button>
      </div>

      {openForm && <TaskFormModal initial={editTask} onClose={() => setOpenForm(false)} onSave={handleSave} />}

      {confirm.show && <Confirm message="Delete this task?" onConfirm={confirmDelete} onCancel={() => setConfirm({ show: false, id: null })} />}
    </div>
  );
}
