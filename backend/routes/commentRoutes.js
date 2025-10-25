import express from "express";
import {
  addComment,
  getCommentsByTask,
  updateComment,
  deleteComment,
} from "../controllers/commentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:taskId", verifyToken, addComment);
router.get("/:taskId", verifyToken, getCommentsByTask);
router.put("/:commentId", verifyToken, updateComment);
router.delete("/:commentId", verifyToken, deleteComment);

export default router;
