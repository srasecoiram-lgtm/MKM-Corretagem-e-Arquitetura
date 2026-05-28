import React, { useState } from "react";
import Header from "../components/Header";
import Footer  from "../components/Footer";
import "../styles/Anuncie.css";
import axios from "axios";

export default function Anuncie() {
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  const [dadosContato, setDadosContato] = useState({
    nome: "",
    email: "",
    telefone: "",
    cep: "",
  });

  const handleContatoChange = (e) => {
    const { name, value } = e.target;
    setDadosContato({ ...dadosContato, [name]: value });
  };

  const handleContatoSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3001/api/contato", dadosContato);
      alert("Seus dados foram enviados com sucesso!");
      setDadosContato({ nome: "", email: "", telefone: "", cep: "" });
    } catch (err) {
      alert("Erro ao enviar dados. Tente novamente.");
    }
  };

  return (
    <div>
      <Header />
      <div className="anuncie-layout">
        {isAdmin ? (
          <div className="admin-area">
            <h2>Cadastrar Imóvel</h2>
            {/* Aqui vai o componente de cadastro completo para ADM */}
          </div>
        ) : (
          <>
            <div className="etapas-info">
              <h2>Seu anúncio de forma prática, online e gratuita</h2>
              <p>
                Te ajudamos a vender ou alugar seu imóvel com apoio de corretores especializados. É rápido, fácil e gratuito.
              </p>

              <div className="etapa-lista">
                <div className="etapa">
                  <span>1</span>
                  <p>Pré-cadastro do imóvel</p>
                </div>
                <div className="etapa">
                  <span>2</span>
                  <p>Hora de fazer seu imóvel brilhar</p>
                </div>
                <div className="etapa">
                  <span>3</span>
                  <p>O corretor entra em cena</p>
                </div>
                <div className="etapa">
                  <span>4</span>
                  <p>Anúncio publicado!</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleContatoSubmit} className="form-contato">
              <h3>Alugue ou venda seu imóvel com a MKM!</h3>

              <input
                type="text"
                name="nome"
                placeholder="Nome"
                value={dadosContato.nome}
                onChange={handleContatoChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="E-mail"
                value={dadosContato.email}
                onChange={handleContatoChange}
                required
              />
              <input
                type="tel"
                name="telefone"
                placeholder="Telefone"
                value={dadosContato.telefone}
                onChange={handleContatoChange}
                required
              />

              <div className="cep-row">
                <input
                  type="text"
                  name="cep"
                  placeholder="CEP"
                  value={dadosContato.cep}
                  onChange={handleContatoChange}
                  required
                />
                <a
                  href="https://buscacepinter.correios.com.br/app/endereco/index.php"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-cep"
                >
                  Não sei o CEP
                </a>
              </div>

              <button type="submit">Anunciar meu imóvel</button>
            </form>
          </>
        )}
      </div>
       <Footer />
    </div>
  );
}
