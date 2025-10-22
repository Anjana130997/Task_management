// controllers/commentController.js
import db from "../utils/db.js";
import { randomUUID } from "crypto";

// Add comment to task
export const addComment = async (req, res) => {
  const { taskId } = req.params;
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: "Text required" });

  await db.read();
  const task = db.data.tasks.find((t) => t.id === taskId && !t.deleted);
  if (!task) return res.status(404).json({ message: "Task not found" });

  const comment = { id: randomUUID(), taskId, author: req.userId, text, createdAt: new Date().toISOString(), deleted: false };
  db.data.comments.push(comment);
  task.comments = task.comments || [];
  task.comments.push(comment.id);
  await db.write();
  res.status(201).json(comment);
};

// Get comments for a task
export const getCommentsByTask = async (req, res) => {
  const { taskId } = req.params;
  await db.read();
  const comments = db.data.comments.filter((c) => c.taskId === taskId && !c.deleted);
  res.json(comments);
};

// Update comment
export const updateComment = async (req, res) => {
  const { commentId } = req.params;
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: "Text required" });

  await db.read();
  const idx = db.data.comments.findIndex((c) => c.id === commentId && !c.deleted);
  if (idx === -1) return res.status(404).json({ message: "Comment not found" });
  const comment = db.data.comments[idx];
  if (comment.author !== req.userId) return res.status(403).json({ message: "Not allowed" });

  comment.text = text;
  comment.updatedAt = new Date().toISOString();
  db.data.comments[idx] = comment;
  await db.write();
  res.json(comment);
};

// Delete comment (soft)
export const deleteComment = async (req, res) => {
  const { commentId } = req.params;
  await db.read();
  const idx = db.data.comments.findIndex((c) => c.id === commentId && !c.deleted);
  if (idx === -1) return res.status(404).json({ message: "Comment not found" });
  const comment = db.data.comments[idx];
  if (comment.author !== req.userId) return res.status(403).json({ message: "Not allowed" });

  comment.deleted = true;
  await db.write();
  res.json({ message: "Comment deleted" });
};
