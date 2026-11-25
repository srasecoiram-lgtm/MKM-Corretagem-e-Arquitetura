import React, { useState } from "react";
import { openWhatsApp, whatsappUrl } from "../services/contato";
import Header   from "../components/Header";
import Footer   from "../components/Footer";
import {
  FaClipboardList, FaCamera, FaUserTie,
  FaBullhorn, FaCheckCircle, FaWhatsapp,
} from "react-icons/fa";
import "../styles/Anuncie.css";

const ETAPAS = [
  {
    num: "01",
    icon: <FaClipboardList />,
    titulo: "Pré-cadastro",
    desc: "Preencha as informações básicas do seu imóvel. Leva menos de 2 minutos.",
  },
  {
    num: "02",
    icon: <FaCamera />,
    titulo: "Destaque seu imóvel",
    desc: "Adicione fotos de qualidade para atrair mais compradores e locatários.",
  },
  {
    num: "03",
    icon: <FaUserTie />,
    titulo: "Corretor em ação",
    desc: "Um corretor MKM especializado entra em contato para finalizar o anúncio.",
  },
  {
    num: "04",
    icon: <FaBullhorn />,
    titulo: "Anúncio publicado!",
    desc: "Seu imóvel aparece para milhares de interessados na nossa plataforma.",
  },
];

const DIFERENCIAIS = [
  { icon: "🏆", titulo: "22 anos de experiência", desc: "Profissionais certificados e habilitados no mercado imobiliário." },
  { icon: "💰", titulo: "100% gratuito", desc: "Nenhum custo para anunciar. Você só paga quando vender ou alugar." },
  { icon: "📋", titulo: "Suporte completo", desc: "Auxiliamos com documentação, contratos e financiamento." },
  { icon: "🛡️", titulo: "Credenciados SUSEP", desc: "Seguros completos para proteger sua transação imobiliária." },
];

export default function Anuncie() {
  const [form, setForm]       = useState({ nome: "", email: "", telefone: "", cep: "", tipo: "" });
  const [whatsapp, setWhatsapp] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const msg = `Olá! Quero anunciar meu imóvel na MKM.\n\nNome: ${form.nome}\nE-mail: ${form.email}\nTelefone: ${form.telefone}\nCEP: ${form.cep}\nTipo: ${form.tipo || "Não informado"}`;
    setWhatsapp(openWhatsApp(msg));
  };

  return (
    <div className="an-page">
      <Header />

      {/* ══ HERO ══ */}
      <div className="an-hero">
        <div className="an-hero__inner">
          <span className="an-hero__tag">Anuncie gratuitamente</span>
          <h1>Venda ou alugue seu imóvel com a MKM</h1>
          <p>
            Conectamos você a compradores e locatários qualificados em Praia Grande
            e região. Rápido, gratuito e com suporte de corretores especializados.
          </p>
          <div className="an-hero__pills">
            <span>✅ Gratuito</span>
            <span>✅ Sem burocracia</span>
            <span>✅ Suporte completo</span>
          </div>
        </div>
      </div>

      {/* ══ ETAPAS ══ */}
      <div className="an-etapas-section">
        <div className="an-section-head">
          <h2>Como funciona</h2>
          <p>Do cadastro à publicação em 4 passos simples</p>
        </div>

        <div className="an-etapas">
          {ETAPAS.map((e, i) => (
            <div key={i} className="an-etapa">
              <div className="an-etapa__num">{e.num}</div>
              <div className="an-etapa__icon">{e.icon}</div>
              <h3>{e.titulo}</h3>
              <p>{e.desc}</p>
              {i < ETAPAS.length - 1 && <div className="an-etapa__arrow">→</div>}
            </div>
          ))}
        </div>
      </div>

      {/* ══ LAYOUT PRINCIPAL: DIFERENCIAIS + FORMULÁRIO ══ */}
      <div className="an-main">

        {/* DIFERENCIAIS */}
        <div className="an-diferenciais">
          <h2>Por que escolher a MKM?</h2>
          <p className="an-diferenciais__sub">
            Mais de 22 anos conectando pessoas ao imóvel dos seus sonhos com
            ética, transparência e resultado.
          </p>

          <div className="an-diferenciais__grid">
            {DIFERENCIAIS.map((d, i) => (
              <div key={i} className="an-diferencial">
                <span className="an-diferencial__icon">{d.icon}</span>
                <div>
                  <h4>{d.titulo}</h4>
                  <p>{d.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA WhatsApp secundário */}
          <a
            href={whatsappUrl()}
            className="an-wa-btn"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaWhatsapp />
            Falar com um corretor agora
          </a>
        </div>

        {/* FORMULÁRIO */}
        <div className="an-form-card">
          <div className="an-form-card__head">
            <h2>Anuncie seu imóvel</h2>
            <p>Prepare os dados e envie pelo WhatsApp.</p>
          </div>

          {whatsapp ? (
            <div className="an-sucesso">
              <FaCheckCircle />
              <h3>Mensagem preparada</h3>
              <p>
                Revise e envie os dados na conversa com a MKM.
              </p>
              <a href={whatsapp} target="_blank" rel="noopener noreferrer">Reabrir WhatsApp</a>
              <button className="an-novo-btn" onClick={() => setWhatsapp("")}>
                Editar dados
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="an-form">

              <div className="an-field">
                <label>Nome completo</label>
                <input
                  type="text"
                  name="nome"
                  placeholder="Seu nome"
                  value={form.nome}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="an-field">
                <label>E-mail</label>
                <input
                  type="email"
                  name="email"
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="an-field">
                <label>Telefone / WhatsApp</label>
                <input
                  type="tel"
                  name="telefone"
                  placeholder="(11) 99999-9999"
                  value={form.telefone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="an-row">
                <div className="an-field">
                  <label>CEP do imóvel</label>
                  <div className="an-cep-wrap">
                    <input
                      type="text"
                      name="cep"
                      placeholder="00000-000"
                      value={form.cep}
                      onChange={handleChange}
                      maxLength={9}
                      required
                    />
                  </div>
                  <a
                    href="https://buscacepinter.correios.com.br/app/endereco/index.php"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="an-link-cep"
                  >
                    Não sei o CEP
                  </a>
                </div>

                <div className="an-field">
                  <label>Tipo de imóvel</label>
                  <select name="tipo" value={form.tipo} onChange={handleChange}>
                    <option value="">Selecione</option>
                    <option value="Apartamento">Apartamento</option>
                    <option value="Casa">Casa</option>
                    <option value="Terreno">Terreno</option>
                    <option value="Comercial">Comercial</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="an-submit">
                Abrir no WhatsApp
              </button>

              <p className="an-disclaimer">
                Ao enviar, você concorda em receber contato da equipe MKM.
                Não enviamos spam.
              </p>
            </form>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
