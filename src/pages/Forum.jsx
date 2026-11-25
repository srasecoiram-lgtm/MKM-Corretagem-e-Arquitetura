import React, { useState } from "react";
import { Link } from "react-router";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { openWhatsApp } from "../services/contato";
import "../styles/Forum.css";

const topics = [
  ["Compra", "Como agendar uma visita com um corretor?"],
  ["Documentação", "Quais documentos preciso levar para começar a compra?"],
  ["Aluguel", "Como conferir as condições de reajuste do aluguel?"],
  ["Financiamento", "Quais dados preciso para começar uma simulação?"],
  ["Reforma", "O que verificar antes de reformar um apartamento?"],
];
const categories = topics.map(([category]) => category);

export default function Forum() {
  const [category, setCategory] = useState("");
  const [link, setLink] = useState("");
  const filtered = category ? topics.filter(([name]) => name === category) : topics;

  function handleSubmit(event) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const message = ["Olá! Tenho uma dúvida para a MKM.", "Assunto: " + fields.get("categoria"),
      "", fields.get("mensagem").trim()].join("\n");
    setLink(openWhatsApp(message));
  }

  return (
    <div className="forum-page">
      <Header />
      <div className="forum-hero">
        <h1>Dúvidas sobre imóveis</h1>
        <p>Envie sua pergunta à equipe MKM pelo WhatsApp.</p>
      </div>
      <div className="forum-wrap">
        <div className="forum-layout">
          <main className="forum-main">
            <div className="forum-filtros" aria-label="Assuntos">
              {["", ...categories].map((item) => (
                <button key={item} type="button" aria-pressed={category === item}
                  className={"forum-filtro" + (category === item ? " forum-filtro--on" : "")}
                  onClick={() => setCategory(item)}>{item || "Todos"}</button>
              ))}
            </div>
            <ul className="forum-list">
              {filtered.map(([name, title]) => (
                <li key={name} className="forum-topico">
                  <div className="forum-topico__body">
                    <p className="forum-topico__titulo">{title}</p>
                    <p className="forum-topico__meta">{name}</p>
                  </div>
                </li>
              ))}
            </ul>
          </main>
          <aside className="forum-aside">
            <div className="forum-card">
              <h2>Faça uma pergunta</h2>
              <form onSubmit={handleSubmit} className="forum-form">
                <div className="forum-field">
                  <label htmlFor="forum-topic">Assunto</label>
                  <select id="forum-topic" name="categoria" value={category || categories[0]}
                    onChange={(event) => setCategory(event.target.value)}>
                    {categories.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </div>
                <div className="forum-field">
                  <label htmlFor="forum-message">Sua dúvida</label>
                  <textarea id="forum-message" name="mensagem" rows={4} maxLength={1500} required />
                </div>
                <button type="submit" className="forum-btn">Abrir no WhatsApp</button>
                {link && <p role="status">Revise e envie sua pergunta na conversa.{" "}
                  <a href={link} target="_blank" rel="noopener noreferrer">Reabrir WhatsApp</a></p>}
              </form>
            </div>
            <Link to="/contato">Outras formas de contato</Link>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
}
