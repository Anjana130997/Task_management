import express from "express";
import {
  addComment,
  getCommentsByTask,
  updateComment,
  deleteComment,
} from "../controllers/commentController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:taskId", authenticateToken, addComment);
router.get("/:taskId", authenticateToken, getCommentsByTask);
router.put("/:commentId", authenticateToken, updateComment);
router.delete("/:commentId", authenticateToken, deleteComment);

export default router;
