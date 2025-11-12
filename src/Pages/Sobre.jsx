import React from 'react';
import './CSS/Sobre.css';

const Sobre = () => {
  return (
    <div className="sobre-page">
        <div style={{ paddingTop: '92px' }}></div>
      <div className="sobre-container">
        <h1 className="sobre-titulo">🧢 Sobre a AsapStore</h1>
        <p className="sobre-texto">
          A AsapStore é feita pra quem vive o agora. Aqui, os lançamentos acontecem em <strong>drops</strong>: coleções limitadas que entram no ar com data marcada e saem sem aviso. Nada de catálogo fixo. Nada de estoque eterno.
          <br /><br />
          Cada drop é uma chance única de garantir peças exclusivas. Quando acaba, acabou. E quem tem, tem. Quem não tem... espera o próximo.
          <br /><br />
          Nosso estilo é atitude. E cada produto carrega o peso de ter sido escolhido no momento certo. Se você curte viver o momento, tá no lugar certo.
        </p>

        <h2 className="sobre-subtitulo">🧭 Como funciona um drop?</h2>
        <div className="sobre-etapas">
          <div className="etapa">
            <span className="etapa-numero">1</span>
            <div className="etapa-conteudo">
              <h3>Anúncio</h3>
              <p>Soltamos a data e o teaser do próximo drop. Fica ligado nas redes!</p>
            </div>
          </div>
          <div className="etapa">
            <span className="etapa-numero">2</span>
            <div className="etapa-conteudo">
              <h3>Lançamento</h3>
              <p>Na hora marcada, os produtos vão pro ar. Mas é por tempo limitado.</p>
            </div>
          </div>
          <div className="etapa">
            <span className="etapa-numero">3</span>
            <div className="etapa-conteudo">
              <h3>Compra</h3>
              <p>Curtiu? Garante logo. Porque depois que acaba, não volta mais.</p>
            </div>
          </div>
          <div className="etapa">
            <span className="etapa-numero">4</span>
            <div className="etapa-conteudo">
              <h3>Encerramento</h3>
              <p>O drop sai do ar e entra pro histórico. Só quem viveu sabe.</p>
            </div>
          </div>
          <div className="etapa">
            <span className="etapa-numero">5</span>
            <div className="etapa-conteudo">
              <h3>Próximo</h3>
              <p>Já estamos preparando o próximo. E aí, vai perder de novo?</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sobre;