// routes/fileRoutes.js
import express from "express";
import { downloadFile, deleteFile } from "../controllers/fileController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:id", verifyToken, downloadFile);
router.delete("/:id", verifyToken, deleteFile);

export default router;
