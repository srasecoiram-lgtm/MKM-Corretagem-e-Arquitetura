import React, { useState, useRef } from "react";
import { useNavigate }              from "react-router-dom";
import { FaSearch }                 from "react-icons/fa";
import FiltrosImovel                from "../pages/FiltrosImoveis";
import "../styles/SearchBar.css";

/**
 * BannerBusca — banner hero com barra de busca e filtros.
 *
 * Props:
 *   onBuscar  {function}  recebe { query, modo, filtros } ao submeter
 *             Se não passado, redireciona para /imoveis?q=...
 */
export default function BannerBusca({ onBuscar }) {
  const [modo, setModo]           = useState("comprar");
  const [mostrarMais, setMostrarMais] = useState(false);
  const [query, setQuery]         = useState("");
  const [filtros, setFiltros]     = useState({});
  const navigate                  = useNavigate();
  const inputRef                  = useRef(null);

  const handleBuscar = (e) => {
    e.preventDefault();
    if (onBuscar) {
      onBuscar({ query, modo, filtros });
    } else {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (modo  ) params.set("finalidade", modo === "comprar" ? "Venda" : "Aluguel");
      navigate(`/imoveis?${params.toString()}`);
    }
  };

  return (
    <div className="banner">
      <div className="banner-overlay">
        <h1>
          A história do seu lar
          <br />
          começa aqui.
        </h1>

        <div className="search-wrapper">

          {/* ABAS */}
          <div className="filtro-abas">
            <button
              type="button"
              className={`tab ${modo === "comprar" ? "ativo" : ""}`}
              onClick={() => setModo("comprar")}
            >
              Comprar
            </button>
            <button
              type="button"
              className={`tab ${modo === "alugar" ? "ativo" : ""}`}
              onClick={() => setModo("alugar")}
            >
              Alugar
            </button>
          </div>

          {/* BUSCA */}
          <form className="search-section" onSubmit={handleBuscar}>
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Busque por bairro, cidade ou empreendimento"
                aria-label="Buscar imóveis"
              />
              <button type="submit" className="btn-buscar">
                Buscar
              </button>
              <button
                type="button"
                className="botao-toggle"
                onClick={() => setMostrarMais((p) => !p)}
                aria-expanded={mostrarMais}
              >
                {mostrarMais ? "Ocultar filtros" : "Filtros"}
              </button>
            </div>

            <FiltrosImovel
              modo={modo}
              mostrarMais={mostrarMais}
              setMostrarMais={setMostrarMais}
              onFiltrar={setFiltros}
            />
          </form>

        </div>
      </div>
    </div>
  );
}
