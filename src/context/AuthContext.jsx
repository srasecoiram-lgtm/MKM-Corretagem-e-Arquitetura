// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const API = process.env.REACT_APP_API_URL || "http://localhost:3002";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);   // accessToken em memória
  const [loading, setLoading] = useState(true);

  /* ── Tenta restaurar sessão via refreshToken (cookie httpOnly) ── */
  useEffect(() => {
    const restore = async () => {
      try {
        const res = await fetch(`${API}/auth/refresh`, {
          method:      "POST",
          credentials: "include",             // envia cookie httpOnly
        });
        if (!res.ok) throw new Error("sem sessão");
        const data = await res.json();
        setToken(data.token);

        /* busca dados do usuário */
        const meRes = await fetch(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${data.token}` },
        });
        if (meRes.ok) {
          const me = await meRes.json();
          setUser(me);
        }
      } catch {
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  /* ── LOGIN ── */
  const login = useCallback(async (email, senha) => {
    const res = await fetch(`${API}/login`, {
      method:      "POST",
      credentials: "include",
      headers:     { "Content-Type": "application/json" },
      body:        JSON.stringify({ email, senha }),   // campos corretos do backend
    });

    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.erro || "Credenciais inválidas.");
      err.response = { data };
      throw err;
    }

    /* guarda token em memória */
    setToken(data.token);
    setUser({ id: data.id, email, nome: data.nome, role: "admin" });
    return data;
  }, []);

  /* ── LOGOUT ── */
  const logout = useCallback(async () => {
    try {
      await fetch(`${API}/auth/logout`, {
        method:      "POST",
        credentials: "include",
        headers:     token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch { /* silencioso */ }
    setToken(null);
    setUser(null);
  }, [token]);

  const isAuthenticated = !!user && !!token;
  const isAdmin         = user?.role === "admin" || isAuthenticated; // todo login é admin neste sistema

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
