import React, { useEffect, useState, useCallback } from "react";
import { Link, useLocation } from "react-router";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaHome,
  FaChartLine,
  FaUsers,
  FaBuilding,
  FaSignInAlt,
  FaSync,
  FaWhatsapp,
  FaCheckCircle,
  FaTimesCircle,
  FaClipboardList,
} from "react-icons/fa";
import HeaderAdmin from "../components/HeaderAdmin";
import api, { mediaUrl } from "../services/api";
import "../styles/AdminDashboard.css";

/* ── HELPERS ── */
const fmtNum = (n) => Number(n || 0).toLocaleString("pt-BR");
const fmtReal = (n) =>
  Number(n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/* ── HOOK: contador de acessos ao admin (localStorage) ── */
function useAdminAcessos() {
  const [acessos, setAcessos] = useState(0);
  useEffect(() => {
    const chave = "mkm_admin_acessos";
    const total = parseInt(localStorage.getItem(chave) || "0", 10) + 1;
    localStorage.setItem(chave, total);
    setAcessos(total);
  }, []);
  return acessos;
}

export default function AdminDashboard() {
  const acessos = useAdminAcessos();
  const location = useLocation();

  const [stats, setStats] = useState(null);
  const [imoveis, setImoveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [currentTab, setCurrentTab] = useState("painel");

  /* Define qual aba/view exibir com base na rota */
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/editar")) setCurrentTab("editar");
    else if (path.includes("/imoveis")) setCurrentTab("imoveis");
    else setCurrentTab("painel");
  }, [location.pathname]);

  /* Dados do backend */
  const fetchDados = useCallback(async () => {
    setLoading(true);
    try {
      const resImoveis = await api.get("/imoveis/admin");

      const lista = resImoveis.data || [];
      setImoveis(lista);

      const vendas = lista.filter((i) =>
        (i.finalidade || "").toLowerCase().includes("venda")
      );
      const alugueis = lista.filter((i) =>
        (i.finalidade || "").toLowerCase().includes("aluguel")
      );
      const valorTotal = lista.reduce(
        (s, i) => s + (parseFloat(i.valor) || 0),
        0
      );

      setStats({
        total: lista.length,
        vendas: vendas.length,
        alugueis: alugueis.length,
        valorTotal,
        tipos: {
          apartamento: lista.filter((i) => i.tipo_imovel === "Apartamento").length,
          casa: lista.filter((i) => i.tipo_imovel === "Casa").length,
          terreno: lista.filter((i) => i.tipo_imovel === "Terreno").length,
          comercial: lista.filter((i) => i.tipo_imovel === "Comercial").length,
        },
      });
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDados();
  }, [fetchDados, refresh]);

  const excluir = async (id) => {
    if (!window.confirm("Excluir este imóvel permanentemente?")) return;
    try {
      await api.delete(`/imoveis/${id}`);
      setRefresh((r) => r + 1);
    } catch {
      alert("Erro ao excluir. Tente novamente.");
    }
  };

  const recentes = imoveis.slice(0, 6);

  /* ── RENDER ── */
  return (
    <div className="adm-page">
      <HeaderAdmin />

      <div className="adm-body">
        <div className="adm-dashboard">
          <div className="adm-card adm-card--full">
            <div className="adm-card__head">
              <h2>Painel principal</h2>
              <button
                className="adm-btn-refresh"
                onClick={() => setRefresh((r) => r + 1)}
                disabled={loading}
              >
                <FaSync className={loading ? "spin" : ""} />
                {loading ? "Atualizando…" : "Atualizar"}
              </button>
            </div>

            {/* PAINEL PRINCIPAL */}
            {currentTab === "painel" && (
              <div className="page page--active">
                <div className="adm-metrics">
                  <Metric
                    icon={<FaBuilding />}
                    label="Total de Imóveis"
                    value={loading ? "—" : fmtNum(stats?.total)}
                    sub="no portfólio"
                    color="blue"
                  />
                  <Metric
                    icon={<FaChartLine />}
                    label="Valor Total"
                    value={loading ? "—" : fmtReal(stats?.valorTotal)}
                    sub="soma do portfólio"
                    color="gold"
                  />
                  <Metric
                    icon={<FaHome />}
                    label="Para Venda"
                    value={loading ? "—" : fmtNum(stats?.vendas)}
                    sub="imóveis disponíveis"
                    color="green"
                  />
                  <Metric
                    icon={<FaUsers />}
                    label="Para Aluguel"
                    value={loading ? "—" : fmtNum(stats?.alugueis)}
                    sub="imóveis disponíveis"
                    color="purple"
                  />
                  <Metric
                    icon={<FaSignInAlt />}
                    label="Acessos Admin"
                    value={fmtNum(acessos)}
                    sub="neste dispositivo"
                    color="dark"
                  />
                </div>

                <div className="adm-mid">
                  <div className="adm-card">
                    <div className="adm-card__head">
                      <h2>Imóveis por tipo</h2>
                    </div>
                    <div className="adm-breakdown">
                      {[
                        {
                          label: "Apartamentos",
                          val: stats?.tipos?.apartamento,
                          color: "#1A3A5C",
                        },
                        {
                          label: "Casas",
                          val: stats?.tipos?.casa,
                          color: "#C9973B",
                        },
                        {
                          label: "Terrenos",
                          val: stats?.tipos?.terreno,
                          color: "#2D6A4F",
                        },
                        {
                          label: "Comercial",
                          val: stats?.tipos?.comercial,
                          color: "#7C3AED",
                        },
                      ].map(({ label, val, color }) => {
                        const total = stats?.total || 1;
                        const pct = Math.round(((val || 0) / total) * 100);
                        return (
                          <div key={label} className="adm-breakdown__item">
                            <div className="adm-breakdown__top">
                              <span className="adm-breakdown__label">
                                {label}
                              </span>
                              <span className="adm-breakdown__count">
                                {loading ? "—" : val || 0}
                              </span>
                            </div>
                            <div className="adm-breakdown__bar-bg">
                              <div
                                className="adm-breakdown__bar"
                                style={{
                                  width: loading ? "0%" : `${pct}%`,
                                  background: color,
                                }}
                              />
                            </div>
                            <span className="adm-breakdown__pct">
                              {loading ? "" : `${pct}%`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="adm-card">
                    <div className="adm-card__head">
                      <h2>Ações rápidas</h2>
                    </div>
                    <div className="adm-quick">
                      <Link to="/cadastrar" className="adm-quick__btn">
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

                {/* TABELA RECENTES */}
                <div className="adm-card adm-card--full">
                  <div className="adm-card__head">
                    <h2>Imóveis recentes</h2>
                    <Link to="/imoveis" className="adm-card__link">
                      Ver todos →
                    </Link>
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
                      <Link to="/cadastrar" className="adm-btn-primary">
                        Cadastrar primeiro imóvel
                      </Link>
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
                                      src={
                                        mediaUrl(im.imagem)
                                      }
                                      alt={im.edificio || im.tipo_imovel}
                                      className="adm-table__thumb"
                                    />
                                  ) : (
                                    <div className="adm-table__thumb adm-table__thumb--empty">
                                      <FaBuilding />
                                    </div>
                                  )}
                                  <span>
                                    {im.edificio || im.tipo_imovel || "—"}
                                  </span>
                                </div>
                              </td>
                              <td>{im.tipo_imovel || "—"}</td>
                              <td>
                                <span
                                  className={`adm-tag ${
                                    im.finalidade
                                      ?.toLowerCase()
                                      .includes("venda")
                                      ? "adm-tag--venda"
                                      : "adm-tag--aluguel"
                                  }`}
                                >
                                  {im.finalidade || "—"}
                                </span>
                              </td>
                              <td>
                                {im.cidade || "—"}
                                {im.uf ? `/${im.uf}` : ""}
                              </td>
                              <td className="adm-table__valor">
                                {im.valor ? fmtReal(im.valor) : "—"}
                              </td>
                              <td>
                                {im.ativo !== 0 ? (
                                  <span className="adm-status adm-status--on">
                                    <FaCheckCircle /> Ativo
                                  </span>
                                ) : (
                                  <span className="adm-status adm-status--off">
                                    <FaTimesCircle /> Inativo
                                  </span>
                                )}
                              </td>
                              <td>
                                <div className="adm-table__actions">
                                  <Link
                                    to={`/editar/${im.id}`}
                                    className="adm-icon-btn adm-icon-btn--edit"
                                    title="Editar"
                                  >
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
            )}

            {/* LISTA COMPLETA DE IMÓVEIS */}
            {currentTab === "imoveis" && (
              <div className="page page--active page--imoveis">
                <div className="adm-card">
                  <div className="adm-card__head">
                    <h2>
                      <FaClipboardList /> Imóveis cadastrados
                    </h2>
                    <Link to="/cadastrar" className="adm-btn-primary">
                      Novo
                    </Link>
                  </div>
                  {loading ? (
                    <div className="adm-loading">
                      <div className="adm-spinner" />
                      <p>Carregando…</p>
                    </div>
                  ) : imoveis.length === 0 ? (
                    <div className="adm-empty">
                      <FaBuilding />
                      <p>Nenhum imóvel cadastrado.</p>
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
                          {imoveis.map((im) => (
                            <tr key={im.id}>
                              <td>
                                <div className="adm-table__imovel">
                                  {im.imagem ? (
                                    <img
                                      src={mediaUrl(im.imagem)}
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
                                <span
                                  className={`adm-tag ${
                                    im.finalidade
                                      ?.toLowerCase()
                                      .includes("venda")
                                      ? "adm-tag--venda"
                                      : "adm-tag--aluguel"
                                  }`}
                                >
                                  {im.finalidade || "—"}
                                </span>
                              </td>
                              <td>
                                {im.cidade || "—"}
                                {im.uf ? `/${im.uf}` : ""}
                              </td>
                              <td className="adm-table__valor">
                                {im.valor ? fmtReal(im.valor) : "—"}
                              </td>
                              <td>
                                {im.ativo !== 0 ? (
                                  <span className="adm-status adm-status--on">
                                    <FaCheckCircle /> Ativo
                                  </span>
                                ) : (
                                  <span className="adm-status adm-status--off">
                                    <FaTimesCircle /> Inativo
                                  </span>
                                )}
                              </td>
                              <td>
                                <div className="adm-table__actions">
                                  <Link
                                    to={`/editar/${im.id}`}
                                    className="adm-icon-btn adm-icon-btn--edit"
                                    title="Editar"
                                  >
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
            )}

          {/* FIM: PÁGINAS DA PRANCHETA */}
        </div>
        </div>
      </div>
    </div>
  );
}

/* ── MÉTRICA REUTILIZÁVEL ── */
function Metric({ icon, label, value, sub, color }) {
  return (
    <div className={`adm-metric adm-metric--${color}`}>
      <div className="adm-metric__icon">{icon}</div>
      <div className="adm-metric__info">
        <span className="adm-metric__label">{label}</span>
        <span className="adm-metric__value">{value}</span>
        <span className="adm-metric__sub">{sub}</span>
      </div>
    </div>
  );
}
