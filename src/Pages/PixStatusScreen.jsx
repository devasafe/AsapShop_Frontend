import React, { useEffect, useContext, useRef } from 'react';
import { ShopContext } from '../Context/ShopContext';
import { BASE_URL } from '../config';
const MP_PUBLIC_KEY = process.env.REACT_APP_MP_PUBLIC_KEY || 'YOUR_PUBLIC_KEY';

export default function PixStatusScreen() {
  const { clearCart } = useContext(ShopContext);
  const brickCreated = useRef(false);
  const pollingInterval = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentId = params.get('payment_id');

    if (!paymentId) {
      alert('payment_id não encontrado');
      return;
    }

    const stopPolling = () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
      }
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
    };

    const checkPaymentStatus = async () => {
      try {
        abortRef.current = new AbortController();
        const res = await fetch(
          `${BASE_URL}/pagamento/status-payment/${paymentId}?silent=1`,
          { signal: abortRef.current.signal }
        );
        const data = await res.json();

        if (data?.status === 'approved') {
          stopPolling();
          clearCart();
          window.location.href = '/checkout/sucesso';
        } else if (data?.status === 'rejected' || data?.status === 'cancelled') {
          stopPolling();
          window.location.href = '/checkout/falha';
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Erro ao verificar status:', err);
        }
      }
    };

    const startPolling = () => {
      if (pollingInterval.current) return; // evita múltiplos intervals
      pollingInterval.current = setInterval(checkPaymentStatus, 3000);
    };

    const onVisibility = () => {
      if (document.hidden) {
        stopPolling(); // pausa quando a aba não está visível
      } else {
        startPolling(); // retoma ao voltar para a aba
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    startPolling();

    // Cria o Status Screen Brick
    if (!brickCreated.current) {
      const existingScript = document.querySelector('script[src="https://sdk.mercadopago.com/js/v2"]');

      const initBrick = () => {
        if (brickCreated.current) return;
        brickCreated.current = true;

        const mp = new window.MercadoPago(MP_PUBLIC_KEY, { locale: 'pt-BR' });
        const bricksBuilder = mp.bricks();

        bricksBuilder.create('statusScreen', 'statusScreenBrick_container', {
          initialization: { paymentId },
          customization: {
            visual: {
              hideStatusDetails: false,
              hideTransactionDate: false,
              style: { theme: 'bootstrap' },
            },
            backUrls: {
              error: `${window.location.origin}/checkout/falha`,
              return: `${window.location.origin}/`, // volta para home
            },
          },
          callbacks: {
            onReady: () => console.log('✅ Status Screen pronto'),
            onError: (error) => console.error('❌ Status Screen erro:', error),
          },
        });
      };

      if (existingScript) {
        if (window.MercadoPago) {
          initBrick();
        } else {
          existingScript.addEventListener('load', initBrick);
        }
      } else {
        const script = document.createElement('script');
        script.src = 'https://sdk.mercadopago.com/js/v2';
        script.async = true;
        script.onload = initBrick;
        document.body.appendChild(script);
      }
    }

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      stopPolling(); // cleanup ao sair da tela
    };
  }, [clearCart]);



  return (
    <div style={{ padding: 24 }}>
      <h2>Aguardando confirmação do Pix...</h2>
      <p>Após pagar, aguarde alguns segundos. Você será redirecionado automaticamente.</p>
      <div id="statusScreenBrick_container"></div>

    </div>
  );
}