// routes/taskRoutes.js
import express from "express";
import {
  createTask,
  bulkCreateTasks,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  addFilesToTask
} from "../controllers/taskController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import upload from "../utils/upload.js";

const router = express.Router();

router.post("/", verifyToken, createTask);
router.post("/bulk", verifyToken, bulkCreateTasks);
router.get("/", verifyToken, getAllTasks);
router.get("/:id", verifyToken, getTaskById);
router.put("/:id", verifyToken, updateTask);
router.delete("/:id", verifyToken, deleteTask);

// Upload files for a task (field: files)
router.post("/:id/files", verifyToken, upload.array("files", 5), addFilesToTask);

export default router;
