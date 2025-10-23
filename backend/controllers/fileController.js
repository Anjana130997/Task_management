// controllers/fileController.js
import db from "../utils/db.js";
import path from "path";
import fs from "fs";

// Download file by id - verifies user has access to the task
export const downloadFile = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.read();
    const file = db.data.files.find((f) => f.id === id && !f.deleted);
    if (!file) return res.status(404).json({ message: "File not found" });

    const task = db.data.tasks.find((t) => t.id === file.taskId && !t.deleted);
    if (!task) return res.status(404).json({ message: "Task for file not found" });

    if (!(task.createdBy === req.userId || task.assigned_to === req.userId)) return res.status(403).json({ message: "Not allowed" });

    const diskPath = path.join(process.cwd(), "uploads", file.storedName);
    if (!fs.existsSync(diskPath)) return res.status(404).json({ message: "File on disk missing" });

    res.download(diskPath, file.originalName);
  } catch (err) { next(err); }
};

// Delete file (soft + physical delete) - only uploader or task creator
export const deleteFile = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.read();
    const idx = db.data.files.findIndex((f) => f.id === id && !f.deleted);
    if (idx === -1) return res.status(404).json({ message: "File not found" });

    const file = db.data.files[idx];
    const task = db.data.tasks.find((t) => t.id === file.taskId);
    if (file.uploadedBy !== req.userId && task?.createdBy !== req.userId) return res.status(403).json({ message: "Not allowed" });

    // soft-delete metadata
    file.deleted = true;
    file.deletedAt = new Date().toISOString();
    db.data.files[idx] = file;

    // remove from task.files array
    const tIdx = db.data.tasks.findIndex((t) => t.id === file.taskId);
    if (tIdx !== -1) {
      db.data.tasks[tIdx].files = (db.data.tasks[tIdx].files || []).filter((fid) => fid !== file.id);
    }

    await db.write();

    // attempt to remove file from disk (best-effort)
    const diskPath = path.join(process.cwd(), "uploads", file.storedName);
    if (fs.existsSync(diskPath)) {
      try { fs.unlinkSync(diskPath); } catch (e) { console.warn("Could not delete file from disk:", e.message); }
    }

    res.json({ message: "File deleted" });
  } catch (err) { next(err); }
};
