import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";
import { upload } from "../utils/upload.js";

const router = express.Router();
router.post("/", authMiddleware, upload.array("files", 5), createTask);
router.get("/", authMiddleware, getTasks);
router.put("/:id", authMiddleware, updateTask);
router.delete("/:id", authMiddleware, deleteTask);

export default router;
