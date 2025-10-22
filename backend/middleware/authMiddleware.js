// middleware/authMiddleware.js - verifies JWT and sets req.userId / req.user
import jwt from "jsonwebtoken";
import db from "../utils/db.js";

const JWT_SECRET = process.env.JWT_SECRET || "secret123";

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    await db.read();
    const user = db.data.users.find((u) => u.id === decoded.id);
    if (!user) return res.status(401).json({ message: "Invalid token" });
    req.userId = user.id;
    req.user = { id: user.id, name: user.name, email: user.email };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
