import React, { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/AdminDashboard.css";

/**
 * TabelaImoveis — exibe relatório mensal.
 *
 * Props:
 *   dados  {array}  se passado, usa dados externos (modo estático)
 *                   se omitido, busca de /admin/relatorios
 */
export default function TabelaImoveis({ dados: dadosExterno }) {
  const [dadosMensais, setDadosMensais] = useState(
    dadosExterno || null   /* null = carregando */
  );
  const [error, setError] = useState(null);

  useEffect(() => {
    if (dadosExterno) return;   /* dados já vêm de fora */

    /* Fallback estático enquanto a rota /admin/relatorios não existe */
    const fallback = [
      { mes: "Janeiro",  vendidos: 5, cadastrados: 8,  realocados: 2, lucro: 12000 },
      { mes: "Fevereiro",vendidos: 3, cadastrados: 6,  realocados: 1, lucro:  8000 },
      { mes: "Março",    vendidos: 7, cadastrados: 10, realocados: 4, lucro: 18000 },
      { mes: "Abril",    vendidos: 2, cadastrados: 4,  realocados: 1, lucro:  4000 },
    ];

    api.get("/admin/relatorios")
      .then((res) => setDadosMensais(res.data))
      .catch(() => {
        /* Rota ainda não existe — usa fallback */
        setDadosMensais(fallback);
      });
  }, [dadosExterno]);

  /* ── TOTAIS ── */
  const totais = dadosMensais?.reduce(
    (acc, r) => ({
      vendidos:    acc.vendidos    + r.vendidos,
      cadastrados: acc.cadastrados + r.cadastrados,
      realocados:  acc.realocados  + r.realocados,
      lucro:       acc.lucro       + r.lucro,
    }),
    { vendidos: 0, cadastrados: 0, realocados: 0, lucro: 0 }
  );

  const media = dadosMensais
    ? {
        vendidos:    (totais.vendidos    / dadosMensais.length).toFixed(1),
        cadastrados: (totais.cadastrados / dadosMensais.length).toFixed(1),
        realocados:  (totais.realocados  / dadosMensais.length).toFixed(1),
        lucro:       (totais.lucro       / dadosMensais.length).toFixed(0),
      }
    : null;

  if (!dadosMensais) {
    return (
      <div className="tabela-container">
        <div className="tabela-loading">Carregando relatório...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tabela-container">
        <p className="tabela-error">{error}</p>
      </div>
    );
  }

  return (
    <div className="tabela-container">
      <h3>Relatório Mensal de Imóveis</h3>

      <table className="tabela-imoveis">
        <thead>
          <tr>
            <th>Mês</th>
            <th>Vendidos</th>
            <th>Cadastrados</th>
            <th>Realocados</th>
            <th>Lucro (R$)</th>
          </tr>
        </thead>
        <tbody>
          {dadosMensais.map((item, i) => (
            <tr key={i}>
              <td>{item.mes}</td>
              <td>{item.vendidos}</td>
              <td>{item.cadastrados}</td>
              <td>{item.realocados}</td>
              <td>R$ {Number(item.lucro).toLocaleString("pt-BR")}</td>
            </tr>
          ))}

          {/* linha de totais */}
          <tr className="tabela-totais">
            <td>Total</td>
            <td>{totais.vendidos}</td>
            <td>{totais.cadastrados}</td>
            <td>{totais.realocados}</td>
            <td>R$ {Number(totais.lucro).toLocaleString("pt-BR")}</td>
          </tr>

          {/* linha de médias */}
          <tr className="tabela-media">
            <td>Média / mês</td>
            <td>{media.vendidos}</td>
            <td>{media.cadastrados}</td>
            <td>{media.realocados}</td>
            <td>R$ {Number(media.lucro).toLocaleString("pt-BR")}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
