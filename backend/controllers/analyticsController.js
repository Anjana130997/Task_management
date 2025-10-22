// controllers/analyticsController.js
import db from "../utils/db.js";

export const getTaskOverview = async (req, res) => {
  await db.read();
  const tasks = db.data.tasks.filter((t) => !t.deleted);
  const byStatus = tasks.reduce((acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc; }, {});
  const byPriority = tasks.reduce((acc, t) => { acc[t.priority] = (acc[t.priority] || 0) + 1; return acc; }, {});
  res.json({ total: tasks.length, byStatus, byPriority });
};

export const getUserPerformance = async (req, res) => {
  await db.read();
  const userId = req.query.userId || req.userId;
  const tasks = db.data.tasks.filter((t) => !t.deleted && (t.assigned_to === userId || t.createdBy === userId));
  const completed = tasks.filter((t) => t.status === "done");
  const durations = completed.map((t) => {
    if (!t.completedAt || !t.createdAt) return null;
    return new Date(t.completedAt) - new Date(t.createdAt);
  }).filter(Boolean);
  const avgMs = durations.length ? Math.round(durations.reduce((a,b) => a+b,0)/durations.length) : null;
  res.json({ userId, totalAssigned: tasks.length, completed: completed.length, avgCompletionMs: avgMs });
};

export const getTaskTrends = async (req, res) => {
  // Return counts per day between from/to for created and completed
  const { from, to } = req.query;
  await db.read();
  const tasks = db.data.tasks.filter((t) => !t.deleted);
  const results = {};
  const add = (dateStr, key) => {
    if (!dateStr) return;
    if (from && dateStr < from) return;
    if (to && dateStr > to) return;
    results[dateStr] = results[dateStr] || { created: 0, completed: 0 };
    results[dateStr][key] += 1;
  };
  tasks.forEach((t) => {
    const created = t.createdAt ? t.createdAt.slice(0,10) : null;
    const completed = t.completedAt ? t.completedAt.slice(0,10) : null;
    add(created, "created");
    add(completed, "completed");
  });
  res.json(results);
};

export const exportTasksData = async (req, res) => {
  await db.read();
  const tasks = db.data.tasks.filter((t) => !t.deleted);
  res.json(tasks); // frontend can convert to CSV if needed
};
