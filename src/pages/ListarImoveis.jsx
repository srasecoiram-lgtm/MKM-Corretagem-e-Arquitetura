import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../styles/ListarImoveis.css";
import HeaderImoveis from "../components/Header";
import CardImovel from "../components/ImovelCard";
import Footer   from "../components/Footer";

export default function ListaImoveis() {
  const [imoveis, setImoveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const [permissionError, setPermissionError] = useState(false);

  const fetchImoveis = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setPermissionError(false);

      console.log("🔄 Iniciando busca de imóveis...");
      
      const response = await axios.get(
        `http://localhost:3002/imoveis?refresh=${Date.now()}`,
        {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
          timeout: 10000,
        }
      );

      console.log("✅ Resposta da API:", response.data);
      
      if (response.data && Array.isArray(response.data)) {
        console.log(`📊 ${response.data.length} imóveis encontrados`);
        setImoveis(response.data);
        localStorage.setItem("cached_imoveis", JSON.stringify(response.data));
      } else {
        console.warn("⚠️ Resposta não é um array:", response.data);
        setImoveis([]);
      }
    } catch (err) {
      console.error("❌ Erro ao buscar imóveis:", err);
      
      if (err.response && err.response.status === 500) {
        const errorMsg = err.response.data?.message || err.message;
        if (
          errorMsg.includes("permission") ||
          errorMsg.includes("SELECT") ||
          errorMsg.includes("acesso negado") ||
          errorMsg.includes("access denied")
        ) {
          setPermissionError(true);
          setError(
            "Erro de permissão: O usuário do banco de dados não tem permissão SELECT"
          );
        } else {
          setError(`Erro no servidor: ${errorMsg}`);
        }
      } else if (err.code === "ECONNREFUSED") {
        setError("Erro de conexão: O servidor não está respondendo");
      } else if (err.message.includes("Network Error")) {
        setError("Erro de rede: Verifique sua conexão e se o servidor está rodando");
      } else {
        setError(`Erro: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log("🎯 Componente ListaImoveis montado");
    fetchImoveis();

    const handleImovelCadastrado = () => {
      console.log("🔄 Evento de imovelCadastrado recebido");
      setTimeout(() => {
        setRefreshCount((prev) => prev + 1);
      }, 1000);
    };

    const handleStorageChange = (e) => {
      if (e.key === "ultimoImovelCadastrado") {
        console.log("🔄 Storage alterado, atualizando lista");
        setRefreshCount((prev) => prev + 1);
      }
    };

    window.addEventListener("imovelCadastrado", handleImovelCadastrado);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("imovelCadastrado", handleImovelCadastrado);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [fetchImoveis, refreshCount]);

  const handleRefresh = () => {
    console.log("🔄 Refresh manual solicitado");
    setRefreshCount((prev) => prev + 1);
  };

  // Debug: verificar o que está sendo renderizado
  console.log("🎨 Renderizando ListaImoveis:", {
    loading,
    error,
    permissionError,
    quantidadeImoveis: imoveis.length,
    imoveis: imoveis.slice(0, 3) // Mostrar apenas os primeiros 3 para debug
  });

  return (
    <div className="listar-imoveis">
      <HeaderImoveis />

      <div className="page-header-potencial">
        <div className="header-content">
          <h1 className="titulo-pagina-potencial">Imóveis disponíveis</h1>
          <p className="subtitulo-pagina">
            Confira a lista de imóveis cadastrados e encontre sua melhor
            oportunidade.
          </p>
        </div>
        <button 
          onClick={handleRefresh} 
          className="btn-refresh" 
          disabled={loading}
          title="Atualizar lista de imóveis"
        >
          {loading ? "⏳" : "🔄"} Atualizar
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Carregando imóveis...</p>
          <p style={{fontSize: '12px', color: '#666'}}>
            Verificando servidor em http://localhost:3002
          </p>
        </div>
      ) : permissionError ? (
        <div className="permission-error">
          <div className="error-icon">🚫</div>
          <h3>Erro de Permissão no Banco de Dados</h3>
          <p>O usuário do banco de dados não tem permissão para visualizar os imóveis.</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>❌ {error}</p>
          <div style={{marginTop: '10px'}}>
          </div>
        </div>
      ) : imoveis.length === 0 ? (
        <div className="empty-state">
          <p>📭 Nenhum imóvel cadastrado</p>
          <p style={{color: '#666', fontSize: '14px'}}>
            O servidor retornou uma lista vazia
          </p>
          <Link to="/cadastrar-imovel" className="btn-cadastrar">
            ➕ Cadastrar Primeiro Imóvel
          </Link>
        </div>
      ) : (
        <>
          <div className="stats-bar">
            <span>Total: {imoveis.length} imóvel{imoveis.length !== 1 ? "s" : ""}</span>
            <span>Última atualização: {new Date().toLocaleTimeString()}</span>
          </div>

          <div className="imovel-grid">
            {imoveis.map((imovel) => {
              console.log("🎯 Renderizando card para imóvel:", imovel.id, imovel.edificio);
              return <CardImovel key={imovel.id} imovel={imovel} />;
            })}
          </div>
        </>
      )}
      <Footer />
    </div>
  );
}