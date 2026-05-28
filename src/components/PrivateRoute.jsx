import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * PrivateRoute — protege rotas que exigem autenticação JWT.
 *
 * Uso no App.jsx:
 *   <Route path="/admin/dashboard" element={
 *     <PrivateRoute>
 *       <AdminDashboard />
 *     </PrivateRoute>
 *   } />
 *
 * Com role obrigatório:
 *   <PrivateRoute requiredRole="admin"><CadastrarImovel /></PrivateRoute>
 */
export default function PrivateRoute({ children, requiredRole = null }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  /* Aguarda verificação da sessão (cookie httpOnly → /auth/refresh) */
  if (loading) {
    return (
      <div
        style={{
          display:         "flex",
          flexDirection:   "column",
          alignItems:      "center",
          justifyContent:  "center",
          minHeight:       "100vh",
          background:      "var(--mkm-dark, #0D1B2A)",
          gap:             "16px",
        }}
      >
        {/* Spinner usando token CSS do projeto */}
        <div
          style={{
            width:        "40px",
            height:       "40px",
            border:       "3px solid rgba(201,151,59,0.25)",
            borderTop:    "3px solid #C9973B",
            borderRadius: "50%",
            animation:    "mkm-spin 0.8s linear infinite",
          }}
        />
        <p
          style={{
            color:      "#C9973B",
            fontSize:   "0.9rem",
            fontFamily: "var(--font-body, sans-serif)",
            margin:     0,
          }}
        >
          Verificando autenticação…
        </p>
      </div>
    );
  }

  /* Sem sessão → login, preservando rota de destino */
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  /* Role insuficiente → página 403 */
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/403" replace />;
  }

  return children;
}
