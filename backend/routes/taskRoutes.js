import express from "express";
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  getTaskById,
  bulkCreateTasks,
  deleteTaskFile,
} from "../controllers/taskController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { upload } from "../utils/upload.js";

const router = express.Router();

router.post("/", authMiddleware, upload.array("files", 5), createTask);
router.post("/bulk", authMiddleware, bulkCreateTasks);
router.get("/", authMiddleware, getTasks);
router.get("/:id", authMiddleware, getTaskById);
router.put("/:id", authMiddleware, upload.array("files", 5), updateTask);
router.delete("/:id", authMiddleware, deleteTask);
router.delete("/:taskId/files/:filename", authMiddleware, deleteTaskFile);

export default router;
