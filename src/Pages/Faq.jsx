import React, { useState } from 'react';
import './CSS/Faq.css';

const perguntas = [
  {
    pergunta: 'Como funcionam os drops da AsapStore?',
    resposta: 'Cada drop é uma coleção limitada com data e hora pra começar e acabar. Quando termina, os produtos saem do ar e entram pro histórico.'
  },
  {
    pergunta: 'Posso comprar fora do período do drop?',
    resposta: 'Não. Os produtos só ficam disponíveis durante o período ativo do drop. Depois disso, não voltam mais.'
  },
  {
    pergunta: 'Quais formas de pagamento vocês aceitam?',
    resposta: 'Aceitamos Pix, cartão de crédito, débito e boleto através do Mercado Pago - uma das plataformas mais seguras da América Latina. Seus dados são protegidos com criptografia de ponta e certificação PCI DSS.'
  },
  {
    pergunta: 'Os pagamentos são realmente seguros?',
    resposta: 'Sim! Utilizamos o Mercado Pago, que possui certificação internacional de segurança. Suas informações financeiras são criptografadas e nunca ficam armazenadas em nosso servidor. Você compra com total tranquilidade.'
  },
  {
    pergunta: 'Como acompanho meu pedido?',
    resposta: 'Você recebe um e-mail com o rastreio e pode acompanhar pelo seu perfil na aba "Histórico de Compras".'
  },
  {
    pergunta: 'Vocês enviam para todo o Brasil?',
    resposta: 'Sim! O frete é calculado automaticamente no checkout, e entregamos em todas as regiões.'
  },
  {
    pergunta: 'Posso trocar ou devolver um produto?',
    resposta: 'Sim. Você tem até 7 dias após o recebimento para solicitar troca ou devolução.'
  }
];

const Faq = () => {
  const [ativo, setAtivo] = useState(null);

  const toggle = index => {
    setAtivo(ativo === index ? null : index);
  };

  return (
    <div className="faq-page">
      <div style={{ paddingTop: '92px' }}></div>
      <div className="faq-container">
        <h1 className="faq-titulo">❓ FAQ</h1>
        <p className="faq-subtitulo">Dúvidas frequentes sobre como funciona a AsapStore</p>

        <div className="faq-lista">
          {perguntas.map((item, index) => (
            <div 
              key={index} 
              className={`faq-card ${ativo === index ? 'ativo' : ''}`} 
              onClick={() => toggle(index)}
            >
              <div className="faq-topo">
                <h3>{item.pergunta}</h3>
                <span className="faq-icon">{ativo === index ? '−' : '+'}</span>
              </div>
              {ativo === index && (
                <div className="faq-conteudo">
                  <p>{item.resposta}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="faq-seguranca">
          <div className="seguranca-badge">
            <span className="badge-icon">🔒</span>
            <div className="badge-texto">
              <strong>Pagamento 100% Seguro</strong>
              <p>Protegido por Mercado Pago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Faq;
