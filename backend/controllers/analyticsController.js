// Provides task statistics for dashboard
import db from "../utils/db.js";

export const getOverview = async (req, res) => {
  await db.read();
  const tasks = db.data.tasks.filter(t => !t.deleted);
  const statusCounts = {};
  const priorityCounts = {};
  tasks.forEach(task => {
    // Count by status
    statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
    // Count by priority
    priorityCounts[task.priority] = (priorityCounts[task.priority] || 0) + 1;
  });

  res.json({ statusCounts, priorityCounts });
};

export const getTrends = async (req, res) => {
  await db.read();
  const tasks = db.data.tasks.filter(t => !t.deleted);
  const trends = {};

  tasks.forEach(task => {
    const date = task.due_date?.split("T")[0] || "unknown";
    trends[date] = (trends[date] || 0) + 1;
  });

  res.json(trends);
};