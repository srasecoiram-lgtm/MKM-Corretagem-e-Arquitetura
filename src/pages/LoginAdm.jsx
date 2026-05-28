import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "../styles/Login.css";

export default function LoginAdm() {
  const [aba, setAba]       = useState("login");   // "login" | "cadastro"
  const [form, setForm]     = useState({ nome: "", email: "", senha: "", confirmar: "" });
  const [erro, setErro]     = useState("");
  const [sucesso, setSucesso] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const destino   = location.state?.from?.pathname || "/admin/dashboard";

  /* Se já está logado, vai direto */
  useEffect(() => {
    if (isAuthenticated) navigate(destino, { replace: true });
  }, [isAuthenticated, navigate, destino]);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErro("");
    setSucesso("");
  };

  /* ── LOGIN ── */
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.senha) {
      setErro("Preencha e-mail e senha.");
      return;
    }
    setLoading(true);
    try {
      await login(form.email, form.senha);
      /* AuthContext redireciona via useEffect acima */
    } catch (err) {
      const msg = err.response?.data?.erro || "E-mail ou senha inválidos.";
      setErro(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ── CADASTRO ── */
  const handleCadastro = async (e) => {
    e.preventDefault();
    if (!form.nome || !form.email || !form.senha) {
      setErro("Preencha todos os campos.");
      return;
    }
    if (form.senha !== form.confirmar) {
      setErro("As senhas não coincidem.");
      return;
    }
    if (form.senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL || "http://localhost:3002"}/admin/register`,
        {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ nome: form.nome, email: form.email, senha: form.senha }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || "Erro ao cadastrar.");
      setSucesso("Administrador cadastrado! Faça login agora.");
      setForm({ nome: "", email: "", senha: "", confirmar: "" });
      setAba("login");
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── RENDER ── */
  return (
    <div className="login-page">
      <div className="login-adm-container">

        {/* CABEÇALHO */}
        <div className="login-card-header">
          <div className="login-logo">
            <span>MKM</span>
          </div>
          <p className="login-subtitle">Área Administrativa</p>
        </div>

        {/* ABAS */}
        <div className="login-abas">
          <button
            className={`login-aba ${aba === "login" ? "ativa" : ""}`}
            onClick={() => { setAba("login"); setErro(""); setSucesso(""); }}
          >
            Entrar
          </button>
          <button
            className={`login-aba ${aba === "cadastro" ? "ativa" : ""}`}
            onClick={() => { setAba("cadastro"); setErro(""); setSucesso(""); }}
          >
            Criar Admin
          </button>
        </div>

        {/* ALERTAS */}
        {erro    && <div className="login-alert login-alert--error">{erro}</div>}
        {sucesso && <div className="login-alert login-alert--success">{sucesso}</div>}

        {/* ── FORMULÁRIO LOGIN ── */}
        {aba === "login" && (
          <form onSubmit={handleLogin} className="login-adm-form">
            <div className="login-field">
              <label htmlFor="email-login">E-mail</label>
              <input
                id="email-login"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="senha-login">Senha</label>
              <input
                id="senha-login"
                name="senha"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={form.senha}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Entrando…" : "Entrar"}
            </button>
          </form>
        )}

        {/* ── FORMULÁRIO CADASTRO ── */}
        {aba === "cadastro" && (
          <form onSubmit={handleCadastro} className="login-adm-form">
            <div className="login-field">
              <label htmlFor="nome-cad">Nome completo</label>
              <input
                id="nome-cad"
                name="nome"
                type="text"
                placeholder="Seu nome"
                value={form.nome}
                onChange={handleChange}
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="email-cad">E-mail</label>
              <input
                id="email-cad"
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="senha-cad">Senha</label>
              <input
                id="senha-cad"
                name="senha"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={form.senha}
                onChange={handleChange}
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="confirmar-cad">Confirmar senha</label>
              <input
                id="confirmar-cad"
                name="confirmar"
                type="password"
                placeholder="Repita a senha"
                value={form.confirmar}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Criando…" : "Criar Administrador"}
            </button>
          </form>
        )}

        {/* VOLTAR AO SITE */}
        <div className="login-footer">
          <Link to="/">← Voltar ao site</Link>
        </div>

      </div>
    </div>
  );
}
