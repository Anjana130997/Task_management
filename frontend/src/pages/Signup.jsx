// src/pages/Signup.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

const submit = async (e) => {
  e.preventDefault();
  setError("");
  try {
    await register(form.name, form.email, form.password);
    // ✅ Redirect user to login page
    nav("/");
  } catch (err) {
    setError(err.message || "Signup failed");
  }
};


  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Create account</h2>
        <form onSubmit={submit}>
          <label>Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <label>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <label>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          {error && <div className="alert">{error}</div>}
          <button className="btn primary" type="submit">
            Sign up
          </button>
        </form>
      </div>
    </div>
  );
}
