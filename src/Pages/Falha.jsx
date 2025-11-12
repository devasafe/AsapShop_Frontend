import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/Falha.css';

export default function Falha() {
  const navigate = useNavigate();

  return (
    <div className="falha-page">
      <div style={{ paddingTop: '92px' }} />
      <div className="falha-container">
        <div className="falha-icon">❌</div>
        <h1>Pagamento Recusado</h1>
        <p>Infelizmente seu pagamento não foi aprovado.</p>
        <p>Possíveis causas:</p>
        <ul>
          <li>Dados do cartão incorretos</li>
          <li>Saldo insuficiente</li>
          <li>Cartão bloqueado ou vencido</li>
          <li>Limite excedido</li>
        </ul>
        <div className="falha-actions">
          <button onClick={() => navigate('/checkout')} className="btn-tentar-novamente">
            Tentar Novamente
          </button>
          <button onClick={() => navigate('/cart')} className="btn-voltar-carrinho">
            Voltar ao Carrinho
          </button>
        </div>
      </div>
    </div>
  );
}