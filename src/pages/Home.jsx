// Home.jsx
import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import BannerBusca from "../components/SearchBar";
import ImovelCard from "../components/ImovelCard";
import SobreTexto from "../components/SobreTexto";
import Footer  from "../components/Footer";
import "../styles/Home.css";
import axios from "axios";

export default function Home() {
  const [ultimosImoveis, setUltimosImoveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUltimosImoveis = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:3002/imoveis");
        
        // Ordenar por data de criação e pegar os 3 mais recentes
        const imoveisOrdenados = response.data.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        
        const ultimosTres = imoveisOrdenados.slice(0, 3);
        setUltimosImoveis(ultimosTres);
      } catch (err) {
        console.error("Erro ao buscar últimos imóveis:", err);
        setError("Não foi possível carregar os imóveis recentes");
      } finally {
        setLoading(false);
      }
    };

    fetchUltimosImoveis();
  }, []);

  return (
    <div>
      <Header />
      <BannerBusca />

      {/* Seção de últimos imóveis */}
      <section className="ultimos-imoveis-section">
        <div className="section-header">
          <h2>Últimos Imóveis Cadastrados</h2>
          <p>Confira as novidades em nosso portfólio</p>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Carregando imóveis...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
          </div>
        ) : ultimosImoveis.length === 0 ? (
          <div className="empty-container">
            <p>Nenhum imóvel cadastrado ainda</p>
          </div>
        ) : (
          <div className="imoveis-grid-home">
            {ultimosImoveis.map((imovel) => (
              <ImovelCard key={imovel.id} imovel={imovel} />
            ))}
          </div>
        )}
      </section>

      {/* Sessão 'Quem Somos' abaixo dos cards */}
      <SobreTexto />
      <Footer />
    </div>
  );
}