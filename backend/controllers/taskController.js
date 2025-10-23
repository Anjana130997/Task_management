// controllers/taskController.js
import db from "../utils/db.js";
import { v4 as uuidv4 } from "uuid";
import { sanitizeString } from "../utils/sanitize.js";
import fs from "fs";
import path from "path";

// Helper to parse tags (allow "a,b" or array)
const parseTags = (tags) => {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.map((t) => sanitizeString(t));
  return String(tags).split(",").map((t) => sanitizeString(t.trim())).filter(Boolean);
};

// Create task - user-based (createdBy = req.userId)
export const createTask = async (req, res, next) => {
  try {
    const title = sanitizeString(req.body.title);
    if (!title) return res.status(400).json({ message: "Title is required" });

    const description = sanitizeString(req.body.description || "");
    const status = sanitizeString(req.body.status || "todo");
    const priority = sanitizeString(req.body.priority || "medium");
    const due_date = req.body.due_date || null;
    const tags = parseTags(req.body.tags);
    const assigned_to = req.body.assigned_to || null;

    await db.read();
    const task = {
      id: uuidv4(),
      title,
      description,
      status,
      priority,
      due_date,
      tags,
      assigned_to,
      files: [],
      comments: [],
      createdBy: req.userId,
      createdAt: new Date().toISOString(),
      deleted: false
    };
    db.data.tasks.push(task);
    await db.write();
    res.status(201).json(task);
  } catch (err) { next(err); }
};

// Bulk create - all tasks will be createdBy req.userId
export const bulkCreateTasks = async (req, res, next) => {
  try {
    const arr = Array.isArray(req.body) ? req.body : [];
    if (!arr.length) return res.status(400).json({ message: "Array of tasks required" });

    await db.read();
    const created = arr.map((t) => {
      const task = {
        id: uuidv4(),
        title: sanitizeString(t.title || "Untitled"),
        description: sanitizeString(t.description || ""),
        status: sanitizeString(t.status || "todo"),
        priority: sanitizeString(t.priority || "medium"),
        due_date: t.due_date || null,
        tags: parseTags(t.tags),
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
  } catch (err) { next(err); }
};

// List tasks - for current user only (createdBy or assigned_to)
const parseSort = (sort) => {
  if (!sort) return null;
  const [field, dir] = sort.split(":");
  return { field, dir: dir === "desc" ? "desc" : "asc" };
};

export const getAllTasks = async (req, res, next) => {
  try {
    await db.read();
    const all = db.data.tasks.filter((t) => !t.deleted);
    // only show tasks where current user is creator or assignee
    const userId = req.userId;
    let tasks = all.filter((t) => t.createdBy === userId || t.assigned_to === userId);

    const { search, status, priority, tag, page = 1, limit = 10, sort } = req.query;
    if (search) {
      const q = String(search).toLowerCase();
      tasks = tasks.filter((t) => (t.title || "").toLowerCase().includes(q) || (t.description || "").toLowerCase().includes(q));
    }
    if (status) tasks = tasks.filter((t) => t.status === status);
    if (priority) tasks = tasks.filter((t) => t.priority === priority);
    if (tag) tasks = tasks.filter((t) => Array.isArray(t.tags) && t.tags.includes(tag));

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
  } catch (err) { next(err); }
};

// Get single task (only if user is creator or assignee)
export const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.read();
    const task = db.data.tasks.find((t) => t.id === id && !t.deleted);
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (!(task.createdBy === req.userId || task.assigned_to === req.userId)) return res.status(403).json({ message: "Not allowed" });

    const comments = db.data.comments.filter((c) => c.taskId === id && !c.deleted);
    const files = db.data.files.filter((f) => f.taskId === id && !f.deleted);
    res.json({ ...task, comments, files });
  } catch (err) { next(err); }
};

// Update task - only creator or assignee
export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.read();
    const idx = db.data.tasks.findIndex((t) => t.id === id && !t.deleted);
    if (idx === -1) return res.status(404).json({ message: "Task not found" });

    const task = db.data.tasks[idx];
    if (!(task.createdBy === req.userId || task.assigned_to === req.userId)) return res.status(403).json({ message: "Not allowed" });

    const updates = req.body || {};

    // if marking done, set completedAt if not present
    if (updates.status && updates.status === "done" && task.status !== "done") {
      task.completedAt = new Date().toISOString();
    }

    if (updates.title) task.title = sanitizeString(updates.title);
    if (updates.description !== undefined) task.description = sanitizeString(updates.description);
    if (updates.status) task.status = sanitizeString(updates.status);
    if (updates.priority) task.priority = sanitizeString(updates.priority);
    if (updates.due_date !== undefined) task.due_date = updates.due_date;
    if (updates.tags !== undefined) task.tags = parseTags(updates.tags);
    if (updates.assigned_to !== undefined) task.assigned_to = updates.assigned_to;

    task.updatedAt = new Date().toISOString();
    db.data.tasks[idx] = task;
    await db.write();
    res.json(task);
  } catch (err) { next(err); }
};

// Soft delete - only creator
export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.read();
    const idx = db.data.tasks.findIndex((t) => t.id === id && !t.deleted);
    if (idx === -1) return res.status(404).json({ message: "Task not found" });

    const task = db.data.tasks[idx];
    if (task.createdBy !== req.userId) return res.status(403).json({ message: "Only creator can delete" });

    task.deleted = true;
    task.deletedAt = new Date().toISOString();
    db.data.tasks[idx] = task;
    await db.write();
    res.json({ message: "Task deleted" });
  } catch (err) { next(err); }
};

// Add files to task (multer saved to disk)
export const addFilesToTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.read();
    const task = db.data.tasks.find((t) => t.id === id && !t.deleted);
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (!(task.createdBy === req.userId || task.assigned_to === req.userId)) return res.status(403).json({ message: "Not allowed" });

    const files = req.files || [];
    const saved = files.map((f) => {
      const meta = {
        id: uuidv4(),
        taskId: id,
        originalName: f.originalname,
        storedName: f.filename,
        path: `/uploads/${f.filename}`,
        mimetype: f.mimetype,
        size: f.size,
        uploadedBy: req.userId,
        createdAt: new Date().toISOString(),
        deleted: false
      };
      db.data.files.push(meta);
      task.files = task.files || [];
      task.files.push(meta.id);
      return meta;
    });

    await db.write();
    res.status(201).json({ files: saved });
  } catch (err) { next(err); }
};
