import db from "../utils/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Register
export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields required" });

  await db.read();
  const existingUser = db.data.users.find(u => u.email === email);
  if (existingUser)
    return res.status(400).json({ message: "User already exists" });

  const hashed = await bcrypt.hash(password, 10);
  const newUser = { id: Date.now().toString(), name, email, password: hashed };
  db.data.users.push(newUser);
  await db.write();

  const token = jwt.sign({ id: newUser.id }, "secret123", { expiresIn: "1d" });
  res.status(201).json({ user: newUser, token });
};

// Login
export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Required" });

  await db.read();
  const user = db.data.users.find(u => u.email === email);
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user.id }, "secret123", { expiresIn: "1d" });
  res.json({ user, token });
};

// Get profile
export const getProfile = async (req, res) => {
  await db.read();
  const user = db.data.users.find(u => u.id === req.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
};
