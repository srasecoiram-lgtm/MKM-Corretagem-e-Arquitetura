import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation }                  from "react-router-dom";
import { FaHeadset, FaUserCircle, FaHeart }  from "react-icons/fa";
import "../styles/Header.css";

export default function Header() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showChat,     setShowChat]     = useState(false);
  const [scrolled,     setScrolled]     = useState(false);
  const userRef  = useRef(null);
  const chatRef  = useRef(null);
  const location = useLocation();

  useEffect(() => {
    function onOut(e) {
      if (userRef.current && !userRef.current.contains(e.target)) setShowDropdown(false);
      if (chatRef.current && !chatRef.current.contains(e.target)) setShowChat(false);
    }
    document.addEventListener("mousedown", onOut);
    return () => document.removeEventListener("mousedown", onOut);
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const active = (path) => location.pathname === path ? "ativo" : "";

  return (
    <header className={`header ${scrolled ? "header--scrolled" : ""}`}>
      <div className="header-container">

        {/* LOGO */}
        <div className="logo">
          <Link to="/" className="logo-text">
            <span className="highlight">MKM</span>
            Consultoria Imobiliária
          </Link>
        </div>

        {/* NAV */}
        <nav className="nav-links">
          <Link to="/imoveis"     className={active("/imoveis")}>Imóveis</Link>
          <Link to="/anuncie"     className={active("/anuncie")}>Anuncie</Link>
          <Link to="/blog"        className={active("/blog")}>Blog</Link>
          <Link to="/arquitetura" className={active("/arquitetura")}>Arquitetura</Link>
          <Link to="/sobre"       className={active("/sobre")}>Sobre</Link>
        </nav>

        {/* ÍCONES DIREITA */}
        <div className="icon-links">

          {/* BALÃO DE ASSISTÊNCIA */}
          <div className="chat-balloon-wrapper" ref={chatRef}>
            <button
              className="icon-with-text icon-btn"
              onClick={() => setShowChat((p) => !p)}
              aria-label="Fale Conosco"
            >
              <div className="headset-wrap">
                <FaHeadset className="icon" />
                <span className="headset-dot" aria-hidden="true" />
              </div>
              <span>Fale Conosco</span>
            </button>

            {showChat && (
              <div className="chat-balloon">
                <p className="chat-balloon__title">Como podemos ajudar?</p>
                <div className="chat-balloon__ops">
                  <Link to="/contato" className="chat-op" onClick={() => setShowChat(false)}>
                    <span className="chat-op__icon">✉️</span>
                    <div>
                      <p className="chat-op__label">Enviar mensagem</p>
                      <p className="chat-op__sub">Respondemos em até 24h</p>
                    </div>
                  </Link>
                  <a
                    href="https://wa.me/5511992931055"
                    className="chat-op"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowChat(false)}
                  >
                    <span className="chat-op__icon">💬</span>
                    <div>
                      <p className="chat-op__label">WhatsApp</p>
                      <p className="chat-op__sub">Atendimento imediato</p>
                    </div>
                  </a>
                  <Link to="/forum" className="chat-op" onClick={() => setShowChat(false)}>
                    <span className="chat-op__icon">🏘️</span>
                    <div>
                      <p className="chat-op__label">Fórum da comunidade</p>
                      <p className="chat-op__sub">Perguntas e respostas</p>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* FAVORITOS */}
          <Link to="/favoritos" aria-label="Favoritos">
            <FaHeart className="icon" />
          </Link>

          {/* USUÁRIO */}
          <div className="user-dropdown-wrapper" ref={userRef}
            onClick={() => setShowDropdown((p) => !p)}>
            <FaUserCircle className="icon user-icon" />
            {showDropdown && (
              <div className="user-dropdown">
                <Link to="/login">Entrar como corretor(a)</Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
