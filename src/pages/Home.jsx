import React, { useState, useEffect } from "react";
import Header     from "../components/Header";
import BannerBusca from "../components/SearchBar";
import ImovelCard  from "../components/ImovelCard";
import SobreTexto  from "../components/SobreTexto";
import Footer      from "../components/Footer";
import api         from "../services/api";
import "../styles/Home.css";

export default function Home() {
  const [ultimosImoveis, setUltimosImoveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    const fetchUltimos = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/imoveis");

        const ordenados = [...data].sort(
          (a, b) => new Date(b.criado_em) - new Date(a.criado_em)
        );

        setUltimosImoveis(ordenados.slice(0, 3));
      } catch (err) {
        console.error("Erro ao buscar últimos imóveis:", err);
        setError("Não foi possível carregar os imóveis recentes.");
      } finally {
        setLoading(false);
      }
    };

    fetchUltimos();
  }, []);

  return (
    <div>
      <Header />
      <BannerBusca />

      {/* ── ÚLTIMOS IMÓVEIS ── */}
      <section className="ultimos-imoveis-section">
        <div className="section-header">
          <h2>Últimos Imóveis Cadastrados</h2>
          <p>Confira as novidades em nosso portfólio</p>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner" />
            <p>Carregando imóveis...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
          </div>
        ) : ultimosImoveis.length === 0 ? (
          <div className="empty-container">
            <p>Nenhum imóvel cadastrado ainda.</p>
          </div>
        ) : (
          <div className="imoveis-grid-home">
            {ultimosImoveis.map((imovel) => (
              <ImovelCard key={imovel.id} imovel={imovel} />
            ))}
          </div>
        )}
      </section>

      <SobreTexto />
      <Footer />
    </div>
  );
}