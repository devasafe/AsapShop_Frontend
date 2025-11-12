import React, { useEffect, useRef, useState } from 'react';
import './CSS/PagamentoCartao.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
const PUBLIC_KEY = process.env.REACT_APP_MP_PUBLIC_KEY;

function parseTotal(itens, totalLS) {
  const ls = (totalLS ?? '').toString().replace(',', '.').trim();
  let t = Number(ls);
  if (!Number.isFinite(t) || t <= 0) {
    t = Array.isArray(itens)
      ? itens.reduce((sum, it) => {
          const qty = Number(it.quantity ?? it.qty ?? 1) || 0;
          const price = Number(
            (it.unit_price ?? it.new_price ?? it.price ?? '0').toString().replace(',', '.')
          ) || 0;
          return sum + qty * price;
        }, 0)
      : 0;
  }
  return Number(t.toFixed(2));
}

function isValidEmail(v) {
  return typeof v === 'string' && /.+@.+\..+/.test(v);
}

export default function PagamentoCartao() {
  const [loading, setLoading] = useState(true);
  const [erroInit, setErroInit] = useState('');
  const brickControllerRef = useRef(null);
  const timeoutRef = useRef(null);

  const endereco = JSON.parse(localStorage.getItem('endereco') || '{}');
  const itens = JSON.parse(localStorage.getItem('itensCheckout') || '[]');
  const valorTotal = parseTotal(itens, localStorage.getItem('valorTotal'));

  useEffect(() => {
    const ensureSDK = () =>
      new Promise((resolve, reject) => {
        if (window.MercadoPago) return resolve();
        const s = document.createElement('script');
        s.src = 'https://sdk.mercadopago.com/js/v2';
        s.async = true;
        s.onload = resolve;
        s.onerror = reject;
        document.body.appendChild(s);
      });

    const destroyBrick = async () => {
      try {
        if (brickControllerRef.current?.destroy) {
          await brickControllerRef.current.destroy();
        }
      } catch {}
      brickControllerRef.current = null;
    };

    (async () => {
      try {
        setLoading(true);
        setErroInit('');

        if (!PUBLIC_KEY) {
          setErroInit('Chave pública Mercado Pago não configurada (REACT_APP_MP_PUBLIC_KEY).');
          setLoading(false);
          return;
        }
        if (!Array.isArray(itens) || itens.length === 0) {
          setErroInit('Carrinho vazio.');
          setLoading(false);
          return;
        }
        if (!Number.isFinite(valorTotal) || valorTotal <= 0) {
          setErroInit('Valor total inválido.');
          setLoading(false);
          return;
        }

        await ensureSDK();
        await destroyBrick();

        const mp = new window.MercadoPago(PUBLIC_KEY, { locale: 'pt-BR' });
        const bricksBuilder = mp.bricks();

        const init = { amount: valorTotal };
        const email = endereco?.email;
        if (isValidEmail(email)) {
          init.payer = { email };
        }

        // Timeout de segurança se onReady não disparar
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setLoading(false);
          setErroInit('Falha ao carregar o formulário do cartão. Verifique sua chave pública e conexão.');
        }, 15000);

        const controller = await bricksBuilder.create('cardPayment', 'cardPaymentBrick_container', {
          initialization: init,
          customization: {
            visual: {
              style: {
                theme: 'dark',
                customVariables: {
                  fontFamily: "'Segoe UI', system-ui, sans-serif",
                  fontSize: '13px',
                  inputVerticalPadding: '6px',   // reduz altura interna
                  borderRadius: '10px',          // inputs/botões mais compactos
                  baseColor: '#f5c546',
                  baseColorSecond: '#ffd86b',
                  formBackgroundColor: '#0f1012',
                  inputBackgroundColor: '#141517',
                  inputBorderColor: 'rgba(255,255,255,0.12)',
                  textPrimaryColor: '#f2f2f2',
                  textSecondaryColor: '#b3b3b8',
                  outlineFocusColor: 'rgba(245,197,70,.35)'
                }
              }
            },
            paymentMethods: { maxInstallments: 12 }
          },
          callbacks: {
            onReady: () => {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              setLoading(false);
            },
            onSubmit: (cardFormData) => {
              return new Promise(async (resolve, reject) => {
                try {
                  const tokenAuth = localStorage.getItem('auth-token') || '';

                  // Normaliza campos do Brick
                  const payment_method_id =
                    cardFormData.payment_method_id || cardFormData.paymentMethodId;
                  const issuer_id = cardFormData.issuer_id || cardFormData.issuerId;

                  const payload = {
                    token: cardFormData.token,
                    payment_method_id,
                    issuer_id,
                    installments: cardFormData.installments,
                    payer: cardFormData.payer,
                    itens,
                    endereco,
                  };

                  console.log('💳 Payload envio:', { ...payload, token: payload.token ? 'OK' : 'MISSING' });

                  // 1. Criar pagamento
                  const res = await fetch(`${API_URL}/pagamento/pagar-cartao-direto`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'auth-token': tokenAuth,
                    },
                    body: JSON.stringify(payload),
                  });

                  const data = await res.json().catch(() => ({}));

                  if (!res.ok || !data?.payment_id) {
                    reject();
                    console.error('❌ Erro retornado:', data);
                    window.location.href = '/falha';
                    return;
                  }

                  const paymentId = data.payment_id;
                  const status = data.status;

                  console.log('✅ Pagamento criado:', { paymentId, status });

                  // 2. Se aprovado, processar pedido (estoque + emails)
                  if (status === 'approved') {
                    try {
                      const processRes = await fetch(`${API_URL}/pagamento/processar-pedido-imediato`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'auth-token': tokenAuth,
                        },
                        body: JSON.stringify({
                          payment_id: paymentId,
                          itens,
                          endereco,
                          cupom: localStorage.getItem('cupomAplicado') || null
                        }),
                      });

                      const processData = await processRes.json().catch(() => ({}));

                      if (processRes.ok && processData?.success) {
                        console.log('✅ Pedido processado:', processData.order_id);
                        // Limpar localStorage
                        localStorage.removeItem('itensCheckout');
                        localStorage.removeItem('valorTotal');
                        localStorage.removeItem('endereco');
                        localStorage.removeItem('cupomAplicado');
                        
                        resolve();
                        window.location.href = `/pix/status?payment_id=${paymentId}`;
                      } else {
                        console.warn('⚠️ Pedido não processado (pode processar via webhook)');
                        resolve();
                        window.location.href = `/pix/status?payment_id=${paymentId}`;
                      }
                    } catch (e) {
                      console.error('❌ Erro ao processar pedido:', e);
                      resolve();
                      window.location.href = `/pix/status?payment_id=${paymentId}`;
                    }
                  } else {
                    // Pagamento pendente/rejeitado
                    resolve();
                    if (status === 'rejected' || status === 'cancelled') {
                      window.location.href = '/falha';
                    } else {
                      window.location.href = `/pix/status?payment_id=${paymentId}`;
                    }
                  }
                } catch (e) {
                  console.error('Erro submit cartão:', e);
                  reject();
                  window.location.href = '/falha';
                }
              });
            },
            onError: (error) => {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              console.error('Brick erro:', error);
              setErroInit('Erro ao inicializar o componente de cartão.');
              setLoading(false);
            },
          },
        });

        brickControllerRef.current = controller;
      } catch (e) {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        console.error('Falha inicialização cartão:', e);
        setErroInit('Falha ao inicializar pagamento.');
        setLoading(false);
      }
    })();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [endereco, itens, valorTotal]);

  return (
    <div className="pagamento-cartao-page">
      <div style={{ paddingTop: '92px' }} />
      <div className="pagamento-container">
        <h1>💳 Pagamento com Cartão</h1>
        <p>Total: <strong>R$ {valorTotal.toFixed(2)}</strong></p>
        {erroInit && <div className="erro-init">{erroInit}</div>}
        {loading && !erroInit && <div className="loading">Carregando...</div>}
        <div id="cardPaymentBrick_container"></div>
        <a className="btn-voltar" href="/checkout">← Voltar</a>
      </div>
    </div>
  );
}