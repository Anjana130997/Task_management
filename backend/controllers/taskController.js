// taskController.js
// Handles task CRUD operations
import db from "../utils/db.js";

// Create task
export const createTask = async (req, res) => {
  const { title, description, status, priority, due_date, tags, assigned_to } = req.body;
  await db.read();

  const newTask = {
    id: Date.now().toString(),
    title,
    description,
    status: status || "pending",
    priority: priority || "medium",
    due_date,
    tags: tags || [],
    assigned_to: assigned_to || null,
    created_by: req.userId,
    deleted: false,
  };

  db.data.tasks.push(newTask);
  await db.write();
  res.status(201).json(newTask);
};

// Get all tasks
export const getTasks = async (req, res) => {
  await db.read();
  let tasks = db.data.tasks.filter(t => !t.deleted);

  const { status, search } = req.query;
  if (status) tasks = tasks.filter(t => t.status === status);
  if (search) tasks = tasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));

  res.json(tasks);
};

// Update task
export const updateTask = async (req, res) => {
  const { id } = req.params;
  await db.read();
  const task = db.data.tasks.find(t => t.id === id);
  if (!task) return res.status(404).json({ message: "Task not found" });

  Object.assign(task, req.body);
  await db.write();
  res.json(task);
};

// Soft delete task
export const deleteTask = async (req, res) => {
  const { id } = req.params;
  await db.read();
  const task = db.data.tasks.find(t => t.id === id);
  if (!task) return res.status(404).json({ message: "Task not found" });

  task.deleted = true;
  await db.write();
  res.json({ message: "Task deleted successfully" });
};
