// controllers/taskController.js
import db from "../utils/db.js";
import { randomUUID } from "crypto";

// Create task (files already saved by multer; metadata handled by upload route)
export const createTask = async (req, res) => {
  const { title, description = "", status = "todo", priority = "medium", due_date = null, tags = [], assigned_to = null } = req.body;
  if (!title) return res.status(400).json({ message: "Title is required" });

  await db.read();
  const task = {
    id: randomUUID(),
    title,
    description,
    status,
    priority,
    due_date,
    tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
    assigned_to,
    files: [], // file ids will be added by the upload handler route
    comments: [],
    createdBy: req.userId,
    createdAt: new Date().toISOString(),
    deleted: false
  };
  db.data.tasks.push(task);
  await db.write();
  res.status(201).json(task);
};

// Bulk create tasks from an array
export const bulkCreateTasks = async (req, res) => {
  const tasksArr = Array.isArray(req.body) ? req.body : [];
  if (!tasksArr.length) return res.status(400).json({ message: "Array of tasks required" });

  await db.read();
  const created = tasksArr.map((t) => {
    const task = {
      id: randomUUID(),
      title: t.title || "Untitled",
      description: t.description || "",
      status: t.status || "todo",
      priority: t.priority || "medium",
      due_date: t.due_date || null,
      tags: Array.isArray(t.tags) ? t.tags : [],
      assigned_to: t.assigned_to || null,
      files: [],
      comments: [],
      createdBy: req.userId,
      createdAt: new Date().toISOString(),
      deleted: false
    };
    db.data.tasks.push(task);
    return task;
  });
  await db.write();
  res.status(201).json({ created });
};

// Helper to apply search/filter/sort/pagination
const parseSort = (sort) => {
  if (!sort) return null;
  const [field, dir] = sort.split(":");
  return { field, dir: dir === "desc" ? "desc" : "asc" };
};

export const getAllTasks = async (req, res) => {
  await db.read();
  let tasks = db.data.tasks.filter((t) => !t.deleted);

  const { search, status, priority, tag, assigned_to, page = 1, limit = 10, sort } = req.query;
  if (search) {
    const q = search.toLowerCase();
    tasks = tasks.filter((t) => (t.title || "").toLowerCase().includes(q) || (t.description || "").toLowerCase().includes(q));
  }
  if (status) tasks = tasks.filter((t) => t.status === status);
  if (priority) tasks = tasks.filter((t) => t.priority === priority);
  if (tag) tasks = tasks.filter((t) => Array.isArray(t.tags) && t.tags.includes(tag));
  if (assigned_to) tasks = tasks.filter((t) => t.assigned_to === assigned_to);

  const s = parseSort(sort);
  if (s) {
    tasks.sort((a, b) => {
      const av = a[s.field] || "";
      const bv = b[s.field] || "";
      if (av < bv) return s.dir === "asc" ? -1 : 1;
      if (av > bv) return s.dir === "asc" ? 1 : -1;
      return 0;
    });
  }

  const p = Math.max(parseInt(page, 10), 1);
  const l = Math.max(parseInt(limit, 10), 1);
  const start = (p - 1) * l;
  const paginated = tasks.slice(start, start + l);

  res.json({ tasks: paginated, meta: { total: tasks.length, page: p, limit: l } });
};

export const getTaskById = async (req, res) => {
  const { id } = req.params;
  await db.read();
  const task = db.data.tasks.find((t) => t.id === id && !t.deleted);
  if (!task) return res.status(404).json({ message: "Task not found" });

  // include comments and files
  const comments = db.data.comments.filter((c) => c.taskId === id && !c.deleted);
  const files = db.data.files.filter((f) => f.taskId === id);
  res.json({ ...task, comments, files });
};

export const updateTask = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  await db.read();
  const idx = db.data.tasks.findIndex((t) => t.id === id && !t.deleted);
  if (idx === -1) return res.status(404).json({ message: "Task not found" });

  const old = db.data.tasks[idx];
  if (updates.status && updates.status === "done" && old.status !== "done") {
    old.completedAt = new Date().toISOString();
  }
  Object.assign(old, updates);
  db.data.tasks[idx] = old;
  await db.write();
  res.json(old);
};

export const deleteTask = async (req, res) => {
  const { id } = req.params;
  await db.read();
  const idx = db.data.tasks.findIndex((t) => t.id === id && !t.deleted);
  if (idx === -1) return res.status(404).json({ message: "Task not found" });
  db.data.tasks[idx].deleted = true;
  await db.write();
  res.json({ message: "Task soft-deleted" });
};

// Route helper: handle file uploads attached to a task (to be used in route)
export const addFilesToTask = async (req, res) => {
  const { id } = req.params; // task id
  await db.read();
  const task = db.data.tasks.find((t) => t.id === id && !t.deleted);
  if (!task) return res.status(404).json({ message: "Task not found" });

  // req.files is an array (multer)
  const files = req.files || [];
  const saved = files.map((f) => {
    const fileMeta = {
      id: randomUUID(),
      taskId: id,
      originalName: f.originalname,
      storedName: f.filename,
      path: `/uploads/${f.filename}`,
      mimetype: f.mimetype,
      size: f.size,
      uploadedBy: req.userId,
      createdAt: new Date().toISOString()
    };
    db.data.files.push(fileMeta);
    // link to task
    task.files = task.files || [];
    task.files.push(fileMeta.id);
    return fileMeta;
  });

  await db.write();
  res.status(201).json({ files: saved });
};
