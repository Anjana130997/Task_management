import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const nav = useNavigate();
  const [auth, setAuth] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("auth")) || null;
    } catch {
      return null;
    }
  });
  const [user, setUser] = useState(auth?.user || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (auth) {
      setUser(auth.user);
    } else {
      setUser(null);
    }
  }, [auth]);

  const login = async (email, password) => {
    setLoading(true);
    const res = await api.login({ email, password });
    const payload = { token: res.data.token, user: res.data.user };
    localStorage.setItem("auth", JSON.stringify(payload));
    setAuth(payload);
    setLoading(false);
    return payload;
  };

  const register = async (name, email, password) => {
    setLoading(true);
    const res = await api.register({ name, email, password });
    const payload = { token: res.data.token, user: res.data.user };
    localStorage.setItem("auth", JSON.stringify(payload));
    setAuth(payload);
    setLoading(false);
    return payload;
  };

  const logout = () => {
    localStorage.removeItem("auth");
    setAuth(null);
    nav("/");
  };

  const refreshMe = async () => {
    try {
      const res = await api.me();
      const updated = { ...auth, user: res.data.user };
      setAuth(updated);
      localStorage.setItem("auth", JSON.stringify(updated));
    } catch (err) {
      // ignore
    }
  };

  return (
    <AuthContext.Provider value={{ auth, user, login, register, logout, loading, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
