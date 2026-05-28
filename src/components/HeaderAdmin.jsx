import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaHeadset, FaUserCircle, FaSignOutAlt, FaHome, FaPlusCircle } from "react-icons/fa";
import { useAuth } from "../context/AuthContext.jsx";
import "../styles/Header.css";

export default function HeaderAdmin() {
  const [showDropdown, setShowDropdown] = useState(false);
  const userRef      = useRef(null);
  const location     = useLocation();
  const navigate     = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    function handleClickOutside(e) {
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path) => location.pathname === path ? "ativo" : "";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="header header--admin">
      <div className="header-container">

        {/* LOGO */}
        <div className="logo">
          <Link to="/admin/dashboard" className="logo-text">
            <span className="highlight">MKM</span>
            Admin
          </Link>
        </div>

        {/* NAV CENTRAL */}
        <nav className="nav-links">
          <Link to="/admin/dashboard" className={isActive("/admin/dashboard")}>
            <FaHome style={{ marginRight: 5 }} />
            Dashboard
          </Link>
          <Link to="/imoveis" className={isActive("/imoveis")}>Imóveis</Link>
          <Link to="/cadastrar" className={isActive("/cadastrar")}>
            <FaPlusCircle style={{ marginRight: 5 }} />
            Cadastrar
          </Link>
        </nav>

        {/* ÍCONES DIREITA */}
        <div className="icon-links">
          <Link to="/contato" className="icon-with-text">
            <FaHeadset className="icon" />
            <span>Suporte</span>
          </Link>

          {/* DROPDOWN USUÁRIO */}
          <div className="user-dropdown-wrapper" ref={userRef}>
            <FaUserCircle
              className="icon user-icon"
              onClick={() => setShowDropdown((p) => !p)}
            />
            {showDropdown && (
              <div className="user-dropdown">
                {user && (
                  <p className="dropdown-username">
                    {user.nome || user.email}
                  </p>
                )}
                <Link to="/admin/dashboard" className="dropdown-link">
                  Painel Admin
                </Link>
                <button
                  className="dropdown-logout"
                  onClick={handleLogout}
                >
                  <FaSignOutAlt />
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}
