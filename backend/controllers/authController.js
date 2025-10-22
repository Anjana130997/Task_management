// controllers/authController.js
import db from "../utils/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "secret123";

// Register new user
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: "All fields required" });

  await db.read();
  const existing = db.data.users.find((u) => u.email === email);
  if (existing) return res.status(400).json({ message: "User already exists" });

  const hashed = bcrypt.hashSync(password, 10);
  const user = { id: randomUUID(), name, email, password: hashed, createdAt: new Date().toISOString() };
  db.data.users.push(user);
  await db.write();

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
  const safeUser = { id: user.id, name: user.name, email: user.email };
  res.status(201).json({ user: safeUser, token });
};

// Login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password required" });

  await db.read();
  const user = db.data.users.find((u) => u.email === email);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = bcrypt.compareSync(password, user.password);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
  const safeUser = { id: user.id, name: user.name, email: user.email };
  res.json({ user: safeUser, token });
};

// Get profile of current user (protected)
export const getProfile = async (req, res) => {
  await db.read();
  const user = db.data.users.find((u) => u.id === req.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  const safeUser = { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
  res.json({ user: safeUser });
};
