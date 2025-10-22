// routes/commentRoutes.js
import express from "express";
import { addComment, getCommentsByTask, updateComment, deleteComment } from "../controllers/commentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// add comment to task: POST /api/comments/:taskId
router.post("/:taskId", verifyToken, addComment);

// get comments for task: GET /api/comments/:taskId
router.get("/:taskId", verifyToken, getCommentsByTask);

// update comment: PUT /api/comments/:commentId
router.put("/:commentId", verifyToken, updateComment);

// delete comment: DELETE /api/comments/:commentId
router.delete("/:commentId", verifyToken, deleteComment);

export default router;
