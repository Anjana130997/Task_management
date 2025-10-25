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

  // Separate filter inputs (typed values) vs applied filters (used in API)
  const [filterInputs, setFilterInputs] = useState({
    search: "",
    status: "",
    priority: "",
  });
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    priority: "",
  });

  const [confirm, setConfirm] = useState({ show: false, id: null });

  // 🔹 Fetch tasks
  const fetchTasks = async (page = meta.page, activeFilters = filters) => {
    setLoading(true);
    try {
      const params = { page, limit: meta.limit, ...activeFilters };
      const res = await api.getTasks(params);
      const data = res.data;

      setTasks(data.tasks || data || []);
      setMeta(
        data.meta || {
          total: (data.tasks || data || []).length,
          page,
          limit: meta.limit,
        }
      );
    } catch (err) {
      console.error("❌ Fetch error:", err);
      alert("Could not load tasks");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch whenever filters or page change
  useEffect(() => {
    fetchTasks(meta.page);
    // eslint-disable-next-line
  }, [filters, meta.page]);

  const openCreate = () => {
    setEditTask(null);
    setOpenForm(true);
  };

  const handleSave = async (payload) => {
    try {
      let newTask;
      if (editTask) {
        const res = await api.updateTask(editTask.id, payload);
        newTask = res.data;
        setTasks((prev) => prev.map((t) => (t.id === editTask.id ? newTask : t)));
      } else {
        const res = await api.createTask(payload);
        newTask = res.data;
        setTasks((prev) => [newTask, ...prev]);
      }
      setOpenForm(false);
      setEditTask(null);
    } catch (err) {
      console.error("❌ Save error:", err);
      alert("Error saving task");
    }
  };

  const handleEdit = (task) => {
    setEditTask(task);
    setOpenForm(true);
  };

  const handleDelete = (id) => setConfirm({ show: true, id });

  const confirmDelete = async () => {
    try {
      await api.deleteTask(confirm.id);
      setConfirm({ show: false, id: null });
      setTasks((prev) => prev.filter((t) => t.id !== confirm.id));
    } catch (err) {
      console.error("❌ Delete error:", err);
      alert("Could not delete task");
    }
  };

  // 🔹 Apply button handler
  const applyFilters = () => {
    setFilters(filterInputs);
    setMeta((m) => ({ ...m, page: 1 })); // reset to first page
  };

  if (loading) return <Loader />;

  return (
    <div className="container page">
      <div className="page-head">
        <h2>Tasks</h2>
        <div>
          <button className="btn primary" onClick={openCreate}>
            New Task
          </button>
        </div>
      </div>

      {/* 🔹 Filters Section */}
      <div className="filters">
        <input
          placeholder="Search tasks..."
          value={filterInputs.search}
          onChange={(e) =>
            setFilterInputs({ ...filterInputs, search: e.target.value })
          }
        />

        <select
          value={filterInputs.status}
          onChange={(e) =>
            setFilterInputs({ ...filterInputs, status: e.target.value })
          }
        >
          <option value="">All status</option>
          <option value="todo">To do</option>
          <option value="in-progress">In progress</option>
          <option value="done">Done</option>
        </select>

        <select
          value={filterInputs.priority}
          onChange={(e) =>
            setFilterInputs({ ...filterInputs, priority: e.target.value })
          }
        >
          <option value="">All priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <button className="btn subtle" onClick={applyFilters}>
          Apply
        </button>
      </div>

      {/* 🔹 Task Grid */}
      <div className="grid">
        {tasks.length ? (
          tasks.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))
        ) : (
          <div className="empty">No tasks found</div>
        )}
      </div>

      {/* 🔹 Pagination */}
      <div className="pagination">
        <button
          className="btn subtle"
          disabled={meta.page === 1}
          onClick={() =>
            setMeta((m) => ({ ...m, page: Math.max(1, m.page - 1) }))
          }
        >
          Prev
        </button>
        <span>Page {meta.page}</span>
        <button
          className="btn subtle"
          onClick={() => setMeta((m) => ({ ...m, page: m.page + 1 }))}
        >
          Next
        </button>
      </div>

      {/* 🔹 Modals */}
      {openForm && (
        <TaskFormModal
          initial={editTask}
          onClose={() => setOpenForm(false)}
          onSave={handleSave}
        />
      )}

      {confirm.show && (
        <Confirm
          message="Delete this task?"
          onConfirm={confirmDelete}
          onCancel={() => setConfirm({ show: false, id: null })}
        />
      )}
    </div>
  );
}
