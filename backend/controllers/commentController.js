// controllers/commentController.js
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import db from "../data/db.json" assert { type: "json" };

const DB_PATH = "./data/db.json";

/**
 * 🔹 Utility to persist DB changes
 */
function saveDB() {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

/**
 * 🔹 Create a new comment
 */
export const addComment = (req, res) => {
  const { taskId, text } = req.body;
  const userId = req.user?.id;

  const user = db.users.find((u) => u.id === userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  const newComment = {
    id: uuidv4(),
    taskId,
    author: user.id,
    authorName: user.name, // ✅ include author name
    text,
    createdAt: new Date().toISOString(),
    deleted: false,
  };

  db.comments.push(newComment);

  // Attach comment to task
  const task = db.tasks.find((t) => t.id === taskId);
  if (task) {
    task.comments = task.comments || [];
    task.comments.push(newComment.id);
  }

  saveDB();
  res.status(201).json(newComment);
};

/**
 * 🔹 Get all comments for a task
 */
export const getCommentsByTask = (req, res) => {
  const { taskId } = req.params;

  const comments = db.comments
    .filter((c) => c.taskId === taskId && !c.deleted)
    .map((c) => ({
      ...c,
      authorName:
        db.users.find((u) => u.id === c.author)?.name || "Anonymous", // ✅ populate name
    }));

  res.json(comments);
};

/**
 * 🔹 Update a comment
 */
export const updateComment = (req, res) => {
  const { commentId } = req.params;
  const { text } = req.body;
  const userId = req.user?.id;

  const comment = db.comments.find((c) => c.id === commentId);
  if (!comment) return res.status(404).json({ message: "Comment not found" });

  if (comment.author !== userId)
    return res.status(403).json({ message: "Unauthorized" });

  comment.text = text || comment.text;
  comment.updatedAt = new Date().toISOString();

  saveDB();
  res.json(comment);
};

/**
 * 🔹 Delete a comment (soft delete)
 */
export const deleteComment = (req, res) => {
  const { commentId } = req.params;
  const userId = req.user?.id;

  const comment = db.comments.find((c) => c.id === commentId);
  if (!comment) return res.status(404).json({ message: "Comment not found" });

  if (comment.author !== userId)
    return res.status(403).json({ message: "Unauthorized" });

  comment.deleted = true;
  comment.deletedAt = new Date().toISOString();

  saveDB();
  res.json({ message: "Comment deleted successfully" });
};
