import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Link, Routes, Route } from "react-router";

/* ════════════════════════════════════════════════
   PÁGINAS PÚBLICAS  →  src/pages/
   ════════════════════════════════════════════════ */
import Home            from "./pages/Home";
import Imoveis         from "./pages/ListarImoveis";
import ImovelDetalhe   from "./pages/ImovelDetalhe";
import Sobre           from "./pages/Sobre";
import Anuncie         from "./pages/Anuncie";
import Contato         from "./pages/Contato";
import Favoritos       from "./pages/Favoritos";
import Forum           from "./pages/Forum";
import Blog            from "./pages/Blog";
import Arquitetura     from "./pages/Arquitetura";

/* ════════════════════════════════════════════════
   PÁGINAS ADMIN  →  src/pages/
   ════════════════════════════════════════════════ */
import Login           from "./pages/LoginAdm";
import AdminDashboard  from "./pages/AdminDashboard";
import AdminPosts      from "./pages/AdminPost";
import CadastrarImovel from "./pages/CadastrarImoveis";
import EditarImovel    from "./pages/EditarImoveis";

/* ════════════════════════════════════════════════
   COMPONENTES GLOBAIS  →  src/components/
                           src/context/
                           src/services/
   ════════════════════════════════════════════════ */
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute     from "./components/PrivateRoute";

import { whatsappUrl } from "./services/contato";
import whatsappIcon from "./assets/whatsapp.png";
import "./styles/App.css";

function App() {
  const [visible,     setVisible]     = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const fn = () => {
      const curr = window.scrollY;
      setVisible(!(curr > lastScrollY.current && curr > 100));
      lastScrollY.current = curr;
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>

          {/* ── PÚBLICAS ── */}
          <Route path="/"            element={<Home />} />
          <Route path="/imoveis"     element={<Imoveis />} />
          <Route path="/imovel/:id"  element={<ImovelDetalhe />} />
          <Route path="/sobre"       element={<Sobre />} />
          <Route path="/anuncie"     element={<Anuncie />} />
          <Route path="/contato"     element={<Contato />} />
          <Route path="/fale"        element={<Contato />} />
          <Route path="/favoritos"   element={<Favoritos />} />
          <Route path="/forum"       element={<Forum />} />
          <Route path="/blog"        element={<Blog />} />
          <Route path="/blog/:id"    element={<Blog />} />
          <Route path="/arquitetura" element={<Arquitetura />} />
          <Route path="/arquitetura/:id" element={<Arquitetura />} />

          {/* ── AUTH ── */}
          <Route path="/login" element={<Login />} />

          {/* ── ADMIN (protegidas por JWT) ── */}
          <Route path="/admin/dashboard" element={
            <PrivateRoute><AdminDashboard /></PrivateRoute>
          } />
          <Route path="/admin/posts" element={
            <PrivateRoute><AdminPosts /></PrivateRoute>
          } />
          <Route path="/cadastrar" element={
            <PrivateRoute><CadastrarImovel /></PrivateRoute>
          } />
          <Route path="/editar/:id" element={
            <PrivateRoute><EditarImovel /></PrivateRoute>
          } />

          <Route path="*" element={(
            <main className="app-not-found">
              <h1>Página não encontrada</h1>
              <Link to="/">Voltar para a página inicial</Link>
            </main>
          )} />
        </Routes>

        {/* BOTÃO WHATSAPP FLUTUANTE */}
        <a
          href={whatsappUrl()}
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
