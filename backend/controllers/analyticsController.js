// controllers/analyticsController.js
import db from "../utils/db.js";

// Overview: count by status & priority for current user's tasks (createdBy or assigned)
export const getTaskOverview = async (req, res, next) => {
  try {
    await db.read();
    const userId = req.userId;
    const tasks = db.data.tasks.filter((t) => !t.deleted && (t.createdBy === userId || t.assigned_to === userId));
    const byStatus = tasks.reduce((acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc; }, {});
    const byPriority = tasks.reduce((acc, t) => { acc[t.priority] = (acc[t.priority] || 0) + 1; return acc; }, {});
    res.json({ total: tasks.length, byStatus, byPriority });
  } catch (err) { next(err); }
};

export const getUserPerformance = async (req, res, next) => {
  try {
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
  } catch (err) { next(err); }
};

export const getTaskTrends = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    await db.read();
    const userId = req.userId;
    const tasks = db.data.tasks.filter((t) => !t.deleted && (t.createdBy === userId || t.assigned_to === userId));
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
  } catch (err) { next(err); }
};

export const exportTasksData = async (req, res, next) => {
  try {
    await db.read();
    const userId = req.userId;
    const tasks = db.data.tasks.filter((t) => !t.deleted && (t.createdBy === userId || t.assigned_to === userId));
    res.json(tasks);
  } catch (err) { next(err); }
};
