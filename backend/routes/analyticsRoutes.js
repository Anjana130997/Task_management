// routes/analyticsRoutes.js
import express from "express";
import { getTaskOverview, getUserPerformance, getTaskTrends, exportTasksData } from "../controllers/analyticsController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/overview", verifyToken, getTaskOverview);
router.get("/performance", verifyToken, getUserPerformance);
router.get("/trends", verifyToken, getTaskTrends);
router.get("/export", verifyToken, exportTasksData);

export default router;
