import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getOverview, getUserPerformance, getTaskTrends, exportTasks } from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/overview", authMiddleware, getOverview);
router.get("/user-performance", authMiddleware, getUserPerformance);
router.get("/trends", authMiddleware, getTaskTrends);
router.get("/export", authMiddleware, exportTasks);

export default router;
