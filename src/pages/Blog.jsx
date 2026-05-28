import React, { useState } from "react";
import Header   from "../components/Header";
import Footer   from "../components/Footer";
import { Link } from "react-router-dom";
import "../styles/Blog.css";

const POSTS = [
  { id:1, cat:"Mercado",       titulo:"Como o mercado imobiliário de Praia Grande cresceu em 2024",   resumo:"Registramos um dos maiores índices de valorização do litoral paulista. Entenda os fatores e o que esperar para 2025.", data:"10 mai. 2025", tempo:"5 min", img:"https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=900&q=70", destaque:true  },
  { id:2, cat:"Dicas",         titulo:"10 perguntas que você deve fazer antes de assinar um contrato", resumo:"Muitos compradores se arrependem por não questionar pontos essenciais. Veja o checklist completo.",                  data:"5 mai. 2025",  tempo:"4 min", img:"https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=900&q=70", destaque:false },
  { id:3, cat:"Financiamento", titulo:"Tudo sobre o Minha Casa Minha Vida em 2025",                   resumo:"Novas faixas de renda, taxas de juros atualizadas e como se inscrever no programa habitacional.",                  data:"28 abr. 2025", tempo:"6 min", img:"https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=70", destaque:false },
  { id:4, cat:"Investimento",  titulo:"Vale a pena investir em imóvel na praia?",                     resumo:"Comparamos o retorno de imóveis litorâneos com outras modalidades de investimento e analisamos a liquidez.",        data:"20 abr. 2025", tempo:"7 min", img:"https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=900&q=70", destaque:false },
  { id:5, cat:"Documentação",  titulo:"Regularização de imóvel: passo a passo completo",              resumo:"Escritura, registro, ITBI, IPTU — entenda cada etapa da documentação e evite surpresas no processo de compra.",     data:"15 abr. 2025", tempo:"8 min", img:"https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=70", destaque:false },
];

const CATS = ["Todos","Mercado","Dicas","Financiamento","Investimento","Documentação"];

export default function Blog() {
  const [cat, setCat] = useState("Todos");
  const lista    = cat === "Todos" ? POSTS : POSTS.filter((p) => p.cat === cat);
  const destaque = lista.find((p) => p.destaque) || lista[0];
  const demais   = lista.filter((p) => p.id !== destaque?.id);

  return (
    <div className="blog-page">
      <Header />

      <div className="blog-hero">
        <h1>Blog MKM</h1>
        <p>Conteúdo especializado sobre o mercado imobiliário de Praia Grande e região</p>
      </div>

      <div className="blog-cats">
        {CATS.map((c) => (
          <button key={c} type="button"
            className={`blog-cat-btn ${cat === c ? "blog-cat-btn--on" : ""}`}
            onClick={() => setCat(c)}
          >{c}</button>
        ))}
      </div>

      <div className="blog-wrap">
        {/* DESTAQUE */}
        {destaque && (
          <div className="blog-hero-post">
            <div className="blog-hero-post__img">
              <img src={destaque.img} alt={destaque.titulo} loading="lazy" />
              <span className="blog-badge">{destaque.cat}</span>
            </div>
            <div className="blog-hero-post__body">
              <span className="blog-meta">{destaque.data} · {destaque.tempo} de leitura</span>
              <h2>{destaque.titulo}</h2>
              <p>{destaque.resumo}</p>
              <Link to={`/blog/${destaque.id}`} className="blog-cta">Ler artigo completo →</Link>
            </div>
          </div>
        )}

        {/* GRID */}
        {demais.length > 0 && (
          <div className="blog-grid">
            {demais.map((post) => (
              <article key={post.id} className="blog-card">
                <div className="blog-card__img">
                  <img src={post.img} alt={post.titulo} loading="lazy" />
                  <span className="blog-badge">{post.cat}</span>
                </div>
                <div className="blog-card__body">
                  <span className="blog-meta">{post.data} · {post.tempo}</span>
                  <h3>{post.titulo}</h3>
                  <p>{post.resumo}</p>
                  <Link to={`/blog/${post.id}`} className="blog-read-link">Continuar lendo →</Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {lista.length === 0 && <p className="blog-empty">Nenhum artigo nesta categoria.</p>}
      </div>

      <Footer />
    </div>
  );
}
