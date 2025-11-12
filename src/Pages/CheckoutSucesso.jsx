import React, { useEffect, useContext, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import '../Pages/CSS/CheckoutSucesso.css';
import { ShopContext } from '../Context/ShopContext';

export default function CheckoutSucesso() {
  const { clearCart } = useContext(ShopContext);
  const [searchParams] = useSearchParams();

  const { rawId, displayId } = useMemo(() => {
    const raw = searchParams.get('payment_id') || searchParams.get('external_reference') || '';
    return {
      rawId: raw,
      displayId: raw ? `#${raw}` : '—'
    };
  }, [searchParams]);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  const CONFETTI_COUNT = 12;

  return (
    <div className="checkout-sucesso">
      <div className="confetti" aria-hidden="true">
        {Array.from({ length: CONFETTI_COUNT }).map((_, i) => (
            <div key={i} className="confetti-piece" />
        ))}
      </div>

      <div className="sucesso-card">
        <div className="sucesso-icon" aria-hidden="true">
          <svg viewBox="0 0 120 120">
            <defs>
              <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" />
                <stop offset="100%" />
              </linearGradient>
            </defs>
            <circle className="check-circle" cx="60" cy="60" r="54" />
            <path className="check-mark" d="M 35 60 L 50 75 L 85 40" />
          </svg>
        </div>

        <h1>🎉 Pagamento Aprovado!</h1>
        <p>
          Seu pedido foi confirmado com sucesso! Em breve você receberá um e-mail com os detalhes da compra e o código de rastreamento.
        </p>

        <div className="pedido-detalhes">
          <p>
            <strong>Status:</strong>
            <span className="status-ok">✅ Confirmado</span>
          </p>
          <p>
            <strong>Pedido:</strong>
            <span className="ref">{displayId}</span>
          </p>
          <p>
            <strong>Previsão de entrega:</strong>
            <span>5–7 dias úteis</span>
          </p>
        </div>

        <div className="sucesso-actions">
          <Link to="/" className="btn-sucesso">
            🏠 Início
          </Link>
          <Link to="/meus-pedidos" className="btn-sucesso btn-alt">
            📦 Meus Pedidos
          </Link>
        </div>
      </div>
    </div>
  );
}