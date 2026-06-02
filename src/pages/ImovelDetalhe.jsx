import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import Header from "../components/Header";
import {
  FaMapMarkerAlt,
  FaRulerCombined,
  FaBed,
  FaBath,
  FaCar,
  FaHammer,
  FaWhatsapp,
  FaChevronLeft,
} from "react-icons/fa";
import "../styles/ImovelDetalhe.css";

export default function DetalhesImovel() {
  const { id } = useParams();
  const [imovel, setImovel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3002";
  const WA_NUM = process.env.REACT_APP_WHATSAPP || "5511992931055";

  useEffect(() => {
    const carregar = async () => {
      try {
        const { data } = await api.get(`/imoveis/${id}`);
        if (!data?.id) throw new Error("Não encontrado");
        setImovel(data);
      } catch (err) {
        console.error("Erro ao buscar detalhes:", err);
        setError("Imóvel não encontrado ou indisponível.");
      } finally {
        setLoading(false);
      }
    };

    carregar();
  }, [id]);

  const fmtPreco = () => {
    if (!imovel?.valor) return null;
    const num = Number(imovel.valor);
    if (!Number.isFinite(num)) return null;
    return `R$ ${num.toLocaleString("pt-BR")}`;
  };

  const fmtEndereco = () => {
    const parts = [
      imovel.logradouro,
      imovel.numero && `, ${imovel.numero}`,
      imovel.bairro && ` — ${imovel.bairro}`,
      imovel.cidade && `/ ${imovel.cidade}`,
      imovel.uf && `/${imovel.uf}`,
    ].filter(Boolean);
    return parts.join("") || "Endereço não informado";
  };

  const fmtArea = () => {
    if (imovel.area_total) return `${Number(imovel.area_total).toLocaleString("pt-BR")} m²`;
    if (imovel.area_minima && imovel.area_maxima)
      return `${Number(imovel.area_minima).toLocaleString("pt-BR")} – ${Number(imovel.area_maxima).toLocaleString("pt-BR")} m²`;
    return null;
  };

  const abrirWhatsApp = () => {
    const nome = imovel.edificio || imovel.tipo_imovel || "imóvel";
    const msg = `Olá! Tenho interesse no ${nome} — ${fmtEndereco()}`;
    window.open(
      `https://wa.me/${WA_NUM}?text=${encodeURIComponent(msg)}`,
      "_blank"
    );
  };

  if (loading)
    return (
      <div className="detalhes-container">
        <Header />
        <p className="detalhes-loading">Carregando detalhes do imóvel…</p>
      </div>
    );

  if (error || !imovel)
    return (
      <div className="detalhes-container">
        <Header />
        <div className="detalhes-state detalhes-state--error">
          <p>{error || "Imóvel indisponível."}</p>
          <Link className="detalhes-back" to="/imoveis">
            <FaChevronLeft /> Voltar para imóveis
          </Link>
        </div>
      </div>
    );

  const imagemSrc = imovel.imagem ? `${API_URL}${imovel.imagem}` : null;

  return (
    <div className="detalhes-container">
      <Header />

      <div className="detalhes-wrapper">
        {imagemSrc && (
          <div className="detalhes-media">
            <img src={imagemSrc} alt={imovel.edificio || imovel.tipo_imovel} />
          </div>
        )}

        <div className="detalhes-info">
          <div className="detalhes-tag">
            {imovel.finalidade || "Imóvel"}
          </div>
          <h1>{imovel.edificio || imovel.tipo_imovel || "Imóvel"}</h1>

          <p className="detalhes-preco">
            {fmtPreco() ? (
              fmtPreco()
            ) : (
              <span className="detalhes-preco--consulte">Consulte</span>
            )}
          </p>

          <div className="detalhes-local">
            <FaMapMarkerAlt />
            <span>{fmtEndereco()}</span>
          </div>

          <div className="detalhes-chips">
            {imovel.tipo_imovel && (
              <span className="detalhes-chip">{imovel.tipo_imovel}</span>
            )}
            {imovel.finalidade && (
              <span className="detalhes-chip">{imovel.finalidade}</span>
            )}
            {fmtArea() && (
              <span className="detalhes-chip">
                <FaRulerCombined /> {fmtArea()}
              </span>
            )}
            {imovel.quartos ? (
              <span className="detalhes-chip">
                <FaBed /> {imovel.quartos} quarto
                {imovel.quartos > 1 ? "s" : ""}
              </span>
            ) : null}
            {imovel.banheiros ? (
              <span className="detalhes-chip">
                <FaBath /> {imovel.banheiros} banheiro
                {imovel.banheiros > 1 ? "s" : ""}
              </span>
            ) : null}
            {imovel.vagas ? (
              <span className="detalhes-chip">
                <FaCar /> {imovel.vagas} vaga
                {imovel.vagas > 1 ? "s" : ""}
              </span>
            ) : null}
            {imovel.estagio_obra && (
              <span className="detalhes-chip">
                <FaHammer /> Em obra: {imovel.estagio_obra}
              </span>
            )}
          </div>

          {imovel.descricao && (
            <div className="detalhes-descricao">
              <h3>Sobre este imóvel</h3>
              <p>{imovel.descricao}</p>
            </div>
          )}

          <div className="detalhes-actions">
            <button className="detalhes-whatsapp" onClick={abrirWhatsApp}>
              <FaWhatsapp /> Falar com o corretor
            </button>
            <Link className="detalhes-back" to="/imoveis">
              <FaChevronLeft /> Voltar
            </Link>
          </div>
        </div>
      </div>

      {imovel.link_maps && (
        <div className="detalhes-maps">
          <h3>Localização</h3>
          <a
            href={imovel.link_maps}
            target="_blank"
            rel="noopener noreferrer"
            className="detalhes-maps-link"
          >
            <FaMapMarkerAlt /> Abrir no Google Maps
          </a>
        </div>
      )}
    </div>
  );
}
