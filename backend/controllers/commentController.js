// controllers/commentController.js
import { v4 as uuidv4 } from "uuid";
import db from "../utils/db.js"; // ✅ LowDB instance

/**
 * 🔹 Create a new comment
 */
export const addComment = async (req, res, next) => {
  try {
    const { taskId, text } = req.body;
    const userId = req.userId; // ✅ consistent with your auth middleware

    await db.read();

    db.data.users = db.data.users || [];
    db.data.comments = db.data.comments || [];
    db.data.tasks = db.data.tasks || [];

    const user = db.data.users.find((u) => u.id === userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const newComment = {
      id: uuidv4(),
      taskId,
      author: user.id,
      authorName: user.name,
      text,
      createdAt: new Date().toISOString(),
      deleted: false,
    };

    db.data.comments.push(newComment);

    // ✅ Attach comment to task
    const task = db.data.tasks.find((t) => t.id === taskId);
    if (task) {
      task.comments = task.comments || [];
      task.comments.push(newComment.id);
    }

    await db.write();
    res.status(201).json(newComment);
  } catch (err) {
    next(err);
  }
};

/**
 * 🔹 Get all comments for a task
 */
export const getCommentsByTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    await db.read();

    db.data.users = db.data.users || [];
    db.data.comments = db.data.comments || [];

    const comments = db.data.comments
      .filter((c) => c.taskId === taskId && !c.deleted)
      .map((c) => ({
        ...c,
        authorName:
          db.data.users.find((u) => u.id === c.author)?.name || "Anonymous",
      }));

    res.json(comments);
  } catch (err) {
    next(err);
  }
};

/**
 * 🔹 Update a comment
 */
export const updateComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;
    const userId = req.userId;

    await db.read();
    db.data.comments = db.data.comments || [];

    const idx = db.data.comments.findIndex((c) => c.id === commentId);
    if (idx === -1) return res.status(404).json({ message: "Comment not found" });

    const comment = db.data.comments[idx];
    if (comment.author !== userId)
      return res.status(403).json({ message: "Unauthorized" });

    comment.text = text || comment.text;
    comment.updatedAt = new Date().toISOString();

    db.data.comments[idx] = comment;
    await db.write();
    res.json(comment);
  } catch (err) {
    next(err);
  }
};

/**
 * 🔹 Delete a comment (soft delete)
 */
export const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.userId;

    await db.read();
    db.data.comments = db.data.comments || [];

    const idx = db.data.comments.findIndex((c) => c.id === commentId);
    if (idx === -1) return res.status(404).json({ message: "Comment not found" });

    const comment = db.data.comments[idx];
    if (comment.author !== userId)
      return res.status(403).json({ message: "Unauthorized" });

    comment.deleted = true;
    comment.deletedAt = new Date().toISOString();
    db.data.comments[idx] = comment;

    await db.write();
    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    next(err);
  }
};
