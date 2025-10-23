import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";

const file = path.join(process.cwd(), "db.json");
const adapter = new JSONFile(file);
const db = new Low(adapter);

export const initDB = async () => {
  await db.read();
  db.data = db.data || { users: [], tasks: [], comments: [], files: [] };
  await db.write();
};

await initDB();

export default db;
