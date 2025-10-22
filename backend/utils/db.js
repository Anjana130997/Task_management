// utils/db.js - lowdb setup
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";

// File path for db.json
const file = path.join(process.cwd(), "db.json");
const adapter = new JSONFile(file);
const db = new Low(adapter);

// Initialize DB (create arrays if missing)
export const initDB = async () => {
  await db.read();
  db.data = db.data || { users: [], tasks: [], comments: [], files: [] };
  await db.write();
};

// initialize at import time
await initDB();

export default db;
