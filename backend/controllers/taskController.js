// taskController.js
// Handles task CRUD operations using lowdb

import db from "../utils/db.js";

// ---------------- CREATE TASK ----------------
export const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      due_date,
      tags,
      assigned_to,
    } = req.body;

    await db.read();

    const newTask = {
      id: Date.now().toString(),         // unique task ID
      title,
      description,
      status: status || "pending",       // default status
      priority: priority || "medium",    // default priority
      due_date,
      tags: tags || [],
      assigned_to: assigned_to || null,
      created_by: req.userId,            // from JWT middleware
      deleted: false,                    // soft delete flag
      files: req.files                  // handle uploaded files (if any)
        ? req.files.map((f) => f.filename)
        : [],
      created_at: new Date().toISOString(),
    };

    db.data.tasks.push(newTask);
    await db.write();

    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: "Error creating task", error: error.message });
  }
};

// ---------------- GET TASKS ----------------
export const getTasks = async (req, res) => {
  try {
    await db.read();
    let tasks = db.data.tasks.filter((t) => !t.deleted);

    // Optional filtering by query parameters
    const { status, search } = req.query;
    if (status) tasks = tasks.filter((t) => t.status === status);
    if (search)
      tasks = tasks.filter((t) =>
        t.title.toLowerCase().includes(search.toLowerCase())
      );

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks", error: error.message });
  }
};

// ---------------- UPDATE TASK ----------------
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    await db.read();

    const task = db.data.tasks.find((t) => t.id === id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Merge new uploaded files (if any)
    if (req.files && req.files.length > 0) {
      task.files = [...(task.files || []), ...req.files.map((f) => f.filename)];
    }

    // Merge updated fields
    Object.assign(task, req.body);

    await db.write();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Error updating task", error: error.message });
  }
};

// ---------------- DELETE TASK (SOFT DELETE) ----------------
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    await db.read();

    const task = db.data.tasks.find((t) => t.id === id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.deleted = true;
    await db.write();

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting task", error: error.message });
  }
};
