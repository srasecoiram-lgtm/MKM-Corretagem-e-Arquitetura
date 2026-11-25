import React, { useState } from "react";
import "../styles/Filtros.css";

export default function FiltrosImovel({ onFiltrar, mostrarMais }) {
  const [filtros, setFiltros] = useState({
    valorMin: "", valorMax: "",
    dormitorios: [], vagas: [],
  });

  const set = (campo, valor) => {
    const next = { ...filtros, [campo]: valor };
    setFiltros(next);
    onFiltrar?.(next);
  };

  const toggle = (campo, valor) => {
    const atual = filtros[campo];
    const next  = atual.includes(valor)
      ? atual.filter((v) => v !== valor)
      : [...atual, valor];
    set(campo, next);
  };

  const limpar = () => {
    const clean = {
      valorMin: "", valorMax: "",
      dormitorios: [], vagas: [],
      };
    setFiltros(clean);
    onFiltrar?.(clean);
  };

  if (!mostrarMais) return null;

  return (
    <div className="filtros-painel">
      <div className="filtros-row">

        <div className="filtros-bloco">
          <span className="filtros-label">Valor</span>
          <div className="filtros-valor">
            <div className="filtros-input-box">
              <span className="filtros-cifra">R$</span>
              <input type="number" min="0" step="0.01" aria-label="Valor mínimo" placeholder="Mínimo"
                value={filtros.valorMin}
                onChange={(e) => set("valorMin", e.target.value)} />
            </div>
            <span className="filtros-dash">—</span>
            <div className="filtros-input-box">
              <span className="filtros-cifra">R$</span>
              <input type="number" min="0" step="0.01" aria-label="Valor máximo" placeholder="Máximo"
                value={filtros.valorMax}
                onChange={(e) => set("valorMax", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="filtros-vline" />

        <div className="filtros-bloco">
          <span className="filtros-label">Dorms.</span>
          <div className="filtros-chips">
            {[1, 2, 3, "4+"].map((n) => (
              <button key={n} type="button"
                className={`f-chip ${filtros.dormitorios.includes(n) ? "f-chip--on" : ""}`}
                aria-pressed={filtros.dormitorios.includes(n)} onClick={() => toggle("dormitorios", n)}>{n}</button>
            ))}
          </div>
        </div>

        <div className="filtros-vline" />

        <div className="filtros-bloco">
          <span className="filtros-label">Vagas</span>
          <div className="filtros-chips">
            {[1, 2, 3, "4+"].map((n) => (
              <button key={n} type="button"
                className={`f-chip ${filtros.vagas.includes(n) ? "f-chip--on" : ""}`}
                aria-pressed={filtros.vagas.includes(n)} onClick={() => toggle("vagas", n)}>{n}</button>
            ))}
          </div>
        </div>

        <button type="button" className="filtros-clear" onClick={limpar}>Limpar</button>
      </div>
    </div>
  );
}
