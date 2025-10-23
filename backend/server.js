// server.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import db, { initDB } from "./utils/db.js";
import dotenv from "dotenv";
import "dotenv/config";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

await initDB(); // ensure DB created

const app = express();

// Security
app.use(helmet());

// CORS - restrict in production
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));

// Rate limiter - basic
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,
  message: { message: "Too many requests, please try again later" },
});
app.use(limiter);

// Body parser
app.use(express.json());

// Serve uploads folder statically (for downloads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/analytics", analyticsRoutes);

// Root
app.get("/", (req, res) => res.json({ message: "Task Manager backend running" }));

// Error handler (should be last)
app.use(errorHandler);

// Start
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
