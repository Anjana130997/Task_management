// controllers/authController.js
import db from "../utils/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { sanitizeString } from "../utils/sanitize.js";

const JWT_SECRET = process.env.JWT_SECRET || "secret123";
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || "7d";

// register
export const registerUser = async (req, res, next) => {
  try {
    const name = sanitizeString(req.body.name);
    const email = sanitizeString((req.body.email || "").toLowerCase());
    const password = req.body.password;

    if (!name || !email || !password) return res.status(400).json({ message: "Name, email and password are required" });

    await db.read();
    const found = db.data.users.find((u) => u.email === email && !u.deleted);
    if (found) return res.status(400).json({ message: "User already exists" });

    const hashed = bcrypt.hashSync(password, 10);
    const user = { id: uuidv4(), name, email, password: hashed, createdAt: new Date().toISOString(), deleted: false };
    db.data.users.push(user);
    await db.write();

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    const safeUser = { id: user.id, name: user.name, email: user.email };
    res.status(201).json({ user: safeUser, token });
  } catch (err) {
    next(err);
  }
};

// login
export const loginUser = async (req, res, next) => {
  try {
    const email = sanitizeString((req.body.email || "").toLowerCase());
    const password = req.body.password;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    await db.read();
    const user = db.data.users.find((u) => u.email === email && !u.deleted);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = bcrypt.compareSync(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    const safeUser = { id: user.id, name: user.name, email: user.email };
    res.json({ user: safeUser, token });
  } catch (err) {
    next(err);
  }
};

// profile
export const getProfile = async (req, res, next) => {
  try {
    await db.read();
    const user = db.data.users.find((u) => u.id === req.userId && !u.deleted);
    if (!user) return res.status(404).json({ message: "User not found" });
    const safeUser = { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
    res.json({ user: safeUser });
  } catch (err) {
    next(err);
  }
};
