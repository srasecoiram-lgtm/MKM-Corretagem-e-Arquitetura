// src/pages/AdminDashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FaHome, FaPlus, FaEye, FaEdit, FaTrash,
  FaChartLine, FaUsers, FaBuilding, FaSignInAlt,
  FaSync, FaWhatsapp, FaCheckCircle, FaTimesCircle,
} from "react-icons/fa";
import HeaderAdmin   from "../components/HeaderAdmin";
import { useAuth }   from "../context/AuthContext";
import api           from "../services/api";
import "../styles/AdminDashboard.css";

/* ── HELPERS ── */
const fmtNum  = (n) => Number(n || 0).toLocaleString("pt-BR");
const fmtReal = (n) => Number(n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/* ── HOOK: contador de acessos ao admin (localStorage) ── */
function useAdminAcessos() {
  const [acessos, setAcessos] = useState(0);
  useEffect(() => {
    const chave  = "mkm_admin_acessos";
    const total  = parseInt(localStorage.getItem(chave) || "0") + 1;
    localStorage.setItem(chave, total);
    setAcessos(total);
  }, []);
  return acessos;
}

export default function AdminDashboard() {
  const { user }   = useAuth();
  const acessos    = useAdminAcessos();

  const [stats,    setStats]    = useState(null);
  const [imoveis,  setImoveis]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [refresh,  setRefresh]  = useState(0);
  const [hora,     setHora]     = useState(new Date());

  /* Relógio em tempo real */
  useEffect(() => {
    const t = setInterval(() => setHora(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  /* Busca dados reais do backend */
  const fetchDados = useCallback(async () => {
    setLoading(true);
    try {
      const [resImoveis] = await Promise.all([
        api.get("/imoveis"),
      ]);

      const lista = resImoveis.data || [];
      setImoveis(lista);

      /* Calcula métricas localmente */
      const vendas    = lista.filter(i => i.finalidade?.toLowerCase().includes("venda"));
      const alugueis  = lista.filter(i => i.finalidade?.toLowerCase().includes("aluguel"));
      const valorTotal = lista.reduce((s, i) => s + (parseFloat(i.valor) || 0), 0);

      setStats({
        total:       lista.length,
        vendas:      vendas.length,
        alugueis:    alugueis.length,
        valorTotal,
        tipos: {
          apartamento: lista.filter(i => i.tipo_imovel === "Apartamento").length,
          casa:        lista.filter(i => i.tipo_imovel === "Casa").length,
          terreno:     lista.filter(i => i.tipo_imovel === "Terreno").length,
          comercial:   lista.filter(i => i.tipo_imovel === "Comercial").length,
        },
      });
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDados(); }, [fetchDados, refresh]);

  const excluir = async (id) => {
    if (!window.confirm("Excluir este imóvel permanentemente?")) return;
    try {
      await api.delete(`/imoveis/${id}`);
      setRefresh(r => r + 1);
    } catch {
      alert("Erro ao excluir. Tente novamente.");
    }
  };

  const recentes = imoveis.slice(0, 6);

  /* ── RENDER ── */
  return (
    <div className="adm-page">
      <HeaderAdmin />

      {/* ══ TOPO ══ */}
      <div className="adm-topbar">
        <div className="adm-topbar__left">
          <h1>
            Olá, <span>{user?.nome?.split(" ")[0] || "Admin"}</span> 👋
          </h1>
          <p className="adm-topbar__sub">
            {hora.toLocaleDateString("pt-BR", { weekday:"long", day:"2-digit", month:"long", year:"numeric" })}
            &nbsp;·&nbsp;
            {hora.toLocaleTimeString("pt-BR")}
          </p>
        </div>
        <div className="adm-topbar__actions">
          <button className="adm-btn-refresh" onClick={() => setRefresh(r => r + 1)} disabled={loading}>
            <FaSync className={loading ? "spin" : ""} />
            {loading ? "Atualizando…" : "Atualizar"}
          </button>
          <Link to="/cadastrar" className="adm-btn-primary">
            <FaPlus /> Novo Imóvel
          </Link>
        </div>
      </div>

      <div className="adm-body">

        {/* ══ CARDS DE MÉTRICAS ══ */}
        <div className="adm-metrics">

          <div className="adm-metric adm-metric--blue">
            <div className="adm-metric__icon"><FaBuilding /></div>
            <div className="adm-metric__info">
              <span className="adm-metric__label">Total de Imóveis</span>
              <span className="adm-metric__value">{loading ? "—" : fmtNum(stats?.total)}</span>
              <span className="adm-metric__sub">no portfólio</span>
            </div>
          </div>

          <div className="adm-metric adm-metric--gold">
            <div className="adm-metric__icon"><FaChartLine /></div>
            <div className="adm-metric__info">
              <span className="adm-metric__label">Valor Total</span>
              <span className="adm-metric__value adm-metric__value--sm">
                {loading ? "—" : fmtReal(stats?.valorTotal)}
              </span>
              <span className="adm-metric__sub">soma do portfólio</span>
            </div>
          </div>

          <div className="adm-metric adm-metric--green">
            <div className="adm-metric__icon"><FaHome /></div>
            <div className="adm-metric__info">
              <span className="adm-metric__label">Para Venda</span>
              <span className="adm-metric__value">{loading ? "—" : fmtNum(stats?.vendas)}</span>
              <span className="adm-metric__sub">imóveis disponíveis</span>
            </div>
          </div>

          <div className="adm-metric adm-metric--purple">
            <div className="adm-metric__icon"><FaUsers /></div>
            <div className="adm-metric__info">
              <span className="adm-metric__label">Para Aluguel</span>
              <span className="adm-metric__value">{loading ? "—" : fmtNum(stats?.alugueis)}</span>
              <span className="adm-metric__sub">imóveis disponíveis</span>
            </div>
          </div>

          <div className="adm-metric adm-metric--dark">
            <div className="adm-metric__icon"><FaSignInAlt /></div>
            <div className="adm-metric__info">
              <span className="adm-metric__label">Acessos Admin</span>
              <span className="adm-metric__value">{fmtNum(acessos)}</span>
              <span className="adm-metric__sub">neste dispositivo</span>
            </div>
          </div>

        </div>

        {/* ══ LINHA CENTRAL: BREAKDOWN + AÇÕES ══ */}
        <div className="adm-mid">

          {/* BREAKDOWN POR TIPO */}
          <div className="adm-card">
            <div className="adm-card__head">
              <h2>Imóveis por tipo</h2>
            </div>
            <div className="adm-breakdown">
              {[
                { label:"Apartamentos", val: stats?.tipos?.apartamento, color:"#1A3A5C" },
                { label:"Casas",        val: stats?.tipos?.casa,        color:"#C9973B" },
                { label:"Terrenos",     val: stats?.tipos?.terreno,     color:"#2D6A4F" },
                { label:"Comercial",    val: stats?.tipos?.comercial,   color:"#7C3AED" },
              ].map(({ label, val, color }) => {
                const total = stats?.total || 1;
                const pct   = Math.round(((val || 0) / total) * 100);
                return (
                  <div key={label} className="adm-breakdown__item">
                    <div className="adm-breakdown__top">
                      <span className="adm-breakdown__label">{label}</span>
                      <span className="adm-breakdown__count">{loading ? "—" : val || 0}</span>
                    </div>
                    <div className="adm-breakdown__bar-bg">
                      <div
                        className="adm-breakdown__bar"
                        style={{ width: loading ? "0%" : `${pct}%`, background: color }}
                      />
                    </div>
                    <span className="adm-breakdown__pct">{loading ? "" : `${pct}%`}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AÇÕES RÁPIDAS */}
          <div className="adm-card">
            <div className="adm-card__head">
              <h2>Ações rápidas</h2>
            </div>
            <div className="adm-quick">
              <Link to="/cadastrar" className="adm-quick__btn">
                <FaPlus />
                <span>Cadastrar imóvel</span>
              </Link>
              <Link to="/imoveis" className="adm-quick__btn">
                <FaEye />
                <span>Ver portfólio público</span>
              </Link>
              <a
                href="https://wa.me/5511992931055"
                className="adm-quick__btn adm-quick__btn--wa"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaWhatsapp />
                <span>Abrir WhatsApp</span>
              </a>
              <Link to="/forum" className="adm-quick__btn">
                <FaUsers />
                <span>Ver fórum</span>
              </Link>
            </div>
          </div>

        </div>

        {/* ══ TABELA DE IMÓVEIS RECENTES ══ */}
        <div className="adm-card adm-card--full">
          <div className="adm-card__head">
            <h2>Imóveis recentes</h2>
            <Link to="/imoveis" className="adm-card__link">Ver todos →</Link>
          </div>

          {loading ? (
            <div className="adm-loading">
              <div className="adm-spinner" />
              <p>Carregando imóveis…</p>
            </div>
          ) : recentes.length === 0 ? (
            <div className="adm-empty">
              <FaBuilding />
              <p>Nenhum imóvel cadastrado ainda.</p>
              <Link to="/cadastrar" className="adm-btn-primary">Cadastrar primeiro imóvel</Link>
            </div>
          ) : (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Imóvel</th>
                    <th>Tipo</th>
                    <th>Finalidade</th>
                    <th>Cidade</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {recentes.map((im) => (
                    <tr key={im.id}>
                      <td>
                        <div className="adm-table__imovel">
                          {im.imagem ? (
                            <img
                              src={`${process.env.REACT_APP_API_URL || "http://localhost:3002"}${im.imagem}`}
                              alt={im.edificio || im.tipo_imovel}
                              className="adm-table__thumb"
                            />
                          ) : (
                            <div className="adm-table__thumb adm-table__thumb--empty">
                              <FaBuilding />
                            </div>
                          )}
                          <span>{im.edificio || im.tipo_imovel || "—"}</span>
                        </div>
                      </td>
                      <td>{im.tipo_imovel || "—"}</td>
                      <td>
                        <span className={`adm-tag ${im.finalidade?.toLowerCase().includes("venda") ? "adm-tag--venda" : "adm-tag--aluguel"}`}>
                          {im.finalidade || "—"}
                        </span>
                      </td>
                      <td>{im.cidade || "—"}{im.uf ? `/${im.uf}` : ""}</td>
                      <td className="adm-table__valor">
                        {im.valor ? fmtReal(im.valor) : "—"}
                      </td>
                      <td>
                        {im.ativo !== 0
                          ? <span className="adm-status adm-status--on"><FaCheckCircle /> Ativo</span>
                          : <span className="adm-status adm-status--off"><FaTimesCircle /> Inativo</span>
                        }
                      </td>
                      <td>
                        <div className="adm-table__actions">
                          <Link to={`/editar/${im.id}`} className="adm-icon-btn adm-icon-btn--edit" title="Editar">
                            <FaEdit />
                          </Link>
                          <button
                            className="adm-icon-btn adm-icon-btn--del"
                            onClick={() => excluir(im.id)}
                            title="Excluir"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
