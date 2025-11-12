import React, { useState, useContext, useMemo, useEffect } from 'react';
import { ShopContext } from '../Context/ShopContext';
import { useNavigate } from 'react-router-dom';
import './CSS/Checkout.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://asapshop-backend.onrender.com';

const buildImageUrl = (raw) => {
  if (!raw || typeof raw !== 'string') return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  const cleaned = raw
    .replace(/^public\//i, '')
    .replace(/^\.?\/*/, '')
    .replace(/^\\+/, '')
    .replace(/\\/g, '/');
  return `${API_URL}/${cleaned}`;
};

const getProductImage = (produto) => {
  if (!produto) return null;
  const candidates = [
    produto.image,
    produto.imageUrl,
    produto.img,
    produto.thumbnail,
    produto.picture,
    Array.isArray(produto.images) ? produto.images[0] : null,
  ].filter(Boolean);
  for (const c of candidates) {
    const url = buildImageUrl(c);
    if (url) return url;
  }
  return null;
};

const Checkout = () => {
  const { getTotalCartAmount, all_product, cartItems, clearCart } = useContext(ShopContext);
  const navigate = useNavigate();

  const [endereco, setEndereco] = useState({
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    telefone: '',
  });
  const [metodoPagamento, setMetodoPagamento] = useState('pix');
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [pixCopiaECola, setPixCopiaECola] = useState('');
  const [cupomAplicado, setCupomAplicado] = useState(null);

  useEffect(() => {
    const cupomSalvo = localStorage.getItem('cupomAplicado');
    if (cupomSalvo) {
      try { setCupomAplicado(JSON.parse(cupomSalvo)); } catch {}
    }
  }, []);

  const itensIndisponiveis = useMemo(() => {
    return Object.keys(cartItems).reduce((acc, key) => {
      const entry = cartItems[key];
      if (!entry?.qty) return acc;
      const produto = all_product.find(p => p.id === entry.id);
      if (!produto || produto.available === false || Number(produto.stock ?? 0) < entry.qty) {
        acc.push({ key, entry, produto });
      }
      return acc;
    }, []);
  }, [cartItems, all_product]);

  const existeIndisponivel = itensIndisponiveis.length > 0;

  const { subtotal, desconto, total } = useMemo(() => {
    const s = getTotalCartAmount();
    if (!cupomAplicado) return { subtotal: s, desconto: 0, total: s };
    const d = cupomAplicado.tipo === 'percentual'
      ? s * (cupomAplicado.valor / 100)
      : cupomAplicado.valor;
    return { subtotal: s, desconto: d, total: Math.max(0, s - d) };
  }, [getTotalCartAmount, cupomAplicado]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEndereco(prev => ({ ...prev, [name]: value }));
  };

  const prepararItens = () =>
    Object.keys(cartItems).reduce((acc, key) => {
      const item = cartItems[key];
      if (item.qty > 0) {
        const produto = all_product.find(p => p.id === item.id);
        if (produto) {
          acc.push({
            id: produto.id,
            productId: produto.id,
            title: produto.name,
            quantity: item.qty,
            qty: item.qty,
            unit_price: produto.new_price,
            size: item.size || 'Único',
            color: item.color || 'Padrão',
          });
        }
      }
      return acc;
    }, []);

  const iniciarFluxoCartao = (itens) => {
    localStorage.setItem('endereco', JSON.stringify(endereco));
    localStorage.setItem('itensCheckout', JSON.stringify(itens));
    localStorage.setItem('valorTotal', String(total));
    navigate('/pagamento/cartao');
  };

  const aguardarPagamento = async (pid, itens, enderecoData) => {
    let tentativas = 0;
    const maxTentativas = 200;
    const interval = setInterval(async () => {
      tentativas++;
      if (tentativas > maxTentativas) {
        clearInterval(interval);
        alert('Tempo limite excedido.');
        return;
      }
      try {
        const r = await fetch(`${API_URL}/pagamento/status-payment/${pid}?silent=1`, {
          headers: { 'auth-token': localStorage.getItem('auth-token') }
        });
        const s = await r.json();
        if (s.status === 'approved') {
          clearInterval(interval);
            const pr = await fetch(`${API_URL}/pagamento/processar-pedido-imediato`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'auth-token': localStorage.getItem('auth-token'),
              },
              body: JSON.stringify({ payment_id: pid, itens, endereco: enderecoData }),
            });
            const pd = await pr.json();
            if (pd.success) {
              clearCart();
              localStorage.removeItem('cupomAplicado');
              navigate(`/checkout/sucesso?payment_id=${pid}`);
            } else {
              alert(pd.error || 'Erro ao processar.');
            }
        } else if (['rejected', 'cancelled'].includes(s.status)) {
          clearInterval(interval);
          alert('Pagamento não aprovado.');
          navigate('/checkout/falha');
        }
      } catch {}
    }, 3000);
  };

  const validarEndereco = () => {
    const obrigatorios = ['cep', 'rua', 'numero', 'cidade', 'estado', 'telefone'];
    return obrigatorios.every(f => endereco[f]?.trim());
  };

  const finalizarCompra = async () => {
    if (existeIndisponivel) { alert('Itens indisponíveis no carrinho.'); return; }
    if (!validarEndereco()) { alert('Preencha todos os campos obrigatórios.'); return; }
    const token = localStorage.getItem('auth-token');
    if (!token) { alert('Faça login.'); navigate('/login'); return; }

    setLoading(true);
    try {
      const itens = prepararItens();
      if (!itens.length) { alert('Carrinho vazio.'); return; }

      if (metodoPagamento === 'pix') {
        const r = await fetch(`${API_URL}/pix/gerar-pix-direto`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'auth-token': token },
          body: JSON.stringify({
            itens,
            endereco,
            valorTotal: total,
            cupom: cupomAplicado?.codigo || null
          })
        });
        const data = await r.json();
        if (!data.success) { alert(data.error || 'Erro no Pix'); return; }
        setQrCode(data.qr_code_base64);
        setPixCopiaECola(data.qr_code);
        setPaymentId(data.payment_id);
        aguardarPagamento(data.payment_id, itens, endereco);
        alert('Pix gerado. Aguarde a confirmação.');
      } else if (metodoPagamento === 'cartao') {
        iniciarFluxoCartao(itens);
      } else {
        alert('Selecione forma de pagamento.');
      }
    } catch {
      alert('Erro no processamento.');
    } finally {
      setLoading(false);
    }
  };

  const copiarCodigoPix = () => {
    if (!pixCopiaECola) return;
    navigator.clipboard.writeText(pixCopiaECola);
    alert('Código Pix copiado.');
  };

  return (
    <div className="checkout-page">
      <div className="checkout">
        <h1>Finalizar Compra</h1>

        {existeIndisponivel && (
          <div className="checkout-warning">
            Há item(s) indisponível(is). Remova para continuar.
          </div>
        )}

        <div className="checkout-container">
          <div className="checkout-form">
            <section className="section-bloco">
              <h2>Endereço</h2>
              <div className="form-group"><label>CEP *</label><input name="cep" value={endereco.cep} onChange={handleInputChange} /></div>
              <div className="form-group"><label>Rua *</label><input name="rua" value={endereco.rua} onChange={handleInputChange} /></div>
              <div className="form-row">
                <div className="form-group"><label>Número *</label><input name="numero" value={endereco.numero} onChange={handleInputChange} /></div>
                <div className="form-group"><label>Complemento</label><input name="complemento" value={endereco.complemento} onChange={handleInputChange} /></div>
              </div>
              <div className="form-group"><label>Bairro *</label><input name="bairro" value={endereco.bairro} onChange={handleInputChange} /></div>
              <div className="form-row">
                <div className="form-group"><label>Cidade *</label><input name="cidade" value={endereco.cidade} onChange={handleInputChange} /></div>
                <div className="form-group"><label>Estado *</label><input name="estado" value={endereco.estado} onChange={handleInputChange} maxLength={2} /></div>
              </div>
              <div className="form-group"><label>Telefone *</label><input name="telefone" value={endereco.telefone} onChange={handleInputChange} /></div>
            </section>

            <section className="section-bloco">
              <h2>Pagamento</h2>
              <div className="payment-methods">
                <label>
                  <input type="radio" value="pix" checked={metodoPagamento === 'pix'} onChange={(e) => setMetodoPagamento(e.target.value)} />
                  <span>Pix</span>
                </label>
                <label>
                  <input type="radio" value="cartao" checked={metodoPagamento === 'cartao'} onChange={(e) => setMetodoPagamento(e.target.value)} />
                  <span>Cartão</span>
                </label>
              </div>
              <button
                className={`checkout-button ${existeIndisponivel ? 'unavailable' : ''}`}
                onClick={finalizarCompra}
                disabled={loading}
              >
                {loading ? 'Processando...' : existeIndisponivel ? 'Verifique Itens' : 'Finalizar Compra'}
              </button>

              {qrCode && (
                <div className="pix-box">
                  <h3>Pagamento Pix</h3>
                  <img src={`data:image/png;base64,${qrCode}`} alt="QR Code Pix" />
                  <button className="pix-copy" onClick={copiarCodigoPix}>Copiar código</button>
                  <small>ID: {paymentId}</small>
                </div>
              )}
            </section>
          </div>

          <aside className="checkout-summary">
            <h2>Resumo</h2>
            <div className="summary-items">
              {Object.keys(cartItems).map(key => {
                const item = cartItems[key];
                if (item.qty <= 0) return null;
                const produto = all_product.find(p => p.id === item.id);
                const indisponivel = !produto || produto.available === false || Number(produto?.stock ?? 0) < item.qty;
                if (!produto) return null;
                const imgSrc = getProductImage(produto) || '/placeholder.png';
                return (
                  <div key={key} className={`summary-item ${indisponivel ? 'soldout' : ''}`}>
                    <div className="summary-item-img-wrapper">
                      <img
                        src={imgSrc}
                        alt={produto.name}
                        onError={(e) => {
                          if (e.currentTarget.dataset.fallback !== '1') {
                            e.currentTarget.dataset.fallback = '1';
                            e.currentTarget.src = '/placeholder.png';
                          } else {
                            e.currentTarget.src = 'https://via.placeholder.com/70?text=IMG';
                          }
                        }}
                      />
                      {indisponivel && <span className="soldout-badge">SOLD OUT</span>}
                    </div>
                    <div>
                      <p>{produto.name}</p>
                      <p>Tamanho: {item.size || 'Único'}</p>
                      <p>Cor: {item.color || 'Padrão'}</p>
                      <p>Qtd: {item.qty}</p>
                      {indisponivel && <p className="soldout-text">Indisponível (remova)</p>}
                    </div>
                    <p>R$ {(produto.new_price * item.qty).toFixed(2)}</p>
                  </div>
                );
              })}
            </div>

            <div className="summary-total">
              {cupomAplicado && (
                <>
                  <div className="subtotal-line">
                    <span>Subtotal:</span>
                    <span>R$ {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="desconto-line">
                    <span>Desconto ({cupomAplicado.codigo}):</span>
                    <span>-R$ {desconto.toFixed(2)}</span>
                  </div>
                  <hr />
                </>
              )}
              <h3>Total: <span>R$ {total.toFixed(2)}</span></h3>
              {!cupomAplicado && <p className="hint-cupom">* Cupons aplicam-se no carrinho</p>}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Checkout;