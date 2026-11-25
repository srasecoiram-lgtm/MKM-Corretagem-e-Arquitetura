import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router";
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

  const [params, setParams] = useSearchParams();
  const [ordenar, setOrdenar] = useState("recente");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [retry, setRetry] = useState(0);
  const tipo = params.get("tipo") || "todos";
  const finalidade = params.get("finalidade") || "todos";
  const busca = params.get("q") || "";
  const valorMin = params.get("precoMin") || "";
  const valorMax = params.get("precoMax") || "";
  const quartos = params.get("quartos") || "";
  const vagas = params.get("vagas") || "";

  function updateFilter(key, value) {
    const updated = new URLSearchParams(params);
    if (value && value !== "todos") updated.set(key, value);
    else updated.delete(key);
    setParams(updated, { replace: true });
  }

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get("/imoveis", {
          signal: controller.signal,
          params: {
            tipo: tipo === "todos" ? undefined : tipo,
            finalidade: finalidade === "todos" ? undefined : finalidade,
            q: busca.trim() || undefined,
            precoMin: valorMin || undefined,
            precoMax: valorMax || undefined,
            quartos: quartos || undefined,
            vagas: vagas || undefined,
          },
        });
        setImoveis(Array.isArray(data) ? data : []);
      } catch (error) {
        if (controller.signal.aborted) return;
        setImoveis([]);
        setError(error.response?.data?.erro || "Não foi possível carregar os imóveis.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 180);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [tipo, finalidade, busca, valorMin, valorMax, quartos, vagas, retry]);

  const filtrados = useMemo(() => {
    const comparators = {
      menor: (a, b) => Number(a.valor ?? Infinity) - Number(b.valor ?? Infinity),
      maior: (a, b) => Number(b.valor ?? -1) - Number(a.valor ?? -1),
      area: (a, b) => Number(b.area_total ?? -1) - Number(a.area_total ?? -1),
    };
    return comparators[ordenar] ? [...imoveis].sort(comparators[ordenar]) : imoveis;
  }, [imoveis, ordenar]);

  function limparFiltros() {
    setParams({}, { replace: true });
    setOrdenar("recente");
  }

  const temFiltroAtivo = Boolean(tipo !== "todos" || finalidade !== "todos" || busca.trim() ||
    valorMin || valorMax || quartos || vagas);

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
              aria-label="Buscar imóveis"
              placeholder="Busque por bairro, empreendimento ou cidade…"
              value={busca}
              onChange={(e) => updateFilter("q", e.target.value)}
            />
            {busca && (
              <button type="button" aria-label="Limpar busca" className="li-search__clear" onClick={() => updateFilter("q", "")}>
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
              aria-pressed={tipo === t.key}
              className={`li-tab ${tipo === t.key ? "li-tab--on" : ""}`}
              onClick={() => updateFilter("tipo", t.key)}
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
                aria-pressed={finalidade === f}
                className={`li-pill ${finalidade === f ? "li-pill--on" : ""}`}
                onClick={() => updateFilter("finalidade", f)}
              >
                {f === "todos" ? "Todos" : f}
              </button>
            ))}
          </div>

          <div className="li-select-wrap">
            <FaSortAmountDown />
            <select aria-label="Ordenar imóveis" value={ordenar} onChange={(e) => setOrdenar(e.target.value)}>
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
            aria-expanded={mostrarFiltros}
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
              <label htmlFor="preco-min">Valor mínimo</label>
              <div className="li-advanced__input">
                <span>R$</span>
                <input
                  type="number"
                  id="preco-min" min="0" step="0.01"
                  placeholder="0"
                  value={valorMin}
                  onChange={(e) => updateFilter("precoMin", e.target.value)}
                />
              </div>
            </div>
            <div className="li-advanced__grupo">
              <label htmlFor="preco-max">Valor máximo</label>
              <div className="li-advanced__input">
                <span>R$</span>
                <input
                  type="number"
                  id="preco-max" min="0" step="0.01"
                  placeholder="Sem limite"
                  value={valorMax}
                  onChange={(e) => updateFilter("precoMax", e.target.value)}
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
        <span aria-live="polite">
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
            <p role="alert">{error}</p>
            <button className="li-retry" onClick={() => setRetry((count) => count + 1)}>
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
