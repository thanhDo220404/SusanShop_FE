/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "@/lib/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = authApi.getUser();
    if (stored) setUser(stored);
    setLoading(false);
  }, []);

  async function login(email, pass) {
    const result = await authApi.login(email, pass);
    setUser(result.user);
    return result;
  }

  async function register(name, email, pass, phone) {
    const result = await authApi.register(name, email, pass, phone);
    setUser(result.user);
    return result;
  }

  function logout() {
    authApi.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
