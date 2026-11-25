import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { FaUserCircle, FaBuilding, FaClipboardList, FaHome, FaFileAlt } from "react-icons/fa";
import { useAuth } from "../context/AuthContext.jsx";
import "../styles/Header.css";

export default function HeaderAdmin() {
  const [showDropdown, setShowDropdown] = useState(false);
  const userRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    function handleOut(e) {
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleOut);
    return () => document.removeEventListener("mousedown", handleOut);
  }, []);

  const isActive = (path) => (location.pathname === path ? "ativo" : "");

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      window.alert("A sessão local foi encerrada. Não foi possível confirmar a saída no servidor.");
    }
    navigate("/login", { replace: true });
  };

  const firstName = (user?.nome || "").split(" ")[0];

  return (
    <header className="header header--admin">
      <div className="header-container">

        {/* LOGO */}
        <div className="logo">
          <Link to="/admin/dashboard" className="logo-text">
            <span className="highlight">MKM</span> Admin
          </Link>
        </div>

        {/* NAV */}
        <nav className="nav-links">
          <Link to="/admin/dashboard" className={isActive("/admin/dashboard")}>
            <FaHome style={{ marginRight: 6 }} />
            Painel
          </Link>

          <Link to="/cadastrar" className={isActive("/cadastrar")}>
            <FaBuilding style={{ marginRight: 6 }} />
            Cadastrar
          </Link>

          <Link to="/imoveis" className={isActive("/imoveis")}>
            <FaClipboardList style={{ marginRight: 6 }} />
            Imóveis
          </Link>

          <Link to="/admin/posts" className={isActive("/admin/posts")}>
            <FaFileAlt style={{ marginRight: 6 }} />
            Posts
          </Link>
        </nav>

        {/* PERFIL / DROPDOWN */}
        <div className="icon-links">
          <div className="user-dropdown-wrapper" ref={userRef}>
            <button
              type="button"
              className="user-dropdown-trigger"
              onClick={() => setShowDropdown((prev) => !prev)}
            >
              {firstName && <span className="user-dropdown-label">{firstName}</span>}
              <span className="user-golden-icon" aria-hidden="true">
                <FaUserCircle />
              </span>
            </button>

            {showDropdown && (
              <div className="user-dropdown">
                {user && (
                  <p className="dropdown-username">{user.nome || user.email}</p>
                )}

                <Link to="/cadastrar" className="dropdown-link">
                  Cadastrar imóvel
                </Link>

                <Link to="/admin/dashboard" className="dropdown-link">
                  Painel admin
                </Link>

                <div className="dropdown-divider" />

                <button className="dropdown-logout" onClick={handleLogout}>
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
