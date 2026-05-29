import React, { useState } from "react";
import HeaderAdmin from "../components/HeaderAdmin";
import {
  FaMapMarkerAlt, FaRegBuilding, FaClipboardCheck,
  FaRulerCombined, FaUpload, FaTrash,
} from "react-icons/fa";
import api from "../services/api";
import "../styles/CadastrarImoveis.css";

const FORM_INICIAL = {
  cep: "", uf: "", cidade: "", bairro: "", logradouro: "",
  numero: "", complemento: "", tipo_imovel: "", finalidade: "",
  edificio: "", responsavel: "", captador: "", tipo_contrato: "",
  valor: "", data_contrato: "", frente: "", largura: "",
  profundidade: "", area_total: "", link_maps: "",
};

export default function CadastrarImovel() {
  const [formData,   setFormData]   = useState(FORM_INICIAL);
  const [imagem,     setImagem]     = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);
  const [success,    setSuccess]    = useState(false);

  /* ── HANDLERS ── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImagem(file);
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagem(null);
    setPreviewUrl("");
  };

  /* ── CEP AUTOMÁTICO ── */
  const handleCepBlur = async () => {
    const cep = formData.cep.replace(/\D/g, "");
    if (cep.length !== 8) return;
    try {
      const res  = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setFormData((prev) => ({
          ...prev,
          logradouro: data.logradouro || prev.logradouro,
          bairro:     data.bairro     || prev.bairro,
          cidade:     data.localidade || prev.cidade,
          uf:         data.uf         || prev.uf,
        }));
      }
    } catch { /* silencioso */ }
  };

  /* ── SUBMIT ── */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imagem) {
      setError("Selecione uma imagem do imóvel.");
      return;
    }
    if (!formData.cep || !formData.uf || !formData.cidade) {
      setError("CEP, UF e Cidade são obrigatórios.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== "") payload.append(key, formData[key]);
      });
      payload.append("imagem", imagem);

      const response = await api.post("/imoveis", payload, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 15000,
      });

      if (response.data.success || response.data.id) {
        setSuccess(true);
        setFormData(FORM_INICIAL);
        setImagem(null);
        setPreviewUrl("");
        window.dispatchEvent(new CustomEvent("imovelCadastrado"));
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      if (err.response?.data?.erro) {
        setError(err.response.data.erro);
      } else if (err.code === "ECONNREFUSED" || err.code === "ERR_NETWORK") {
        setError("Servidor offline. Verifique se o backend está rodando.");
      } else {
        setError("Erro ao cadastrar. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── RENDER ── */
  return (
    <div className="pagina-cadastro">
      <HeaderAdmin />

      {/* ── FORM envolve TODOS os campos ── */}
      <form onSubmit={handleSubmit} className="form-container-novo">

        <h2><FaRegBuilding /> Cadastrar Novo Imóvel</h2>

        {/* ALERTAS */}
        {error && (
          <div className="cad-alert cad-alert--error">{error}</div>
        )}
        {success && (
          <div className="cad-alert cad-alert--success">
            ✅ Imóvel cadastrado com sucesso!
          </div>
        )}

        {/* ── ENDEREÇO ── */}
        <div className="card-box">
          <h3><FaMapMarkerAlt /> Endereço</h3>

          <div className="row">
            <input
              name="cep"
              placeholder="CEP"
              value={formData.cep}
              onChange={handleChange}
              onBlur={handleCepBlur}
              maxLength={9}
              required
            />
            <input
              name="uf"
              placeholder="UF"
              value={formData.uf}
              onChange={handleChange}
              maxLength={2}
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
            <input name="bairro"     placeholder="Bairro"     value={formData.bairro}     onChange={handleChange} />
            <input name="logradouro" placeholder="Logradouro" value={formData.logradouro} onChange={handleChange} />
            <input name="numero"     placeholder="Nº"         value={formData.numero}     onChange={handleChange} type="number" />
          </div>

          <input name="complemento" placeholder="Complemento" value={formData.complemento} onChange={handleChange} />
        </div>

        {/* ── DADOS DO IMÓVEL ── */}
        <div className="card-box">
          <h3><FaRegBuilding /> Dados do Imóvel</h3>

          <div className="row">
            <select name="tipo_imovel" value={formData.tipo_imovel} onChange={handleChange} required>
              <option value="">Tipo do Imóvel</option>
              <option value="Apartamento">Apartamento</option>
              <option value="Casa">Casa</option>
              <option value="Terreno">Terreno</option>
              <option value="Comercial">Comercial</option>
              <option value="Studio">Studio</option>
            </select>

            <select name="finalidade" value={formData.finalidade} onChange={handleChange}>
              <option value="">Finalidade</option>
              <option value="Venda">Venda</option>
              <option value="Aluguel">Aluguel</option>
            </select>

            <input name="edificio" placeholder="Edifício/Empreendimento" value={formData.edificio} onChange={handleChange} />
          </div>

          <div className="row">
            <input name="responsavel" placeholder="Responsável" value={formData.responsavel} onChange={handleChange} />
            <input name="captador"    placeholder="Captador"    value={formData.captador}    onChange={handleChange} />
          </div>
        </div>

        {/* ── CONTRATO ── */}
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
              min="0"
            />

            <input
              type="date"
              name="data_contrato"
              value={formData.data_contrato}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* ── MEDIDAS ── */}
        <div className="card-box">
          <h3><FaRulerCombined /> Medidas</h3>

          <div className="row">
            <input type="number" name="frente"       placeholder="Frente (m)"       value={formData.frente}       onChange={handleChange} step="0.01" />
            <input type="number" name="largura"      placeholder="Largura (m)"      value={formData.largura}      onChange={handleChange} step="0.01" />
            <input type="number" name="profundidade" placeholder="Profundidade (m)" value={formData.profundidade} onChange={handleChange} step="0.01" />
            <input type="number" name="area_total"   placeholder="Área total (m²)"  value={formData.area_total}   onChange={handleChange} step="0.01" />
          </div>

          <input
            name="link_maps"
            placeholder="Link do Google Maps (opcional)"
            value={formData.link_maps}
            onChange={handleChange}
            type="url"
          />
        </div>

        {/* ── IMAGEM ── */}
        <div className="card-box">
          <h3><FaUpload /> Imagem do Imóvel <span className="cad-required">*</span></h3>

          {previewUrl ? (
            <div className="cad-preview">
              <img src={previewUrl} alt="Preview" />
              <button type="button" className="cad-remove-img" onClick={removeImage}>
                <FaTrash /> Remover imagem
              </button>
            </div>
          ) : (
            <div className="cad-upload-area">
              <label htmlFor="imagem-input" className="file-label">
                <FaUpload /> Selecionar imagem
              </label>
              <p className="cad-upload-hint">JPG, PNG ou WebP — máx. 5 MB</p>
            </div>
          )}

          <input
            id="imagem-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            className="file-input"
          />
        </div>

        {/* ── SUBMIT ── */}
        <button type="submit" className="cad-submit" disabled={loading}>
          {loading ? "⏳ Cadastrando…" : "🏠 Cadastrar Imóvel"}
        </button>

      </form>
    </div>
  );
}
