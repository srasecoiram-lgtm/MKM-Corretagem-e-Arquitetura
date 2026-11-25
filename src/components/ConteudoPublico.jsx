import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import api, { mediaUrl } from "../services/api";
import Header from "./Header";
import Footer from "./Footer";
import Markdown from "./Markdown";
import "../styles/Blog.css";

function PostImage({ post }) {
  const src = mediaUrl(post.imagem_url);
  return src ? <img src={src} alt={post.titulo} loading="lazy" /> : null;
}

function PostMeta({ post }) {
  const date = post.criado_em ? new Date(post.criado_em) : null;
  const parts = [
    date && Number.isFinite(date.getTime()) && date.toLocaleDateString("pt-BR"),
    post.tempo_leitura && post.tempo_leitura + " de leitura",
  ].filter(Boolean);
  return parts.length ? <span className="blog-meta">{parts.join(" · ")}</span> : null;
}

function PostCards({ posts, section }) {
  const featured = posts.find((post) => post.destaque) || posts[0];
  if (!featured) return <p className="blog-empty">Nenhum artigo publicado nesta categoria.</p>;
  const remaining = posts.filter((post) => post.id !== featured.id);
  return (
    <>
      <article className="blog-hero-post">
        <div className="blog-hero-post__img">
          <PostImage post={featured} />
          {featured.categoria && <span className="blog-badge">{featured.categoria}</span>}
        </div>
        <div className="blog-hero-post__body">
          <PostMeta post={featured} />
          <h2>{featured.titulo}</h2>
          <p>{featured.resumo}</p>
          <Link to={"/" + section + "/" + featured.id} className="blog-cta">Ler artigo completo →</Link>
        </div>
      </article>
      {remaining.length > 0 && (
        <div className="blog-grid">
          {remaining.map((post) => (
            <article key={post.id} className="blog-card">
              <div className="blog-card__img">
                <PostImage post={post} />
                {post.categoria && <span className="blog-badge">{post.categoria}</span>}
              </div>
              <div className="blog-card__body">
                <PostMeta post={post} />
                <h2>{post.titulo}</h2>
                <p>{post.resumo}</p>
                <Link to={"/" + section + "/" + post.id} className="blog-read-link">Continuar lendo →</Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

export default function ConteudoPublico({ section, title, description }) {
  const { id } = useParams();
  const [category, setCategory] = useState("");
  const [result, setResult] = useState({ loading: true });

  useEffect(() => {
    const controller = new AbortController();
    setCategory("");
    setResult({ loading: true });
    const url = id ? "/posts/" + id : "/posts";
    api.get(url, { params: id ? undefined : { secao: section }, signal: controller.signal })
      .then(({ data }) => {
        if (id && data.secao !== section) {
          setResult({ error: "Artigo não encontrado." });
        } else {
          setResult(id ? { article: data } : { posts: Array.isArray(data) ? data : [] });
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setResult({ error: error.response?.status === 404
            ? "Artigo não encontrado." : "Não foi possível carregar o conteúdo." });
        }
      });
    return () => controller.abort();
  }, [id, section]);

  const { article, posts = [], error, loading } = result;
  const categories = [...new Set(posts.map((post) => post.categoria).filter(Boolean))];
  const filtered = category ? posts.filter((post) => post.categoria === category) : posts;

  return (
    <div className="blog-page">
      <Header />
      <main>
        <div className={"blog-hero" + (section === "arquitetura" ? " blog-hero--arq" : "")}>
          <h1>{article?.titulo || title}</h1>
          <p>{article?.resumo || (!id && description)}</p>
        </div>
        {!id && categories.length > 0 && (
          <div className="blog-cats" aria-label="Categorias">
            {["", ...categories].map((item) => (
              <button key={item} type="button" aria-pressed={category === item}
                className={"blog-cat-btn" + (category === item ? " blog-cat-btn--on" : "")}
                onClick={() => setCategory(item)}>{item || "Todas"}</button>
            ))}
          </div>
        )}
        <div className="blog-wrap">
          {id && <Link to={"/" + section} className="blog-read-link">← Voltar para {title}</Link>}
          {loading && <p className="blog-empty" role="status">Carregando conteúdo…</p>}
          {error && <p className="blog-empty" role="alert">{error}</p>}
          {article && (
            <article className="blog-article">
              <PostMeta post={article} />
              <PostImage post={article} />
              <Markdown text={article.conteudo || ""} />
            </article>
          )}
          {!id && !loading && !error && <PostCards posts={filtered} section={section} />}
        </div>
      </main>
      <Footer />
    </div>
  );
}
