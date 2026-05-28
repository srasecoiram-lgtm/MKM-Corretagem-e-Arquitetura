import React, { useState } from "react";
import Header   from "../components/Header";
import Footer   from "../components/Footer";
import "../styles/Blog.css";

const PROJETOS = [
  { id:1, cat:"Residencial",  titulo:"Tendências de plantas modernas para apartamentos compactos",       resumo:"Integração de ambientes, pé-direito alto e nichos inteligentes — maximize espaços de até 45 m².",                img:"https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=900&q=70", destaque:true  },
  { id:2, cat:"Sustentável",  titulo:"Telhados verdes e energia solar no litoral paulista",              resumo:"Como incorporar soluções ecoeficientes em imóveis novos e na reforma de casas existentes.",                      img:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=70", destaque:false },
  { id:3, cat:"Interiores",   titulo:"Paleta de cores para valorizar o imóvel na venda",                resumo:"Cores neutras, iluminação estratégica e home staging — técnicas que aumentam o valor percebido em até 15%.",     img:"https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=70", destaque:false },
  { id:4, cat:"Residencial",  titulo:"Reforma de banheiro: o que priorizar com orçamento limitado",     resumo:"Do rejunte ao revestimento: um guia prático para reformar com o máximo de impacto visual.",                      img:"https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=900&q=70", destaque:false },
];

const CATS = ["Todos","Residencial","Sustentável","Interiores"];

export default function Arquitetura() {
  const [cat, setCat] = useState("Todos");
  const lista    = cat === "Todos" ? PROJETOS : PROJETOS.filter((p) => p.cat === cat);
  const destaque = lista.find((p) => p.destaque) || lista[0];
  const demais   = lista.filter((p) => p.id !== destaque?.id);

  return (
    <div className="blog-page">
      <Header />

      <div className="blog-hero blog-hero--arq">
        <h1>Arquitetura & Design</h1>
        <p>Inspiração, tendências e dicas práticas para valorizar o seu imóvel</p>
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
        {destaque && (
          <div className="blog-hero-post">
            <div className="blog-hero-post__img">
              <img src={destaque.img} alt={destaque.titulo} loading="lazy" />
              <span className="blog-badge">{destaque.cat}</span>
            </div>
            <div className="blog-hero-post__body">
              <h2>{destaque.titulo}</h2>
              <p>{destaque.resumo}</p>
              <span className="blog-cta blog-cta--ghost">Em breve →</span>
            </div>
          </div>
        )}

        {demais.length > 0 && (
          <div className="blog-grid">
            {demais.map((p) => (
              <article key={p.id} className="blog-card">
                <div className="blog-card__img">
                  <img src={p.img} alt={p.titulo} loading="lazy" />
                  <span className="blog-badge">{p.cat}</span>
                </div>
                <div className="blog-card__body">
                  <h3>{p.titulo}</h3>
                  <p>{p.resumo}</p>
                  <span className="blog-read-link" style={{ opacity: 0.4, cursor: "default" }}>Em breve</span>
                </div>
              </article>
            ))}
          </div>
        )}

        {lista.length === 0 && <p className="blog-empty">Nenhum projeto nesta categoria.</p>}
      </div>

      <Footer />
    </div>
  );
}
