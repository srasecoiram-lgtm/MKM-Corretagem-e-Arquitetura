import React from "react";
import { Link } from "react-router-dom";
import {
  FaWhatsapp, FaInstagram, FaFacebookF,
  FaMapMarkerAlt, FaPhoneAlt, FaEnvelope,
} from "react-icons/fa";
import "../styles/Footer.css";

export default function Footer() {
  const ano = new Date().getFullYear();

  return (
    <footer className="footer">
      {/* ── FAIXA DOURADA DECORATIVA ── */}
      <div className="footer-top-line" />

      <div className="footer-inner">

        {/* COLUNA 1 — MARCA */}
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <span className="footer-logo-mkm">MKM</span>
            <span className="footer-logo-text">Consultoria Imobiliária</span>
          </Link>
          <p className="footer-tagline">
            Mais de 22 anos conectando pessoas ao imóvel dos seus sonhos
            em Praia Grande e região.
          </p>

          <div className="footer-socials">
            <a
              href="https://wa.me/5511992931055"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="social-btn social-btn--whatsapp"
            >
              <FaWhatsapp />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="social-btn social-btn--instagram"
            >
              <FaInstagram />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="social-btn social-btn--facebook"
            >
              <FaFacebookF />
            </a>
          </div>
        </div>

        {/* COLUNA 2 — NAVEGAÇÃO */}
        <div className="footer-col">
          <h4 className="footer-col-title">Navegação</h4>
          <ul className="footer-links">
            <li><Link to="/">Início</Link></li>
            <li><Link to="/imoveis">Imóveis</Link></li>
            <li><Link to="/anuncie">Anuncie seu Imóvel</Link></li>
            <li><Link to="/sobre">Quem Somos</Link></li>
            <li><Link to="/contato">Fale Conosco</Link></li>
            <li><Link to="/favoritos">Favoritos</Link></li>
          </ul>
        </div>

        {/* COLUNA 3 — TIPOS DE IMÓVEL */}
        <div className="footer-col">
          <h4 className="footer-col-title">Imóveis</h4>
          <ul className="footer-links">
            <li><Link to="/imoveis?tipo=apartamento">Apartamentos</Link></li>
            <li><Link to="/imoveis?tipo=casa">Casas</Link></li>
            <li><Link to="/imoveis?tipo=terreno">Terrenos</Link></li>
            <li><Link to="/imoveis?tipo=comercial">Comercial</Link></li>
            <li><Link to="/imoveis?finalidade=venda">À Venda</Link></li>
            <li><Link to="/imoveis?finalidade=aluguel">Para Alugar</Link></li>
          </ul>
        </div>

        {/* COLUNA 4 — CONTATO */}
        <div className="footer-col">
          <h4 className="footer-col-title">Contato</h4>
          <ul className="footer-contact-list">
            <li>
              <FaMapMarkerAlt className="contact-icon" />
              <span>Praia Grande – SP</span>
            </li>
            <li>
              <FaPhoneAlt className="contact-icon" />
              <a href="tel:+5511992931055">(11) 99293-1055</a>
            </li>
            <li>
              <FaEnvelope className="contact-icon" />
              <a href="mailto:contato@mkm.com.br">contato@mkm.com.br</a>
            </li>
          </ul>

          <div className="footer-badges">
            <span className="footer-badge">CRECI</span>
            <span className="footer-badge">SUSEP</span>
            <span className="footer-badge">CNAI</span>
          </div>
        </div>

      </div>

      {/* ── RODAPÉ INFERIOR ── */}
      <div className="footer-bottom">
        <p>© {ano} MKM Corretagem &amp; Consultoria. Todos os direitos reservados.</p>
        <div className="footer-bottom-links">
          <Link to="/privacidade">Política de Privacidade</Link>
          <span>·</span>
          <Link to="/termos">Termos de Uso</Link>
        </div>
      </div>
    </footer>
  );
}
