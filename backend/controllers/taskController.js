import db from "../utils/db.js";

// Create task
export const createTask = async (req, res) => {
  const { title, description, status, priority, due_date, tags, assigned_to } =
    req.body;

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
    files: req.files ? req.files.map(f => f.filename) : [],
  };
  db.data.tasks.push(newTask);
  await db.write();
  res.status(201).json(newTask);
};

// Bulk create tasks
export const bulkCreateTasks = async (req, res) => {
  const tasks = req.body.tasks;
  if (!tasks || !Array.isArray(tasks))
    return res.status(400).json({ message: "Array of tasks required" });

  await db.read();
  const newTasks = tasks.map(task => ({
    id: Date.now().toString() + Math.floor(Math.random() * 1000),
    title: task.title,
    description: task.description,
    status: task.status || "pending",
    priority: task.priority || "medium",
    due_date: task.due_date,
    tags: task.tags || [],
    assigned_to: task.assigned_to || null,
    created_by: req.userId,
    deleted: false,
    files: [],
  }));

  db.data.tasks.push(...newTasks);
  await db.write();
  res.status(201).json(newTasks);
};

// Get all tasks
export const getTasks = async (req, res) => {
  await db.read();
  let tasks = db.data.tasks.filter(t => !t.deleted);
  const { status, search } = req.query;
  if (status) tasks = tasks.filter(t => t.status === status);
  if (search)
    tasks = tasks.filter(t =>
      t.title.toLowerCase().includes(search.toLowerCase())
    );
  res.json(tasks);
};

// Get single task
export const getTaskById = async (req, res) => {
  const { id } = req.params;
  await db.read();
  const task = db.data.tasks.find(t => t.id === id && !t.deleted);
  if (!task) return res.status(404).json({ message: "Task not found" });
  res.json(task);
};

// Update task
export const updateTask = async (req, res) => {
  const { id } = req.params;
  await db.read();
  const task = db.data.tasks.find(t => t.id === id && !t.deleted);
  if (!task) return res.status(404).json({ message: "Task not found" });

  if (req.files) task.files.push(...req.files.map(f => f.filename));
  Object.assign(task, req.body);
  await db.write();
  res.json(task);
};

// Delete task (soft)
export const deleteTask = async (req, res) => {
  const { id } = req.params;
  await db.read();
  const task = db.data.tasks.find(t => t.id === id);
  if (!task) return res.status(404).json({ message: "Task not found" });

  task.deleted = true;
  await db.write();
  res.json({ message: "Task deleted" });
};

// Delete specific file from task
export const deleteTaskFile = async (req, res) => {
  const { taskId, filename } = req.params;
  await db.read();
  const task = db.data.tasks.find(t => t.id === taskId && !t.deleted);
  if (!task) return res.status(404).json({ message: "Task not found" });

  task.files = task.files.filter(f => f !== filename);
  await db.write();
  res.json({ message: "File deleted" });
};
