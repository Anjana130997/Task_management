import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import fs from "fs";
import path from "path";

const file = path.join(process.cwd(), "db.json");
const adapter = new JSONFile(file);
const db = new Low(adapter);

const initDB = async () => {
  await db.read();
  db.data = db.data || { users: [], tasks: [], comments: [] };
  await db.write();
};

await initDB();

export default db;
