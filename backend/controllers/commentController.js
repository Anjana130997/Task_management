// commentController.js
// Handles adding, updating, deleting, and fetching comments for tasks
import db from "../utils/db.js";

// Add a comment to a task
export const addComment = async (req, res) => {
  const { taskId, content } = req.body;
  if (!taskId || !content) return res.status(400).json({ message: "Task ID and content required" });

  await db.read();
  const task = db.data.tasks.find(t => t.id === taskId && !t.deleted);
  if (!task) return res.status(404).json({ message: "Task not found" });

  const newComment = {
    id: Date.now().toString(),
    taskId,
    userId: req.userId,
    content,
    created_at: new Date().toISOString(),
  };

  db.data.comments.push(newComment);
  await db.write();
  res.status(201).json(newComment);
};

// Get all comments for a task
export const getComments = async (req, res) => {
  const { taskId } = req.params;
  await db.read();

  const comments = db.data.comments.filter(c => c.taskId === taskId);
  res.json(comments);
};

// Update a comment
export const updateComment = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: "Content is required" });

  await db.read();
  const comment = db.data.comments.find(c => c.id === id && c.userId === req.userId);
  if (!comment) return res.status(404).json({ message: "Comment not found" });

  comment.content = content;
  await db.write();
  res.json(comment);
};

// Delete a comment
export const deleteComment = async (req, res) => {
  const { id } = req.params;
  await db.read();

  const index = db.data.comments.findIndex(c => c.id === id && c.userId === req.userId);
  if (index === -1) return res.status(404).json({ message: "Comment not found" });

  db.data.comments.splice(index, 1);
  await db.write();
  res.json({ message: "Comment deleted successfully" });
};
