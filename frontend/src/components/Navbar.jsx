// src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const nav = useNavigate();

  return (
    <header className="nav">
      <div className="container nav-inner">
        <div className="brand" onClick={() => nav("/dashboard")}>TaskManager</div>
        <nav className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/analytics">Analytics</Link>
          <button className="btn subtle" onClick={toggle}>
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>
          <div className="user-chip">
            <span>{user?.name || user?.email}</span>
            <button className="btn" onClick={logout}>Logout</button>
          </div>
        </nav>
      </div>
    </header>
  );
}
