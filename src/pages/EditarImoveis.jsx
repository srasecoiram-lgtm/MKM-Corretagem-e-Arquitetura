import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaRegBuilding,
  FaClipboardCheck,
  FaRulerCombined,
  FaUpload,
  FaTrash,
  FaArrowLeft,
  FaSave,
} from "react-icons/fa";
import HeaderAdmin from "../components/HeaderAdmin";
import api from "../services/api";
import "../styles/EditarImoveis.css";

const FORM_INICIAL = {
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
  quartos: "",
  banheiros: "",
  vagas: "",
  descricao: "",
  link_maps: "",
};

export default function EditarImoveis() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(FORM_INICIAL);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [imagem, setImagem] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [removerImagem, setRemoverImagem] = useState(false);

  const carregar = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/imoveis/${id}`);
      if (!data?.id) throw new Error("Não encontrado");

      setFormData({
        cep: data.cep || "",
        uf: data.uf || "",
        cidade: data.cidade || "",
        bairro: data.bairro || "",
        logradouro: data.logradouro || "",
        numero: data.numero || "",
        complemento: data.complemento || "",
        tipo_imovel: data.tipo_imovel || "",
        finalidade: data.finalidade || "",
        edificio: data.edificio || "",
        responsavel: data.responsavel || "",
        captador: data.captador || "",
        tipo_contrato: data.tipo_contrato || "",
        valor: data.valor ?? "",
        data_contrato: data.data_contrato || "",
        frente: data.frente ?? "",
        largura: data.largura ?? "",
        profundidade: data.profundidade ?? "",
        area_total: data.area_total ?? "",
        quartos: data.quartos ?? "",
        banheiros: data.banheiros ?? "",
        vagas: data.vagas ?? "",
        descricao: data.descricao || "",
        link_maps: data.link_maps || "",
      });

      if (data.imagem) {
        setPreviewUrl(
          `${process.env.REACT_APP_API_URL || "http://localhost:3002"}${data.imagem}`
        );
      }
    } catch (err) {
      console.error("Erro ao carregar imóvel:", err);
      setError("Não foi possível carregar os dados do imóvel.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImagem(file);
    setRemoverImagem(false);
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const marcarRemocaoImagem = () => {
    setImagem(null);
    setPreviewUrl("");
    setRemoverImagem(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!formData.cep || !formData.uf || !formData.cidade) {
      setError("CEP, UF e Cidade são obrigatórios.");
      return;
    }

    setSalvando(true);

    try {
      const payload = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== "" && formData[key] !== undefined && formData[key] !== null) {
          payload.append(key, formData[key]);
        }
      });

      if (imagem) {
        payload.append("imagem", imagem);
      }

      if (removerImagem) {
        payload.append("removerImagem", "true");
      }

      const { data } = await api.put(`/imoveis/${id}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 20000,
      });

      if (data?.success || data === undefined || data === null) {
        setSuccess(true);
        setImagem(null);
        setRemoverImagem(false);
      } else {
        setError(data?.erro || "Erro ao salvar alterações.");
      }
    } catch (err) {
      if (err.response?.data?.erro) {
        setError(err.response.data.erro);
      } else if (err.code === "ECONNREFUSED" || err.code === "ERR_NETWORK") {
        setError("Servidor offline. Verifique se o backend está rodando.");
      } else {
        setError("Erro ao atualizar imóvel. Tente novamente.");
      }
    } finally {
      setSalvando(false);
    }
  };

  const voltar = () => navigate("/admin/dashboard");

  if (loading)
    return (
      <div className="pagina-edicao">
        <HeaderAdmin />
        <div className="ed-loading">Carregando dados do imóvel…</div>
      </div>
    );

  return (
    <div className="pagina-edicao">
      <HeaderAdmin />

      <div className="ed-topbar">
        <button type="button" className="ed-back" onClick={voltar}>
          <FaArrowLeft /> Voltar
        </button>
        <span className="ed-id">Imóvel #{id}</span>
      </div>

      <form onSubmit={handleSubmit} className="form-edicao">
        <h2>
          <FaRegBuilding />
          {formData.edificio || formData.tipo_imovel || "Editar Imóvel"}
        </h2>

        {error && <div className="ed-alert ed-alert--error">{error}</div>}
        {success && (
          <div className="ed-alert ed-alert--success">
            ✅ Alterações salvas com sucesso!
          </div>
        )}

        {/* ENDEREÇO */}
        <div className="card-box">
          <h3>
            <FaMapMarkerAlt /> Endereço
          </h3>
          <div className="row">
            <input
              name="cep"
              placeholder="CEP"
              value={formData.cep}
              onChange={handleChange}
              maxLength={9}
            />
            <input
              name="uf"
              placeholder="UF"
              value={formData.uf}
              onChange={handleChange}
              maxLength={2}
            />
            <input
              name="cidade"
              placeholder="Cidade"
              value={formData.cidade}
              onChange={handleChange}
            />
          </div>
          <div className="row">
            <input
              name="bairro"
              placeholder="Bairro"
              value={formData.bairro}
              onChange={handleChange}
            />
            <input
              name="logradouro"
              placeholder="Logradouro"
              value={formData.logradouro}
              onChange={handleChange}
            />
            <input
              name="numero"
              placeholder="Nº"
              value={formData.numero}
              onChange={handleChange}
              type="number"
            />
          </div>
          <input
            name="complemento"
            placeholder="Complemento"
            value={formData.complemento}
            onChange={handleChange}
          />
        </div>

        {/* DADOS DO IMÓVEL */}
        <div className="card-box">
          <h3>
            <FaRegBuilding /> Dados do Imóvel
          </h3>
          <div className="row">
            <select
              name="tipo_imovel"
              value={formData.tipo_imovel}
              onChange={handleChange}
            >
              <option value="">Tipo do Imóvel</option>
              <option value="Apartamento">Apartamento</option>
              <option value="Casa">Casa</option>
              <option value="Terreno">Terreno</option>
              <option value="Comercial">Comercial</option>
              <option value="Studio">Studio</option>
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

            <input
              name="edificio"
              placeholder="Edifício/Empreendimento"
              value={formData.edificio}
              onChange={handleChange}
            />
          </div>
          <div className="row">
            <input
              name="responsavel"
              placeholder="Responsável"
              value={formData.responsavel}
              onChange={handleChange}
            />
            <input
              name="captador"
              placeholder="Captador"
              value={formData.captador}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* CONTRATO */}
        <div className="card-box">
          <h3>
            <FaClipboardCheck /> Contrato
          </h3>
          <div className="row">
            <select
              name="tipo_contrato"
              value={formData.tipo_contrato}
              onChange={handleChange}
            >
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

        {/* MEDIDAS */}
        <div className="card-box">
          <h3>
            <FaRulerCombined /> Medidas
          </h3>
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
            <input
              type="number"
              name="area_total"
              placeholder="Área total (m²)"
              value={formData.area_total}
              onChange={handleChange}
              step="0.01"
            />
          </div>

          <input
            name="link_maps"
            placeholder="Link do Google Maps (opcional)"
            value={formData.link_maps}
            onChange={handleChange}
            type="url"
          />
        </div>

        {/* IMAGEM */}
        <div className="card-box">
          <h3>
            <FaUpload /> Imagem do Imóvel
          </h3>

          {previewUrl ? (
            <div className="ed-preview">
              <img src={previewUrl} alt="Preview" />
              <div className="ed-preview-actions">
                <label className="ed-change-img">
                  <FaUpload /> Alterar imagem
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    hidden
                  />
                </label>
                {!removerImagem && (
                  <button
                    type="button"
                    className="ed-remove-img"
                    onClick={marcarRemocaoImagem}
                  >
                    <FaTrash /> Remover
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="ed-upload-area">
              <label className="file-label">
                <FaUpload /> Selecionar imagem
                <input
                  id="imagem-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="file-input"
                />
              </label>
              <p className="ed-upload-hint">
                JPG, PNG ou WebP — máx. 5 MB
              </p>
            </div>
          )}
        </div>

        <div className="ed-footer">
          <button
            type="submit"
            className="ed-submit"
            disabled={salvando || loading}
          >
            {salvando ? (
              "⏳ Salvando…"
            ) : (
              <>
                <FaSave /> Salvar alterações
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
