import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getOverview, getTrends } from "../controllers/analyticsController.js";

const router = express.Router();
router.get("/overview", authMiddleware, getOverview);
router.get("/trends", authMiddleware, getTrends);

export default router;
