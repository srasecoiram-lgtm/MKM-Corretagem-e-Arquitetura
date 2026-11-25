import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import "../styles/Login.css";

export default function LoginAdm() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;
  const destination = from?.pathname ? from.pathname + (from.search || "") : "/admin/dashboard";

  useEffect(() => {
    if (isAdmin) navigate(destination, { replace: true });
  }, [isAdmin, navigate, destination]);

  async function handleLogin(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await login(email, senha);
    } catch (err) {
      setError(err.response?.data?.erro || "Não foi possível entrar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <main className="login-adm-container">
        <div className="login-card-header">
          <div className="login-logo"><span>MKM</span></div>
          <h1 className="login-subtitle">Área administrativa</h1>
        </div>
        {error && <div className="login-alert login-alert--error" role="alert">{error}</div>}
        <form className="login-adm-form" onSubmit={handleLogin}>
          <div className="login-field">
            <label htmlFor="email-login">E-mail</label>
            <input id="email-login" name="email" type="email" autoComplete="username"
              value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>
          <div className="login-field">
            <label htmlFor="senha-login">Senha</label>
            <input id="senha-login" name="senha" type="password" autoComplete="current-password"
              value={senha} onChange={(event) => setSenha(event.target.value)} required />
          </div>
          <button type="submit" className="login-btn" disabled={loading || submitting}>
            {submitting ? "Entrando…" : "Entrar"}
          </button>
        </form>
        <div className="login-footer"><Link to="/">← Voltar ao site</Link></div>
      </main>
    </div>
  );
}
