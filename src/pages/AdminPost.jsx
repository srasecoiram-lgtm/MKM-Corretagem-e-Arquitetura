// src/pages/AdminPosts.jsx
import React, { useState, useEffect, useRef } from "react";
import HeaderAdmin from "../components/HeaderAdmin";
import api         from "../services/api";
import {
  FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash,
  FaSave, FaTimes, FaImage, FaBold, FaItalic,
  FaListUl, FaListOl, FaQuoteRight, FaHeading,
} from "react-icons/fa";
import "../styles/AdminPosts.css";

/* ── CATEGORIAS ── */
const CATS_BLOG = ["Mercado","Dicas","Financiamento","Investimento","Documentação","Novidades"];
const CATS_ARQ  = ["Residencial","Sustentável","Interiores","Reforma","Paisagismo","Comercial"];

const SECAO_CONFIG = {
  blog:        { label: "Blog",        cats: CATS_BLOG, placeholder_titulo: "Ex: 5 dicas para comprar seu primeiro imóvel" },
  arquitetura: { label: "Arquitetura", cats: CATS_ARQ,  placeholder_titulo: "Ex: Tendências de interiores para 2025" },
};

/* ── FORM VAZIO ── */
const FORM_VAZIO = {
  titulo:   "",
  resumo:   "",
  conteudo: "",
  categoria:"",
  imagem_url: "",
  tempo_leitura: "",
  destaque: false,
  publicado: true,
};

export default function AdminPosts() {
  const [secao,   setSecao]   = useState("blog");
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modo,    setModo]    = useState("lista");   // "lista" | "criar" | "editar"
  const [form,    setForm]    = useState(FORM_VAZIO);
  const [editId,  setEditId]  = useState(null);
  const [imgFile, setImgFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [saving,  setSaving]  = useState(false);
  const [erro,    setErro]    = useState("");
  const [sucesso, setSucesso] = useState("");
  const textRef = useRef(null);

  const cfg = SECAO_CONFIG[secao];

  /* ── FETCH POSTS ── */
  useEffect(() => {
    fetchPosts();
  }, [secao]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/posts?secao=${secao}`);
      setPosts(res.data || []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  /* ── EDITOR: inserir markdown simplificado ── */
  const inserir = (antes, depois = "") => {
    const el    = textRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end   = el.selectionEnd;
    const sel   = el.value.slice(start, end);
    const novo  = el.value.slice(0, start) + antes + (sel || "texto") + depois + el.value.slice(end);
    setForm(f => ({ ...f, conteudo: novo }));
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + antes.length, start + antes.length + (sel || "texto").length);
    }, 10);
  };

  /* ── IMAGEM ── */
  const handleImg = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImgFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
    setForm(f => ({ ...f, imagem_url: "" }));
  };

  /* ── SUBMIT ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titulo.trim()) { setErro("Título obrigatório."); return; }
    if (!form.categoria)     { setErro("Selecione uma categoria."); return; }
    if (!form.conteudo.trim()) { setErro("Conteúdo não pode estar vazio."); return; }

    setSaving(true);
    setErro("");
    setSucesso("");

    try {
      const payload = new FormData();
      Object.keys(form).forEach(k => payload.append(k, form[k]));
      payload.append("secao", secao);
      if (imgFile) payload.append("imagem", imgFile);

      if (editId) {
        await api.put(`/posts/${editId}`, payload, { headers: { "Content-Type": "multipart/form-data" } });
        setSucesso("Post atualizado com sucesso!");
      } else {
        await api.post("/posts", payload, { headers: { "Content-Type": "multipart/form-data" } });
        setSucesso("Post criado com sucesso!");
      }

      await fetchPosts();
      setModo("lista");
      resetForm();
    } catch (err) {
      setErro(err.response?.data?.erro || "Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setForm(FORM_VAZIO);
    setImgFile(null);
    setPreview("");
    setEditId(null);
    setErro("");
    setSucesso("");
  };

  const abrirEdicao = (post) => {
    setForm({
      titulo:        post.titulo        || "",
      resumo:        post.resumo        || "",
      conteudo:      post.conteudo      || "",
      categoria:     post.categoria     || "",
      imagem_url:    post.imagem_url    || "",
      tempo_leitura: post.tempo_leitura || "",
      destaque:      post.destaque      || false,
      publicado:     post.publicado !== false,
    });
    setPreview(post.imagem_url || "");
    setEditId(post.id);
    setModo("editar");
    setErro("");
    setSucesso("");
  };

  const excluir = async (id) => {
    if (!window.confirm("Excluir este post permanentemente?")) return;
    try {
      await api.delete(`/posts/${id}`);
      fetchPosts();
    } catch { alert("Erro ao excluir."); }
  };

  const togglePublicado = async (post) => {
    try {
      await api.put(`/posts/${post.id}`, { ...post, publicado: !post.publicado, secao });
      fetchPosts();
    } catch { alert("Erro ao atualizar status."); }
  };

  /* ── RENDER ── */
  return (
    <div className="ap-page">
      <HeaderAdmin />

      {/* TOPBAR */}
      <div className="ap-topbar">
        <div className="ap-topbar__left">
          <h1>Gerenciar Conteúdo</h1>
          <p>Crie e edite posts do Blog e da seção de Arquitetura</p>
        </div>

        {modo === "lista" && (
          <button
            className="ap-btn-new"
            onClick={() => { resetForm(); setModo("criar"); }}
          >
            <FaPlus /> Novo post
          </button>
        )}

        {(modo === "criar" || modo === "editar") && (
          <button
            className="ap-btn-back"
            onClick={() => { setModo("lista"); resetForm(); }}
          >
            <FaTimes /> Cancelar
          </button>
        )}
      </div>

      {/* ABAS DE SEÇÃO */}
      <div className="ap-secoes">
        {Object.entries(SECAO_CONFIG).map(([key, val]) => (
          <button
            key={key}
            className={`ap-secao ${secao === key ? "ap-secao--on" : ""}`}
            onClick={() => { setSecao(key); setModo("lista"); resetForm(); }}
          >
            {secao === key && <span className="ap-secao__dot" />}
            {val.label}
          </button>
        ))}
      </div>

      <div className="ap-body">

        {/* ══ MODO LISTA ══ */}
        {modo === "lista" && (
          <div className="ap-lista">
            {loading ? (
              <div className="ap-state">
                <div className="ap-spinner" />
                <p>Carregando posts…</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="ap-state">
                <p>Nenhum post cadastrado ainda.</p>
                <button className="ap-btn-new" onClick={() => setModo("criar")}>
                  <FaPlus /> Criar primeiro post
                </button>
              </div>
            ) : (
              <div className="ap-cards">
                {posts.map(post => (
                  <div key={post.id} className={`ap-card ${!post.publicado ? "ap-card--rascunho" : ""}`}>
                    {/* Thumb */}
                    <div className="ap-card__img">
                      {post.imagem_url ? (
                        <img src={post.imagem_url} alt={post.titulo} />
                      ) : (
                        <div className="ap-card__img-empty"><FaImage /></div>
                      )}
                      {post.destaque && <span className="ap-card__destaque">⭐ Destaque</span>}
                      {!post.publicado && <span className="ap-card__rascunho">Rascunho</span>}
                    </div>

                    {/* Info */}
                    <div className="ap-card__body">
                      <div className="ap-card__cat">{post.categoria}</div>
                      <h3>{post.titulo}</h3>
                      <p>{post.resumo}</p>
                      <div className="ap-card__meta">
                        {post.tempo_leitura && <span>⏱ {post.tempo_leitura} de leitura</span>}
                        <span>{new Date(post.criado_em).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="ap-card__actions">
                      <button
                        className="ap-icon-btn ap-icon-btn--edit"
                        onClick={() => abrirEdicao(post)}
                        title="Editar"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className={`ap-icon-btn ${post.publicado ? "ap-icon-btn--eye" : "ap-icon-btn--eye-off"}`}
                        onClick={() => togglePublicado(post)}
                        title={post.publicado ? "Despublicar" : "Publicar"}
                      >
                        {post.publicado ? <FaEye /> : <FaEyeSlash />}
                      </button>
                      <button
                        className="ap-icon-btn ap-icon-btn--del"
                        onClick={() => excluir(post.id)}
                        title="Excluir"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ MODO CRIAR / EDITAR ══ */}
        {(modo === "criar" || modo === "editar") && (
          <form onSubmit={handleSubmit} className="ap-editor">

            {/* ALERTAS */}
            {erro    && <div className="ap-alert ap-alert--error">{erro}</div>}
            {sucesso && <div className="ap-alert ap-alert--success">{sucesso}</div>}

            <div className="ap-editor__layout">

              {/* COLUNA PRINCIPAL */}
              <div className="ap-editor__main">

                {/* TÍTULO */}
                <div className="ap-field">
                  <label>Título *</label>
                  <input
                    type="text"
                    placeholder={cfg.placeholder_titulo}
                    value={form.titulo}
                    onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                    required
                  />
                </div>

                {/* RESUMO */}
                <div className="ap-field">
                  <label>Resumo (aparece nos cards)</label>
                  <textarea
                    rows={3}
                    placeholder="Uma descrição curta e atraente do post…"
                    value={form.resumo}
                    onChange={e => setForm(f => ({ ...f, resumo: e.target.value }))}
                  />
                </div>

                {/* EDITOR DE CONTEÚDO */}
                <div className="ap-field">
                  <label>Conteúdo completo *</label>

                  {/* TOOLBAR */}
                  <div className="ap-toolbar">
                    <button type="button" title="Negrito"      onClick={() => inserir("**", "**")}><FaBold /></button>
                    <button type="button" title="Itálico"      onClick={() => inserir("_", "_")}><FaItalic /></button>
                    <button type="button" title="Título H2"    onClick={() => inserir("\n## ", "")}><FaHeading /></button>
                    <button type="button" title="Lista"        onClick={() => inserir("\n- ", "")}><FaListUl /></button>
                    <button type="button" title="Lista num."   onClick={() => inserir("\n1. ", "")}><FaListOl /></button>
                    <button type="button" title="Citação"      onClick={() => inserir("\n> ", "")}><FaQuoteRight /></button>
                    <div className="ap-toolbar__sep" />
                    <span className="ap-toolbar__hint">Markdown suportado</span>
                  </div>

                  <textarea
                    ref={textRef}
                    className="ap-content-editor"
                    rows={18}
                    placeholder={`Escreva o conteúdo completo aqui…\n\n## Subtítulo\n\nParágrafo normal com **negrito** e _itálico_.\n\n- Item de lista\n- Outro item\n\n> Citação em destaque`}
                    value={form.conteudo}
                    onChange={e => setForm(f => ({ ...f, conteudo: e.target.value }))}
                  />

                  {/* PREVIEW SIMPLES */}
                  {form.conteudo && (
                    <details className="ap-preview-details">
                      <summary>Pré-visualizar conteúdo</summary>
                      <div
                        className="ap-preview-content"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(form.conteudo) }}
                      />
                    </details>
                  )}
                </div>
              </div>

              {/* COLUNA LATERAL */}
              <div className="ap-editor__side">

                {/* PUBLICAR */}
                <div className="ap-side-card">
                  <h3>Publicação</h3>
                  <div className="ap-toggle-row">
                    <label className="ap-toggle">
                      <input
                        type="checkbox"
                        checked={form.publicado}
                        onChange={e => setForm(f => ({ ...f, publicado: e.target.checked }))}
                      />
                      <span className="ap-toggle__track" />
                      <span className="ap-toggle__label">
                        {form.publicado ? "Publicado" : "Rascunho"}
                      </span>
                    </label>
                  </div>
                  <div className="ap-toggle-row">
                    <label className="ap-toggle">
                      <input
                        type="checkbox"
                        checked={form.destaque}
                        onChange={e => setForm(f => ({ ...f, destaque: e.target.checked }))}
                      />
                      <span className="ap-toggle__track" />
                      <span className="ap-toggle__label">Post em destaque</span>
                    </label>
                  </div>

                  <button type="submit" className="ap-btn-save" disabled={saving}>
                    <FaSave />
                    {saving ? "Salvando…" : modo === "editar" ? "Salvar alterações" : "Publicar post"}
                  </button>
                </div>

                {/* CATEGORIA */}
                <div className="ap-side-card">
                  <h3>Categoria *</h3>
                  <div className="ap-cat-grid">
                    {cfg.cats.map(c => (
                      <button
                        key={c}
                        type="button"
                        className={`ap-cat-chip ${form.categoria === c ? "ap-cat-chip--on" : ""}`}
                        onClick={() => setForm(f => ({ ...f, categoria: c }))}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* IMAGEM */}
                <div className="ap-side-card">
                  <h3>Imagem de capa</h3>

                  {preview ? (
                    <div className="ap-img-preview">
                      <img src={preview} alt="preview" />
                      <button
                        type="button"
                        className="ap-img-remove"
                        onClick={() => { setPreview(""); setImgFile(null); setForm(f => ({ ...f, imagem_url: "" })); }}
                      >
                        <FaTimes /> Remover
                      </button>
                    </div>
                  ) : (
                    <label className="ap-img-upload">
                      <FaImage />
                      <span>Clique para selecionar</span>
                      <small>JPG, PNG ou WebP — máx. 5MB</small>
                      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImg} />
                    </label>
                  )}

                  <div className="ap-field ap-field--mt">
                    <label>Ou cole uma URL de imagem</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={form.imagem_url}
                      onChange={e => {
                        setForm(f => ({ ...f, imagem_url: e.target.value }));
                        setPreview(e.target.value);
                        setImgFile(null);
                      }}
                    />
                  </div>
                </div>

                {/* TEMPO DE LEITURA */}
                <div className="ap-side-card">
                  <h3>Tempo de leitura</h3>
                  <input
                    type="text"
                    placeholder="Ex: 5 min"
                    value={form.tempo_leitura}
                    onChange={e => setForm(f => ({ ...f, tempo_leitura: e.target.value }))}
                    className="ap-input"
                  />
                </div>

              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ── MARKDOWN SIMPLES (sem lib externa) ── */
function renderMarkdown(text) {
  return text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/^## (.+)$/gm,   "<h2>$1</h2>")
    .replace(/^# (.+)$/gm,    "<h1>$1</h1>")
    .replace(/^### (.+)$/gm,  "<h3>$1</h3>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/_(.+?)_/g,       "<em>$1</em>")
    .replace(/^> (.+)$/gm,     "<blockquote>$1</blockquote>")
    .replace(/^- (.+)$/gm,     "<li>$1</li>")
    .replace(/^[0-9]+\. (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[hbupli])/gm, "")
    .replace(/(.+)/s, "<p>$1</p>");
}