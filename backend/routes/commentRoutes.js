import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { addComment, getComments, updateComment, deleteComment } from "../controllers/commentController.js";

const router = express.Router();

router.post("/", authMiddleware, addComment);
router.get("/:taskId", authMiddleware, getComments);
router.put("/:id", authMiddleware, updateComment);
router.delete("/:id", authMiddleware, deleteComment);

export default router;
