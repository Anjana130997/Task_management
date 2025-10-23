// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

/**
 * AuthProvider maintains auth state (token + user) and exposes:
 * login, register, logout, refreshMe
 *
 * We store minimal auth payload in localStorage: { token, user }
 * The axios interceptor attaches Authorization header automatically.
 */
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [auth, setAuth] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("auth")) || null;
    } catch {
      return null;
    }
  });
  const [user, setUser] = useState(auth?.user || null);
  const [loading, setLoading] = useState(false);

  // keep `user` in sync with `auth`
  useEffect(() => {
    setUser(auth?.user || null);
  }, [auth]);

  // login
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.login({ email, password });
      const payload = { token: res.data.token, user: res.data.user };
      localStorage.setItem("auth", JSON.stringify(payload));
      setAuth(payload);
      setLoading(false);
      return payload;
    } catch (err) {
      setLoading(false);
      const message = err?.response?.data?.message || "Login failed";
      throw new Error(message);
    }
  };

  // register
// src/context/AuthContext.jsx
const register = async (name, email, password) => {
  setLoading(true);
  try {
    // Call backend to create user
    await api.register({ name, email, password });

    // ✅ Do NOT log in automatically — just return success
    setLoading(false);
    return true;
  } catch (err) {
    setLoading(false);
    const message = err?.response?.data?.message || "Registration failed";
    throw new Error(message);
  }
};


  // logout
  const logout = () => {
    localStorage.removeItem("auth");
    setAuth(null);
    setUser(null);
    navigate("/");
  };

  // refresh user profile
  const refreshMe = async () => {
    try {
      const res = await api.me();
      const updated = { ...auth, user: res.data.user };
      localStorage.setItem("auth", JSON.stringify(updated));
      setAuth(updated);
    } catch {
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ auth, user, login, register, logout, loading, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
