import React, { useState } from "react";
import AdminHeader from "../components/HeaderAdmin";
import { FaMapMarkerAlt, FaRegBuilding, FaClipboardCheck, FaRulerCombined, FaUpload } from "react-icons/fa";
import "../styles/CadastrarImoveis.css";
import axios from "axios";

export default function CadastrarImovelNovo() { 
  const [formData, setFormData] = useState({
    cep: "",
    uf: "",
    cidade: "",
    bairro: "",
    logradouro: "",
    numero: "",
    complemento: "",
    tipo_imovel: "",
    finalidade: "",
    edificio: "",
    responsavel: "",
    captador: "",
    tipo_contrato: "",
    valor: "",
    data_contrato: "",
    frente: "",
    largura: "",
    profundidade: "",
    area_total: "",
    link_maps: "",
  });

  const [imagem, setImagem] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagem(file);
      
      // Criar preview da imagem
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação básica
    if (!imagem) {
      setError("Por favor, selecione uma imagem do imóvel");
      alert("❌ Por favor, selecione uma imagem do imóvel");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      console.log("📤 Enviando dados:", formData);
      
      // Criar FormData para enviar arquivo
      const submitData = new FormData();
      
      // Adicionar todos os campos do formulário
      Object.keys(formData).forEach(key => {
        if (formData[key] !== "") {
          submitData.append(key, formData[key]);
        }
      });
      
      // Adicionar a imagem
      if (imagem) {
        submitData.append('imagem', imagem);
      }

      const response = await axios.post("http://localhost:3002/imoveis", submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 15000
      });

      console.log("✅ Resposta do servidor:", response.data);

      if (response.data.success) {
        setSuccess(true);
        alert("✅ " + response.data.message);
        
        // Reset form
        setFormData({
          cep: "", uf: "", cidade: "", bairro: "", logradouro: "", numero: "",
          complemento: "", tipo_imovel: "", finalidade: "", edificio: "",
          responsavel: "", captador: "", tipo_contrato: "", valor: "",
          data_contrato: "", frente: "", largura: "", profundidade: "",
          area_total: "", link_maps: "",
        });
        
        // Reset imagem
        setImagem(null);
        setPreviewUrl("");

        // 🔥 DISPARAR EVENTO GLOBAL para atualizar listas
        window.dispatchEvent(new CustomEvent('imovelCadastrado', {
          detail: { id: response.data.id }
        }));
        
        // 🔥 Também salvar no localStorage para sincronização
        localStorage.setItem('ultimoImovelCadastrado', Date.now());
      }
    } catch (err) {
      console.error("❌ Erro completo:", err);
      if (err.code === 'ECONNREFUSED') {
        setError("Servidor offline. Execute 'node server.js'");
        alert("❌ Servidor offline. Verifique o backend.");
      } else if (err.response) {
        setError(err.response.data.erro || "Erro ao cadastrar");
        alert(`❌ Erro: ${err.response.data.erro || "Dados inválidos"}`);
      } else if (err.request) {
        setError("Não foi possível conectar ao servidor");
        alert("❌ Erro de conexão. Verifique o backend.");
      } else {
        setError("Erro inesperado");
        alert("❌ Ocorreu um erro inesperado");
      }
    } finally {
      setLoading(false);
    }
  };

  const testServerConnection = async () => {
    try {
      const response = await axios.get("http://localhost:3002/health", {
        timeout: 3000
      });
      alert(`✅ Servidor conectado: ${response.data.message}`);
    } catch (err) {
      alert("❌ Servidor offline. Execute 'node server.js'");
    }
  };

  return (
    <div className="pagina-cadastro">
      <AdminHeader />
      <div className="form-container-novo">
        <h2><FaRegBuilding /> Cadastrar Novo Imóvel</h2>

        <button 
          type="button" 
          onClick={testServerConnection}
          style={{
            marginBottom: '20px',
            padding: '10px 15px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🔧 Testar Conexão com Servidor
        </button>

        {error && (
          <div className="error-message" style={{color: 'red', padding: '10px', marginBottom: '15px'}}>
            ❌ {error}
          </div>
        )}

        {success && (
          <div className="success-message" style={{color: 'green', padding: '10px', marginBottom: '15px'}}>
            ✅ Imóvel cadastrado com sucesso! Atualizando lista...
          </div>
        )}

          {/* Seus campos do formulário mantidos */}
          <div className="card-box">
            <h3><FaMapMarkerAlt /> Endereço</h3>
            <div className="row">
              <input 
                name="cep" 
                placeholder="CEP" 
                value={formData.cep} 
                onChange={handleChange} 
                required 
              />
              <input 
                name="uf" 
                placeholder="UF" 
                value={formData.uf} 
                onChange={handleChange} 
                required 
              />
              <input 
                name="cidade" 
                placeholder="Cidade" 
                value={formData.cidade} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="row">
              <input name="bairro" placeholder="Bairro" value={formData.bairro} onChange={handleChange} />
              <input name="logradouro" placeholder="Logradouro" value={formData.logradouro} onChange={handleChange} />
              <input 
                name="numero" 
                placeholder="Nº" 
                value={formData.numero} 
                onChange={handleChange} 
                type="number" 
              />
            </div>
            <input name="complemento" placeholder="Complemento" value={formData.complemento} onChange={handleChange} />
          </div>

          <div className="card-box">
            <h3><FaRulerCombined /> Dados do Imóvel</h3>
            <div className="row">
              <select 
                name="tipo_imovel" 
                value={formData.tipo_imovel} 
                onChange={handleChange} 
                required
              >
                <option value="">Tipo do Imóvel</option>
                <option value="Apartamento">Apartamento</option>
                <option value="Casa">Casa</option>
                <option value="Terreno">Terreno</option>
                <option value="Comercial">Comercial</option>
              </select>
              <select 
                name="finalidade" 
                value={formData.finalidade} 
                onChange={handleChange}
              >
                <option value="">Finalidade</option>
                <option value="Venda">Venda</option>
                <option value="Aluguel">Aluguel</option>
              </select>
              <input name="edificio" placeholder="Edifício/Empreendimento" value={formData.edificio} onChange={handleChange} />
            </div>
            <div className="row">
              <input name="responsavel" placeholder="Responsável" value={formData.responsavel} onChange={handleChange} />
              <input name="captador" placeholder="Captador" value={formData.captador} onChange={handleChange} />
            </div>
          </div>

          <div className="card-box">
            <h3><FaClipboardCheck /> Contrato</h3>
            <div className="row">
              <select name="tipo_contrato" value={formData.tipo_contrato} onChange={handleChange}>
                <option value="">Tipo de Contrato</option>
                <option value="Exclusivo">Exclusivo</option>
                <option value="Não exclusivo">Não exclusivo</option>
              </select>
              <input 
                type="number" 
                name="valor" 
                placeholder="Valor (R$)" 
                value={formData.valor} 
                onChange={handleChange} 
                step="0.01"
              />
              <input 
                type="date" 
                name="data_contrato" 
                value={formData.data_contrato} 
                onChange={handleChange} 
              />
            </div>
          </div>

          <div className="card-box">
            <h3><FaRulerCombined /> Medidas</h3>
            <div className="row">
              <input 
                type="number" 
                name="frente" 
                placeholder="Frente (m)" 
                value={formData.frente} 
                onChange={handleChange} 
                step="0.01"
              />
              <input 
                type="number" 
                name="largura" 
                placeholder="Largura (m)" 
                value={formData.largura} 
                onChange={handleChange} 
                step="0.01"
              />
              <input 
                type="number" 
                name="profundidade" 
                placeholder="Profundidade (m)" 
                value={formData.profundidade} 
                onChange={handleChange} 
                step="0.01"
              />
            </div>
            <input 
              type="number" 
              name="area_total" 
              placeholder="Área total (m²)" 
              value={formData.area_total} 
              onChange={handleChange} 
              step="0.01"
            />
          </div>

          <div className="card-box">
            <h3>Google Maps</h3>
            <input 
              name="link_maps" 
              placeholder="Link do Google Maps" 
              value={formData.link_maps} 
              onChange={handleChange} 
              type="url"
            />
          </div>
<form onSubmit={handleSubmit}>
          {/* Seção de Upload de Imagem */}
          <div className="card-box">
            <h3><FaUpload /> Imagem do Imóvel *</h3>
            <div className="form-group">
              <label htmlFor="imagem" className="file-label">
                <FaUpload /> Selecione uma imagem
              </label>
              <input 
                type="file" 
                id="imagem"
                name="imagem"
                accept="image/*"
                onChange={handleImageChange}
                required
                className="file-input"
              />
              
              {previewUrl && (
                <div className="image-preview">
                  <img src={previewUrl} alt="Preview do imóvel" />
                  <p>Pré-visualização da imagem</p>
                </div>
              )}
              
              {!previewUrl && (
                <p style={{color: '#666', fontSize: '14px', marginTop: '10px'}}>
                  ⚠️ Selecione uma imagem do imóvel (JPEG, PNG, etc.)
                </p>
              )}
            </div>
          </div>
          
          <button type="submit" disabled={loading} style={{backgroundColor: loading ? '#6c757d' : '#007bff'}}>
            {loading ? "⏳ Cadastrando..." : "🏠 Cadastrar Imóvel"}
          </button>
        </form>
      </div>
    </div>
  );
}