import React, { createContext, useContext, useEffect, useState } from "react";
import { loginSession, logoutSession, refreshSession, subscribeSession } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const unsubscribe = subscribeSession(setSession);
    refreshSession().catch(() => {}).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const user = session ? { id: session.id, nome: session.nome, email: session.email, role: session.role } : null;
  const token = session?.token || null;
  const isAuthenticated = Boolean(user && token);
  const isAdmin = isAuthenticated && user.role === "admin";

  return (
    <AuthContext.Provider value={{
      user, token, loading, isAuthenticated, isAdmin, login: loginSession, logout: logoutSession,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  return context;
}
