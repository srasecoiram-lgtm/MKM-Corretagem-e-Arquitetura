import React, { useEffect, useState, useCallback, useMemo } from "react";
import api          from "../services/api";
import Header       from "../components/Header";
import Footer       from "../components/Footer";
import CardImovel   from "../components/ImovelCard";
import {
  FaSearch,
  FaFilter,
  FaHome,
  FaBuilding,
  FaTimes,
  FaSortAmountDown,
  FaMapMarkerAlt,
} from "react-icons/fa";
import "../styles/ListarImoveis.css";

const TIPOS = [
  { key: "todos",       label: "Todos",        icon: "🏘️" },
  { key: "Apartamento", label: "Apartamentos", icon: "🏢" },
  { key: "Casa",        label: "Casas",        icon: "🏠" },
  { key: "Terreno",     label: "Terrenos",     icon: "🌿" },
  { key: "Comercial",   label: "Comercial",    icon: "🏪" },
];

const ORDENAR = [
  { key: "recente", label: "Mais recentes" },
  { key: "menor",   label: "Menor preço"   },
  { key: "maior",   label: "Maior preço"   },
  { key: "area",    label: "Maior área"    },
];

export default function ListarImoveis() {
  const [imoveis,     setImoveis]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

  const [tipo,        setTipo]        = useState("todos");
  const [finalidade,  setFinalidade]  = useState("todos");
  const [busca,       setBusca]       = useState("");
  const [ordenar,     setOrdenar]     = useState("recente");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [valorMin,    setValorMin]    = useState("");
  const [valorMax,    setValorMax]    = useState("");

  const fetchImoveis = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/imoveis", {
        params: {
          tipo,
          finalidade: finalidade === "todos" ? undefined : finalidade,
          q: busca || undefined,
          metragemMin: valorMin || undefined,
          metragemMax: valorMax || undefined,
          precoMin: valorMin ? Number(valorMin) : undefined,
          precoMax: valorMax ? Number(valorMax) : undefined,
        },
      });
      setImoveis(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Não foi possível carregar os imóveis.");
    } finally {
      setLoading(false);
    }
  }, [tipo, finalidade, busca, valorMin, valorMax]);

  useEffect(() => { fetchImoveis(); }, [fetchImoveis]);

  const filtrados = useMemo(() => {
    let lista = [...imoveis];

    if (tipo !== "todos")
      lista = lista.filter((i) => i.tipo_imovel === tipo);

    if (finalidade !== "todos")
      lista = lista.filter((i) =>
        (i.finalidade || "").toLowerCase().includes(finalidade.toLowerCase())
      );

    if (busca.trim()) {
      const q = busca.trim().toLowerCase();
      lista = lista.filter((i) =>
        [
          i.edificio,
          i.tipo_imovel,
          i.bairro,
          i.cidade,
          i.logradouro,
          i.descricao,
        ].some((v) => (v || "").toLowerCase().includes(q))
      );
    }

    if (valorMin)
      lista = lista.filter((i) => parseFloat(i.valor || 0) >= parseFloat(valorMin));

    if (valorMax)
      lista = lista.filter((i) => parseFloat(i.valor || 0) <= parseFloat(valorMax));

    switch (ordenar) {
      case "menor":
        lista.sort((a, b) => (a.valor || 0) - (b.valor || 0));
        break;
      case "maior":
        lista.sort((a, b) => (b.valor || 0) - (a.valor || 0));
        break;
      case "area":
        lista.sort((a, b) => (b.area_total || 0) - (a.area_total || 0));
        break;
      default:
        lista.sort(
          (a, b) => new Date(b.criado_em || 0) - new Date(a.criado_em || 0)
        );
    }

    return lista;
  }, [imoveis, tipo, finalidade, busca, valorMin, valorMax, ordenar]);

  const limparFiltros = () => {
    setTipo("todos");
    setFinalidade("todos");
    setBusca("");
    setOrdenar("recente");
    setValorMin("");
    setValorMax("");
  };

  const temFiltroAtivo =
    tipo !== "todos" ||
    finalidade !== "todos" ||
    busca.trim() ||
    valorMin ||
    valorMax;

  return (
    <div className="li-page">
      <Header />

      <div className="li-hero">
        <div className="li-hero__inner">
          <h1>Imóveis Disponíveis</h1>
          <p>Encontre o imóvel ideal em Praia Grande e região</p>
          <div className="li-search">
            <FaSearch className="li-search__icon" />
            <input
              type="text"
              placeholder="Busque por bairro, empreendimento ou cidade…"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            {busca && (
              <button className="li-search__clear" onClick={() => setBusca("")}>
                <FaTimes />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="li-tabs-wrap">
        <div className="li-tabs">
          {TIPOS.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`li-tab ${tipo === t.key ? "li-tab--on" : ""}`}
              onClick={() => setTipo(t.key)}
            >
              <span className="li-tab__icon">{t.icon}</span>
              <span className="li-tab__label">{t.label}</span>
            </button>
          ))}
        </div>

        <div className="li-controls">
          <div className="li-pills">
            {["todos", "Venda", "Aluguel"].map((f) => (
              <button
                key={f}
                type="button"
                className={`li-pill ${finalidade === f ? "li-pill--on" : ""}`}
                onClick={() => setFinalidade(f)}
              >
                {f === "todos" ? "Todos" : f}
              </button>
            ))}
          </div>

          <div className="li-select-wrap">
            <FaSortAmountDown />
            <select value={ordenar} onChange={(e) => setOrdenar(e.target.value)}>
              {ORDENAR.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className={`li-btn-filter ${mostrarFiltros ? "li-btn-filter--on" : ""}`}
            onClick={() => setMostrarFiltros((p) => !p)}
          >
            <FaFilter />
            Filtros
            {temFiltroAtivo && <span className="li-filter-dot" />}
          </button>
        </div>
      </div>

      {mostrarFiltros && (
        <div className="li-advanced">
          <div className="li-advanced__inner">
            <div className="li-advanced__grupo">
              <label>Valor mínimo</label>
              <div className="li-advanced__input">
                <span>R$</span>
                <input
                  type="number"
                  placeholder="0"
                  value={valorMin}
                  onChange={(e) => setValorMin(e.target.value)}
                />
              </div>
            </div>
            <div className="li-advanced__grupo">
              <label>Valor máximo</label>
              <div className="li-advanced__input">
                <span>R$</span>
                <input
                  type="number"
                  placeholder="Sem limite"
                  value={valorMax}
                  onChange={(e) => setValorMax(e.target.value)}
                />
              </div>
            </div>
            {temFiltroAtivo && (
              <button type="button" className="li-clear-btn" onClick={limparFiltros}>
                <FaTimes /> Limpar filtros
              </button>
            )}
          </div>
        </div>
      )}

      <div className="li-results-bar">
        <span>
          {loading
            ? "Carregando…"
            : `${filtrados.length} ${
                filtrados.length === 1 ? "imóvel encontrado" : "imóveis encontrados"
              }`}
          {temFiltroAtivo && !loading && (
            <button className="li-clear-inline" onClick={limparFiltros}>
              Limpar filtros
            </button>
          )}
        </span>
      </div>

      <div className="li-content">
        {loading ? (
          <div className="li-state">
            <div className="li-spinner" />
            <p>Carregando imóveis…</p>
          </div>
        ) : error ? (
          <div className="li-state li-state--error">
            <FaBuilding />
            <p>{error}</p>
            <button className="li-retry" onClick={fetchImoveis}>
              Tentar novamente
            </button>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="li-state li-state--empty">
            <FaHome />
            <p>Nenhum imóvel encontrado com esses filtros.</p>
            <button className="li-retry" onClick={limparFiltros}>
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="li-grid">
            {filtrados.map((imovel) => (
              <CardImovel key={imovel.id} imovel={imovel} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
