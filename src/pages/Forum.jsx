import React, { useState } from "react";
import Header   from "../components/Header";
import Footer   from "../components/Footer";
import { FaThumbsUp, FaCommentAlt, FaEye } from "react-icons/fa";
import "../styles/Forum.css";

/* ── DADOS MOCKADOS ── */
const TOPICOS = [
  { id:1, cat:"Compra",       titulo:"Qual a melhor região de Praia Grande para investir em 2025?",           autor:"Carlos M.",  data:"12 mai. 2025", r:14, v:238, l:9,  ok:true  },
  { id:2, cat:"Documentação", titulo:"Quanto tempo leva para sair a escritura depois da assinatura?",          autor:"Ana P.",     data:"10 mai. 2025", r:7,  v:124, l:5,  ok:true  },
  { id:3, cat:"Aluguel",      titulo:"Proprietário pode reajustar o aluguel todo ano?",                        autor:"Rafael T.",  data:"8 mai. 2025",  r:11, v:305, l:12, ok:false },
  { id:4, cat:"Financiamento","titulo":"Fiz simulação no banco e a taxa ficou 10,5% — é normal?",              autor:"Juliana S.", data:"6 mai. 2025",  r:4,  v:98,  l:3,  ok:false },
  { id:5, cat:"Reforma",      titulo:"Posso reformar um apartamento antes de receber as chaves?",              autor:"Marcos L.",  data:"3 mai. 2025",  r:6,  v:176, l:7,  ok:true  },
  { id:6, cat:"Compra",       titulo:"Como funciona a visita com corretor? Sou obrigado a fechar pela imob?",  autor:"Bia R.",     data:"1 mai. 2025",  r:9,  v:210, l:11, ok:true  },
];

const CATS = ["Todos","Compra","Aluguel","Financiamento","Documentação","Reforma"];

const CAT_CLASS = {
  Compra:"fc--compra", Aluguel:"fc--aluguel",
  Financiamento:"fc--fin", Documentação:"fc--doc", Reforma:"fc--ref",
};

export default function Forum() {
  const [cat,     setCat]     = useState("Todos");
  const [enviado, setEnviado] = useState(false);
  const [form,    setForm]    = useState({ autor:"", cat:"Compra", titulo:"", msg:"" });

  const lista = cat === "Todos" ? TOPICOS : TOPICOS.filter((t) => t.cat === cat);

  const handleSubmit = (e) => {
    e.preventDefault();
    setEnviado(true);
    setForm({ autor:"", cat:"Compra", titulo:"", msg:"" });
    setTimeout(() => setEnviado(false), 5000);
  };

  return (
    <div className="forum-page">
      <Header />

      {/* HERO */}
      <div className="forum-hero">
        <h1>Fórum da Comunidade</h1>
        <p>Tire dúvidas e compartilhe experiências com outros usuários e corretores MKM</p>
      </div>

      <div className="forum-wrap">
        <div className="forum-layout">

          {/* ── LISTA DE TÓPICOS ── */}
          <main className="forum-main">

            {/* Filtros de categoria */}
            <div className="forum-filtros">
              {CATS.map((c) => (
                <button key={c} type="button"
                  className={`forum-filtro ${cat === c ? "forum-filtro--on" : ""}`}
                  onClick={() => setCat(c)}
                >{c}</button>
              ))}
            </div>

            {/* Tópicos */}
            <div className="forum-list">
              {lista.map((t) => (
                <div key={t.id} className="forum-topico">
                  <div className="forum-topico__body">
                    <div className="forum-topico__tags">
                      <span className={`forum-cat-badge ${CAT_CLASS[t.cat] || ""}`}>{t.cat}</span>
                      {t.ok && <span className="forum-ok">✓ Respondido</span>}
                    </div>
                    <p className="forum-topico__titulo">{t.titulo}</p>
                    <p className="forum-topico__meta">
                      por <strong>{t.autor}</strong> · {t.data}
                    </p>
                  </div>
                  <div className="forum-topico__stats">
                    <span><FaCommentAlt /> {t.r}</span>
                    <span><FaEye />        {t.v}</span>
                    <span><FaThumbsUp />   {t.l}</span>
                  </div>
                </div>
              ))}

              {lista.length === 0 && (
                <p className="forum-empty">Nenhum tópico nesta categoria ainda.</p>
              )}
            </div>
          </main>

          {/* ── SIDEBAR: NOVO TÓPICO ── */}
          <aside className="forum-aside">

            <div className="forum-card">
              <h2>Nova pergunta</h2>

              {enviado ? (
                <div className="forum-sucesso">
                  ✅ Pergunta enviada com sucesso! Nossa equipe responderá em breve.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="forum-form">
                  <div className="forum-field">
                    <label>Seu nome</label>
                    <input type="text" placeholder="Como quer ser chamado?"
                      value={form.autor}
                      onChange={(e) => setForm({ ...form, autor: e.target.value })}
                      required />
                  </div>

                  <div className="forum-field">
                    <label>Categoria</label>
                    <select value={form.cat}
                      onChange={(e) => setForm({ ...form, cat: e.target.value })}>
                      {["Compra","Aluguel","Financiamento","Documentação","Reforma"].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="forum-field">
                    <label>Título</label>
                    <input type="text" placeholder="Qual a sua dúvida?"
                      value={form.titulo}
                      onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                      required />
                  </div>

                  <div className="forum-field">
                    <label>Descrição</label>
                    <textarea rows={4} placeholder="Detalhe sua pergunta..."
                      value={form.msg}
                      onChange={(e) => setForm({ ...form, msg: e.target.value })}
                      required />
                  </div>

                  <button type="submit" className="forum-btn">Publicar pergunta</button>
                </form>
              )}
            </div>

            <div className="forum-dicas">
              <h3>💡 Dicas para uma boa pergunta</h3>
              <ul>
                <li>Seja específico sobre sua situação</li>
                <li>Informe cidade ou bairro se relevante</li>
                <li>Verifique se a dúvida já foi respondida</li>
              </ul>
            </div>

          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}
