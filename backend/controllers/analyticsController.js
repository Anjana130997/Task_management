import db from "../utils/db.js";

// Overview stats
export const getOverview = async (req, res) => {
  await db.read();
  const tasks = db.data.tasks.filter(t => !t.deleted);

  const byStatus = tasks.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  const byPriority = tasks.reduce((acc, t) => {
    acc[t.priority] = (acc[t.priority] || 0) + 1;
    return acc;
  }, {});

  res.json({ byStatus, byPriority });
};

// User performance (tasks created vs assigned)
export const getUserPerformance = async (req, res) => {
  await db.read();
  const tasks = db.data.tasks.filter(t => !t.deleted);
  const users = db.data.users;

  const performance = users.map(u => {
    const created = tasks.filter(t => t.created_by === u.id).length;
    const assigned = tasks.filter(t => t.assigned_to === u.id).length;
    return { user: u.name, created, assigned };
  });

  res.json(performance);
};

// Task trends over time
export const getTaskTrends = async (req, res) => {
  await db.read();
  const tasks = db.data.tasks.filter(t => !t.deleted);
  const trends = {};

  tasks.forEach(t => {
    const date = t.due_date?.split("T")[0] || t.created_at?.split("T")[0];
    if (date) trends[date] = (trends[date] || 0) + 1;
  });

  res.json(trends);
};

// Export tasks
export const exportTasks = async (req, res) => {
  await db.read();
  const tasks = db.data.tasks.filter(t => !t.deleted);
  res.json(tasks); // Can be extended to CSV/Excel later
};
