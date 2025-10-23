// src/pages/Analytics.jsx
import React, { useEffect, useState } from "react";
import api from "../api/api";
import Loader from "../components/Loader";

function SimpleBar({ data = {}, title }) {
  const entries = Object.entries(data);
  const max = Math.max(...entries.map(([, v]) => v), 1);
  return (
    <div className="chart-card">
      <h4>{title}</h4>
      {entries.map(([k, v]) => {
        const pct = (v / max) * 100;
        return (
          <div key={k} className="bar-row">
            <div className="bar-label">{k}</div>
            <div className="bar">
              <div className="bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="bar-value">{v}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function Analytics() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.overview();
      setOverview(res.data);
    } catch (err) {
      console.error(err);
      alert("Could not load analytics");
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (loading || !overview) return <Loader />;

  return (
    <div className="container page">
      <h2>Analytics</h2>
      <div className="grid-analytics">
        <SimpleBar data={overview.byStatus || {}} title="Tasks by Status" />
        <SimpleBar data={overview.byPriority || {}} title="Tasks by Priority" />
        <div className="chart-card">
          <h4>Totals</h4>
          <p>Total tasks: <strong>{overview.total}</strong></p>
        </div>
      </div>
    </div>
  );
}
