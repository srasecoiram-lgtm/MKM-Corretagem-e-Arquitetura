import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "../styles/ImovelDetalhe.css";
import Header from "../components/Header";

export default function DetalhesImovel() {
  const { id } = useParams();
  const [imovel, setImovel] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:3000/imoveis/${id}`)
      .then((res) => setImovel(res.data))
      .catch((err) => console.error("Erro ao buscar detalhes:", err));
  }, [id]);

  if (!imovel) return <div>Carregando...</div>;

  return (
    <div className="detalhes-container">
      <Header />

      <div className="detalhes-wrapper">
        <img src={imovel.imagem} alt={imovel.titulo} className="imagem-principal" />

        <div className="detalhes-info">
          <h1>{imovel.titulo}</h1>
          <p className="preco">R$ {Number(imovel.preco).toLocaleString()}</p>
          <p className="endereco">📍 {imovel.endereco}</p>
          <p className="metragem">📐 {imovel.metragem} m²</p>
          <p className="status">
            {imovel.status === "Disponível" ? "✅ Disponível" : "❌ Indisponível"}
          </p>
          <h3>Descrição do imóvel</h3>
          <p className="descricao">{imovel.descricao}</p>
        </div>
      </div>
      <Link className="voltar-btn" to="/"><span>←</span> Voltar</Link>
    </div>
  );
}
