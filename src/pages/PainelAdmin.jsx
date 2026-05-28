import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import "../styles/PainelAdmin.css";

export default function PainelAdmin() {
  const [imoveis, setImoveis] = useState([]);

  useEffect(() => {
    carregarImoveis();
  }, []);

  const carregarImoveis = () => {
    axios.get("http://localhost:3000/imoveis")
      .then((res) => setImoveis(res.data))
      .catch((err) => console.error("Erro ao buscar imóveis:", err));
  };

  const excluirImovel = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este imóvel?")) {
      try {
        await axios.delete(`http://localhost:3000/imoveis/${id}`);
        carregarImoveis(); // Recarrega a lista após exclusão
      } catch (err) {
        alert("Erro ao excluir o imóvel.");
        console.error(err);
      }
    }
  };

  return (
    <div className="painel-container">
      <Header />
      <h2 className="titulo-pagina">Painel do Administrador</h2>
      <Link className="btn-adicionar" to="/cadastrar">+ Adicionar Imóvel</Link>

      <div className="cards-container">
        {imoveis.length === 0 ? (
          <p>Nenhum imóvel cadastrado.</p>
        ) : (
          imoveis.map((imovel) => (
            <div className="card" key={imovel.id}>
              <img src={imovel.imagem} alt={imovel.titulo} />
              <div className="card-info">
                <h3>{imovel.titulo}</h3>
                <p><strong>📍</strong> {imovel.endereco}</p>
                <p><strong>📐</strong> {imovel.metragem} m²</p>
                <p className={imovel.status === "Disponível" ? "disponivel" : "indisponivel"}>
                  {imovel.status}
                </p>
                <p className="preco">R$ {Number(imovel.preco).toLocaleString()}</p>

                <div className="botoes">
                  <Link to={`/editar/${imovel.id}`} className="btn-editar">Editar</Link>
                  <button onClick={() => excluirImovel(imovel.id)} className="btn-excluir">Excluir</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
