import React, { useState } from "react";
import Header from "../components/Header";
import "../styles/Contato.css";

export default function Contato() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    mensagem: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Aqui você pode depois enviar para um backend ou e-mail
    console.log("Dados enviados:", formData);
    alert("Mensagem enviada com sucesso!");

    // Limpar o formulário
    setFormData({
      nome: "",
      email: "",
      mensagem: ""
    });
  };

  return (
    <div>
      <Header />
      <section className="contato-container">
        <h1>Fale Conosco</h1>
        <form onSubmit={handleSubmit} className="contato-form">
          <label>Nome:</label>
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
          />

          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>Mensagem:</label>
          <textarea
            name="mensagem"
            value={formData.mensagem}
            onChange={handleChange}
            required
          ></textarea>

          <button type="submit">Enviar</button>
        </form>
      </section>
    </div>
  );
}
