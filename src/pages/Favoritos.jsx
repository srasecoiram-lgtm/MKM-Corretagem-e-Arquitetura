import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ImovelCard from "../components/ImovelCard";
import api from "../services/api";
import { useFavoritos } from "../services/favoritos";
import "../styles/ListarImoveis.css";

export default function Favoritos() {
  const ids = useFavoritos();
  const [state, setState] = useState({ loading: false, properties: [] });

  useEffect(() => {
    if (!ids.length) return;
    const controller = new AbortController();
    setState({ loading: true, properties: [] });
    api.get("/imoveis", { signal: controller.signal })
      .then(({ data }) => setState({ properties: Array.isArray(data) ? data : [] }))
      .catch(() => {
        if (!controller.signal.aborted) setState({ error: true, properties: [] });
      });
    return () => controller.abort();
  }, [ids]);

  const properties = ids.flatMap((id) => state.properties.filter((property) => String(property.id) === id));

  return (
    <div className="li-page">
      <Header />
      <main>
        <div className="li-hero"><div className="li-hero__inner"><h1>Meus favoritos</h1></div></div>
        <div className="li-content">
          {!ids.length ? (
            <div className="li-state">
              <p>Você ainda não salvou imóveis.</p>
              <Link to="/imoveis" className="li-retry">Explorar imóveis</Link>
            </div>
          ) : state.loading ? <p role="status">Carregando favoritos…</p>
            : state.error ? <p role="alert">Não foi possível carregar seus favoritos.</p>
            : properties.length ? (
              <div className="li-grid">{properties.map((property) => <ImovelCard key={property.id} imovel={property} />)}</div>
            ) : <p>Os imóveis salvos estão indisponíveis.</p>}
        </div>
      </main>
      <Footer />
    </div>
  );
}
