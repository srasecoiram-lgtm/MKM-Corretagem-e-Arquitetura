import React, { useState } from "react";
import {
  FaHeart, FaMapMarkerAlt, FaRulerCombined,
  FaWhatsapp, FaBed, FaBath, FaCar, FaHammer,
} from "react-icons/fa";
import "../styles/ImovelCard.css";
import { openWhatsApp } from "../services/contato";
import { mediaUrl } from "../services/api";
import { toggleFavorito, useFavoritos } from "../services/favoritos";


const PLACEHOLDER =
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=870&q=80";

const ESTAGIOS = {
  fundacao:    "Fundação",
  alvenaria:   "Alvenaria",
  acabamento:  "Acabamento",
  pronto:      "Pronto para morar",
  estrutura:   "Estrutura",
  nao_iniciada:"Não Iniciada",
  nao_iniciado:"Não Iniciado",
};

export default function CardImovel({ imovel }) {
  const [imgError, setImgError]   = useState(false);
  const favorito = useFavoritos().includes(String(imovel.id));

  /* ── FORMATADORES ── */
  const fmtArea = () => {
    if (imovel.area_minima && imovel.area_maxima)
      return `${imovel.area_minima}–${imovel.area_maxima} m²`;
    if (imovel.area_total)
      return `${imovel.area_total} m²`;
    return "Área não informada";
  };

  const fmtEndereco = () => {
    const parts = [
      imovel.logradouro,
      imovel.numero   && `, ${imovel.numero}`,
      imovel.bairro   && `, ${imovel.bairro}`,
      imovel.cidade   && ` — ${imovel.cidade}`,
      imovel.uf       && `/${imovel.uf}`,
    ].filter(Boolean);
    return parts.join("") || "Endereço não informado";
  };

  const fmtPreco = () =>
    imovel.valor
      ? `R$ ${parseFloat(imovel.valor).toLocaleString("pt-BR")}`
      : null;

  const fmtEstagio = (e) => ESTAGIOS[e] || e;

  /* ── IMAGE URL ── */
  const imgSrc =
    (!imgError && mediaUrl(imovel.imagem)) || PLACEHOLDER;

  /* ── WHATSAPP ── */
  const handleWhatsApp = (e) => {
    e.preventDefault();
    const nome = imovel.edificio || imovel.tipo_imovel || "imóvel";
    const msg  = `Olá! Tenho interesse no ${nome} — ${fmtEndereco()}`;
    openWhatsApp(msg);
  };

  /* ── FAVORITO ── */
  const toggleFav = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorito(imovel.id);
  };

  return (
    <div className="imovel-card">

      {/* ── IMAGEM ── */}
      <div className="imovel-image">
        <img
          src={imgSrc}
          alt={imovel.edificio || imovel.tipo_imovel || "Imóvel"}
          onError={() => setImgError(true)}
          loading="lazy"
        />

        <button
          className={`favorite-btn ${favorito ? "favorited" : ""}`}
          type="button"
          aria-pressed={favorito}
          onClick={toggleFav}
          aria-label={favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
          <FaHeart className="favorite-icon" />
        </button>

        {imovel.finalidade && (
          <span className="status-badge">{imovel.finalidade}</span>
        )}
      </div>

      {/* ── CONTEÚDO ── */}
      <div className="imovel-content">

        <div className="imovel-header">
          <h3 className="imovel-title">
            {imovel.edificio || imovel.tipo_imovel || "Imóvel"}
          </h3>
          {fmtPreco() && (
            <p className="imovel-price">{fmtPreco()}</p>
          )}
        </div>

        <p className="imovel-type">{imovel.tipo_imovel || "Imóvel"}</p>

        {/* FEATURES */}
        <div className="imovel-features">
          <div className="feature">
            <FaRulerCombined className="feature-icon" />
            <span>{fmtArea()}</span>
          </div>
          {imovel.quartos && (
            <div className="feature">
              <FaBed className="feature-icon" />
              <span>{imovel.quartos} quarto{imovel.quartos > 1 ? "s" : ""}</span>
            </div>
          )}
          {imovel.banheiros && (
            <div className="feature">
              <FaBath className="feature-icon" />
              <span>{imovel.banheiros} banheiro{imovel.banheiros > 1 ? "s" : ""}</span>
            </div>
          )}
          {imovel.vagas && (
            <div className="feature">
              <FaCar className="feature-icon" />
              <span>{imovel.vagas} vaga{imovel.vagas > 1 ? "s" : ""}</span>
            </div>
          )}
        </div>

        {/* INFO */}
        <div className="imovel-info">
          <div className="info-item">
            <FaMapMarkerAlt className="icon red" />
            <span className="address">{fmtEndereco()}</span>
          </div>
          {imovel.estagio_obra && (
            <div className="info-item">
              <FaHammer className="icon" />
              <span>Estágio: {fmtEstagio(imovel.estagio_obra)}</span>
            </div>
          )}
        </div>

        {imovel.descricao && (
          <p className="imovel-description">
            {imovel.descricao.length > 110
              ? `${imovel.descricao.slice(0, 110)}…`
              : imovel.descricao}
          </p>
        )}

        {/* WHATSAPP */}
        <button className="whatsapp-button" onClick={handleWhatsApp}>
          <FaWhatsapp className="whatsapp-icon" />
          Falar com o corretor
        </button>
      </div>
    </div>
  );
}
