import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

/* ── PÚBLICAS ── */
import Home            from "./pages/Home";
import Imoveis         from "./pages/ListarImoveis";
import Sobre           from "./pages/Sobre";
import ImovelDetalhe   from "./pages/ImovelDetalhe";
import Anuncie         from "./pages/Anuncie";
import Contato         from "./pages/Contato";
import FaleConosco     from "./pages/FaleConosco";
import Favoritos       from "./pages/Favoritos";
import Forum           from "./pages/Forum";
import Blog            from "./pages/Blog";
import Arquitetura     from "./pages/Arquitetura";

/* ── ADMIN ── */
import Login           from "./pages/LoginAdm";
import AdminDashboard  from "./pages/AdminDashboard";
import CadastrarImovel from "./pages/CadastrarImoveis";
import EditarImovel    from "./pages/EditarImoveis";
import PainelAdmin     from "./pages/PainelAdmin";

/* ── AUTH ── */
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute     from "./components/PrivateRoute";

import whatsappIcon from "./assets/whatsapp.png";
import "./styles/App.css";

function App() {
  const [visible,     setVisible]     = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const fn = () => {
      const curr = window.scrollY;
      setVisible(!(curr > lastScrollY && curr > 100));
      setLastScrollY(curr);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, [lastScrollY]);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* PÚBLICAS */}
          <Route path="/"            element={<Home />} />
          <Route path="/imoveis"     element={<Imoveis />} />
          <Route path="/imovel/:id"  element={<ImovelDetalhe />} />
          <Route path="/sobre"       element={<Sobre />} />
          <Route path="/anuncie"     element={<Anuncie />} />
          <Route path="/contato"     element={<Contato />} />
          <Route path="/fale"        element={<FaleConosco />} />
          <Route path="/favoritos"   element={<Favoritos />} />
          <Route path="/forum"       element={<Forum />} />
          <Route path="/blog"        element={<Blog />} />
          <Route path="/blog/:id"    element={<Blog />} />
          <Route path="/arquitetura" element={<Arquitetura />} />

          {/* AUTH */}
          <Route path="/login" element={<Login />} />

          {/* ADMIN — protegidas por JWT */}
          <Route path="/admin/dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
          <Route path="/cadastrar"       element={<PrivateRoute><CadastrarImovel /></PrivateRoute>} />
          <Route path="/editar/:id"      element={<PrivateRoute><EditarImovel /></PrivateRoute>} />
          <Route path="/painel"          element={<PrivateRoute><PainelAdmin /></PrivateRoute>} />
        </Routes>

        {/* WHATSAPP FLUTUANTE */}
        <a
          href="https://wa.me/5511992931055"
          className={`whatsapp-float ${visible ? "visible" : "hidden"}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Fale conosco no WhatsApp"
        >
          <img src={whatsappIcon} alt="WhatsApp" />
        </a>
      </Router>
    </AuthProvider>
  );
}

export default App;
