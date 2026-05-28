import React from "react";
import "../styles/Sobre.css";

export default function SobreTexto() {
  return (
    <div>
      <section className="sobre-container">
        <div className="sobre-conteudo">
          <h1>Quem Somos</h1>
          <p>
            A <strong>MKM Corretagem &amp; Consultoria</strong> é uma empresa especializada
            no mercado imobiliário, oferecendo assessoria completa na compra, venda e
            locação de imóveis. Nosso compromisso é garantir a melhor experiência para
            nossos clientes, com ética, transparência e dedicação.
          </p>
          <p>
            Com uma equipe de corretores altamente qualificados, buscamos atender às
            necessidades de cada cliente de forma personalizada, entregando soluções
            inteligentes e oportunidades únicas.
          </p>
          <p>
            Seja para investir, morar ou realizar o sonho da casa própria, conte com
            a MKM para te guiar com segurança e confiança.
          </p>
        </div>
      </section>

      <section className="sobre-container">
        <div className="sobre-conteudo">
          <h2>Por que nos escolher?</h2>
          <p>
            Contamos com <strong>profissionais habilitados e experientes</strong>,
            com mais de <strong>22 anos de atuação</strong> no mercado imobiliário.
            Atuamos em todas as etapas da jornada: compra, venda, reformas,
            regularização de documentação, financiamento e elaboração de contratos.
          </p>
          <p>
            Nossa equipe inclui um <strong>avaliador certificado (CNAI)</strong>,
            pronto para oferecer suporte técnico em negociações e demandas judiciais.
          </p>
          <p>
            <strong>Somos credenciados pela SUSEP</strong>, oferecendo soluções completas
            em seguros (auto, vida, saúde) para proteger o que é mais importante para você.
          </p>
          <p>
            <strong>
              Nosso maior compromisso é garantir que sua experiência seja tranquila,
              segura e gratificante
            </strong>{" "}
            — do primeiro contato até a conquista do seu novo lar.
          </p>
        </div>
      </section>
    </div>
  );
}
