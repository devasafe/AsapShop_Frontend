import { BASE_URL } from '../config';
import React, { useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || `${BASE_URL}`;

export default function CheckoutPendente() {
  useEffect(() => {
    const pref = new URLSearchParams(window.location.search).get('pref');
    let timer;
    const tick = async () => {
      try {
        if (!pref) return;
        const res = await fetch(`${API_URL}/pagamento/status/${encodeURIComponent(pref)}`);
        const data = await res.json();
        if (data?.status === 'approved') {
          // Vai para a página de sucesso (lá você limpa o carrinho)
          window.location.replace('/checkout/sucesso');
          return;
        }
        if (data?.status === 'rejected') {
          window.location.replace('/checkout/falha');
          return;
        }
      } catch {}
      timer = setTimeout(tick, 4000);
    };
    tick();
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2>Processando seu Pix...</h2>
      <p>Assim que o pagamento for aprovado, você será redirecionado automaticamente.</p>
    </div>
  );
}