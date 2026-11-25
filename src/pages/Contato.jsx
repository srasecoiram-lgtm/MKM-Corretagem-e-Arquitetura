import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { openWhatsApp } from "../services/contato";
import "../styles/Contato.css";

export default function Contato() {
  const [link, setLink] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const message = [
      "Olá! Gostaria de falar com a MKM.",
      "",
      "Nome: " + fields.get("nome").trim(),
      "E-mail: " + fields.get("email").trim(),
      "",
      fields.get("mensagem").trim(),
    ].join("\n");
    setLink(openWhatsApp(message));
  }

  return (
    <div>
      <Header />
      <main className="contato-container">
        <h1>Fale Conosco</h1>
        <form onSubmit={handleSubmit} className="contato-form">
          <label htmlFor="contact-name">Nome</label>
          <input id="contact-name" name="nome" autoComplete="name" maxLength={100} required />
          <label htmlFor="contact-email">E-mail</label>
          <input id="contact-email" type="email" name="email" autoComplete="email" maxLength={150} required />
          <label htmlFor="contact-message">Mensagem</label>
          <textarea id="contact-message" name="mensagem" maxLength={1500} required />
          <button type="submit">Abrir no WhatsApp</button>
          {link && <p role="status">Revise e envie a mensagem na conversa.{" "}
            <a href={link} target="_blank" rel="noopener noreferrer">Reabrir WhatsApp</a></p>}
        </form>
      </main>
      <Footer />
    </div>
  );
}
