import React, { useState } from "react";
import {
  FaMapMarkerAlt, FaRegBuilding, FaClipboardCheck,
  FaRulerCombined, FaUpload, FaTrash,
} from "react-icons/fa";
import api from "../services/api";
import "../styles/CadastrarImoveis.css";
import "../styles/AdminForm.css";

/**
 * AdminForm — formulário reutilizável para CADASTRAR ou EDITAR imóveis.
 *
 * Props:
 *   initialData  {object}   dados iniciais (undefined = modo cadastro)
 *   imovelId     {number}   id do imóvel (undefined = modo cadastro)
 *   onSuccess    {function} callback chamado após salvar com sucesso
 *   onCancel     {function} callback para cancelar / fechar
 */
export default function AdminForm({ initialData, imovelId, onSuccess, onCancel }) {
  const isEditing = Boolean(imovelId);

  const emptyForm = {
    cep: "", uf: "", cidade: "", bairro: "", logradouro: "",
    numero: "", complemento: "", tipo_imovel: "", finalidade: "",
    edificio: "", responsavel: "", captador: "", tipo_contrato: "",
    valor: "", data_contrato: "", frente: "", largura: "",
    profundidade: "", area_total: "", quartos: "", banheiros: "",
    vagas: "", descricao: "", link_maps: "",
  };

  const [formData, setFormData]   = useState(initialData || emptyForm);
  const [imagem, setImagem]       = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialData?.imagem
    ? `${process.env.REACT_APP_API_URL || "http://localhost:3002"}${initialData.imagem}`
    : "");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

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

  /* ── CEP LOOKUP ── */
  const handleCepBlur = async () => {
    const cep = formData.cep.replace(/\D/g, "");
    if (cep.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
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
    } catch {
      /* silencioso — usuário preenche manualmente */
    }
  };

  /* ── SUBMIT ── */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEditing && !imagem) {
      setError("Selecione uma imagem do imóvel.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== "") payload.append(key, formData[key]);
      });
      if (imagem) payload.append("imagem", imagem);

      if (isEditing) {
        await api.put(`/imoveis/${imovelId}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/imoveis", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      onSuccess?.();
    } catch (err) {
      setError(
        err.response?.data?.erro || "Erro ao salvar. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ── RENDER ── */
  return (
    <form onSubmit={handleSubmit} className="admin-form">

      {error && <div className="form-alert form-alert--error">{error}</div>}

      {/* ── ENDEREÇO ── */}
      <div className="card-box">
        <h3><FaMapMarkerAlt /> Endereço</h3>

        <div className="row">
          <div className="field-group">
            <label>CEP</label>
            <input
              name="cep"
              placeholder="00000-000"
              value={formData.cep}
              onChange={handleChange}
              onBlur={handleCepBlur}
              required
            />
          </div>
          <div className="field-group">
            <label>UF</label>
            <input name="uf" placeholder="SP" maxLength={2}
              value={formData.uf} onChange={handleChange} required />
          </div>
          <div className="field-group field-group--grow">
            <label>Cidade</label>
            <input name="cidade" placeholder="Praia Grande"
              value={formData.cidade} onChange={handleChange} required />
          </div>
        </div>

        <div className="row">
          <div className="field-group field-group--grow">
            <label>Logradouro</label>
            <input name="logradouro" placeholder="Av. Presidente Kennedy"
              value={formData.logradouro} onChange={handleChange} />
          </div>
          <div className="field-group">
            <label>Número</label>
            <input name="numero" placeholder="123"
              value={formData.numero} onChange={handleChange} type="number" />
          </div>
          <div className="field-group field-group--grow">
            <label>Bairro</label>
            <input name="bairro" placeholder="Boqueirão"
              value={formData.bairro} onChange={handleChange} />
          </div>
        </div>

        <div className="field-group">
          <label>Complemento</label>
          <input name="complemento" placeholder="Apto 42, Bl. B"
            value={formData.complemento} onChange={handleChange} />
        </div>
      </div>

      {/* ── DADOS DO IMÓVEL ── */}
      <div className="card-box">
        <h3><FaRegBuilding /> Dados do Imóvel</h3>

        <div className="row">
          <div className="field-group">
            <label>Tipo</label>
            <select name="tipo_imovel" value={formData.tipo_imovel} onChange={handleChange} required>
              <option value="">Selecione</option>
              <option value="Apartamento">Apartamento</option>
              <option value="Casa">Casa</option>
              <option value="Terreno">Terreno</option>
              <option value="Comercial">Comercial</option>
              <option value="Studio">Studio</option>
            </select>
          </div>
          <div className="field-group">
            <label>Finalidade</label>
            <select name="finalidade" value={formData.finalidade} onChange={handleChange}>
              <option value="">Selecione</option>
              <option value="Venda">Venda</option>
              <option value="Aluguel">Aluguel</option>
            </select>
          </div>
          <div className="field-group field-group--grow">
            <label>Edifício / Empreendimento</label>
            <input name="edificio" placeholder="Residencial Aurora"
              value={formData.edificio} onChange={handleChange} />
          </div>
        </div>

        <div className="row">
          <div className="field-group">
            <label>Quartos</label>
            <input name="quartos" type="number" min="0" placeholder="3"
              value={formData.quartos} onChange={handleChange} />
          </div>
          <div className="field-group">
            <label>Banheiros</label>
            <input name="banheiros" type="number" min="0" placeholder="2"
              value={formData.banheiros} onChange={handleChange} />
          </div>
          <div className="field-group">
            <label>Vagas</label>
            <input name="vagas" type="number" min="0" placeholder="1"
              value={formData.vagas} onChange={handleChange} />
          </div>
        </div>

        <div className="field-group">
          <label>Descrição</label>
          <textarea name="descricao" rows="3"
            placeholder="Descreva o imóvel em detalhes..."
            value={formData.descricao} onChange={handleChange} />
        </div>

        <div className="row">
          <div className="field-group field-group--grow">
            <label>Responsável</label>
            <input name="responsavel" placeholder="Nome do responsável"
              value={formData.responsavel} onChange={handleChange} />
          </div>
          <div className="field-group field-group--grow">
            <label>Captador</label>
            <input name="captador" placeholder="Nome do captador"
              value={formData.captador} onChange={handleChange} />
          </div>
        </div>
      </div>

      {/* ── CONTRATO ── */}
      <div className="card-box">
        <h3><FaClipboardCheck /> Contrato</h3>

        <div className="row">
          <div className="field-group">
            <label>Tipo de Contrato</label>
            <select name="tipo_contrato" value={formData.tipo_contrato} onChange={handleChange}>
              <option value="">Selecione</option>
              <option value="Exclusivo">Exclusivo</option>
              <option value="Não exclusivo">Não exclusivo</option>
            </select>
          </div>
          <div className="field-group">
            <label>Valor (R$)</label>
            <input name="valor" type="number" step="0.01" min="0" placeholder="450000"
              value={formData.valor} onChange={handleChange} />
          </div>
          <div className="field-group">
            <label>Data do Contrato</label>
            <input name="data_contrato" type="date"
              value={formData.data_contrato} onChange={handleChange} />
          </div>
        </div>
      </div>

      {/* ── MEDIDAS ── */}
      <div className="card-box">
        <h3><FaRulerCombined /> Medidas</h3>

        <div className="row">
          <div className="field-group">
            <label>Frente (m)</label>
            <input name="frente" type="number" step="0.01" placeholder="8"
              value={formData.frente} onChange={handleChange} />
          </div>
          <div className="field-group">
            <label>Largura (m)</label>
            <input name="largura" type="number" step="0.01" placeholder="12"
              value={formData.largura} onChange={handleChange} />
          </div>
          <div className="field-group">
            <label>Profundidade (m)</label>
            <input name="profundidade" type="number" step="0.01" placeholder="25"
              value={formData.profundidade} onChange={handleChange} />
          </div>
          <div className="field-group">
            <label>Área Total (m²)</label>
            <input name="area_total" type="number" step="0.01" placeholder="70"
              value={formData.area_total} onChange={handleChange} />
          </div>
        </div>

        <div className="field-group">
          <label>Link Google Maps</label>
          <input name="link_maps" type="url" placeholder="https://maps.google.com/..."
            value={formData.link_maps} onChange={handleChange} />
        </div>
      </div>

      {/* ── IMAGEM ── */}
      <div className="card-box">
        <h3><FaUpload /> Imagem {!isEditing && <span className="required">*</span>}</h3>

        {previewUrl ? (
          <div className="image-preview">
            <img src={previewUrl} alt="Preview do imóvel" />
            <button
              type="button"
              className="btn-remove-image"
              onClick={removeImage}
              aria-label="Remover imagem"
            >
              <FaTrash /> Remover
            </button>
          </div>
        ) : (
          <div className="upload-area">
            <label htmlFor="imagem-input" className="file-label">
              <FaUpload />
              {isEditing ? "Trocar imagem" : "Selecionar imagem"}
            </label>
            <p className="upload-hint">JPG, PNG ou WebP — máx. 5 MB</p>
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

      {/* ── AÇÕES ── */}
      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn-cancel" onClick={onCancel}>
            Cancelar
          </button>
        )}
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading
            ? "Salvando..."
            : isEditing ? "Salvar Alterações" : "Cadastrar Imóvel"}
        </button>
      </div>

    </form>
  );
}
