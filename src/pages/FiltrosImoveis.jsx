import React, { useState } from "react";
import "../styles/Filtros.css";

export default function FiltrosImovel({ modo = "comprar", onFiltrar, mostrarMais }) {
  const [filtros, setFiltros] = useState({
    valorMin: "", valorMax: "",
    dormitorios: [], vagas: [],
    mobiliado: false, aceitaPet: false,
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
      mobiliado: false, aceitaPet: false,
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
              <input type="number" placeholder="Mínimo"
                value={filtros.valorMin}
                onChange={(e) => set("valorMin", e.target.value)} />
            </div>
            <span className="filtros-dash">—</span>
            <div className="filtros-input-box">
              <span className="filtros-cifra">R$</span>
              <input type="number" placeholder="Máximo"
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
                onClick={() => toggle("dormitorios", n)}>{n}</button>
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
                onClick={() => toggle("vagas", n)}>{n}</button>
            ))}
          </div>
        </div>

        {modo === "alugar" && (
          <>
            <div className="filtros-vline" />
            <div className="filtros-bloco">
              <span className="filtros-label">Extras</span>
              <div className="filtros-chips">
                <button type="button"
                  className={`f-chip f-chip--txt ${filtros.mobiliado ? "f-chip--on" : ""}`}
                  onClick={() => set("mobiliado", !filtros.mobiliado)}>Mobiliado</button>
                <button type="button"
                  className={`f-chip f-chip--txt ${filtros.aceitaPet ? "f-chip--on" : ""}`}
                  onClick={() => set("aceitaPet", !filtros.aceitaPet)}>Aceita pet</button>
              </div>
            </div>
          </>
        )}

        <button type="button" className="filtros-clear" onClick={limpar}>Limpar</button>
      </div>
    </div>
  );
}
