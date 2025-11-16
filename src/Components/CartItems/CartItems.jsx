import { BASE_URL } from '../../config';
import React, { useContext, useState, useEffect } from 'react';
import './CartItems.css';
import { ShopContext } from '../../Context/ShopContext';
import remove_icon from '../Assets/cart_cross_icon.png';
import { useNavigate } from 'react-router-dom';

const CartItems = () => {
  const {
    getTotalCartAmount,
    all_product,
    cartItems,
    removeFromCart,
    addToCart
  } = useContext(ShopContext);

  const navigate = useNavigate();
  const [cupomDigitado, setCupomDigitado] = useState('');
  const [cupomAplicado, setCupomAplicado] = useState(null);

  // ✅ CARREGA CUPOM DO LOCALSTORAGE AO MONTAR
  useEffect(() => {
    const cupomSalvo = localStorage.getItem('cupomAplicado');
    if (cupomSalvo) {
      try {
        setCupomAplicado(JSON.parse(cupomSalvo));
      } catch (err) {
        console.error('Erro ao carregar cupom:', err);
      }
    }
  }, []);

  const formatBRL = (value) =>
    Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const total = getTotalCartAmount();

  // ✅ CALCULA O TOTAL COM DESCONTO
  const calcularTotalComDesconto = () => {
    if (!cupomAplicado) return total;

    let desconto = 0;
    if (cupomAplicado.tipo === 'percentual') {
      desconto = total * (cupomAplicado.valor / 100);
    } else if (cupomAplicado.tipo === 'fixo') {
      desconto = cupomAplicado.valor;
    }

    return Math.max(0, total - desconto);
  };

  const totalComDesconto = calcularTotalComDesconto();
  const valorDesconto = total - totalComDesconto;

  const handleIncrease = (id, size, color) => {
    if (typeof addToCart === 'function') addToCart(id, size, color);
  };

  const handleDecrease = (id, size, color) => {
    if (typeof removeFromCart === 'function') removeFromCart(id, size, color);
  };

  // ✅ APLICAR CUPOM E SALVAR NO LOCALSTORAGE
  const aplicarCupomLocal = async () => {
    if (!cupomDigitado.trim()) {
      alert('Digite um código de cupom');
      return;
    }

    try {
  const res = await fetch(`${BASE_URL}/coupons/validarcupom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: cupomDigitado.toUpperCase() })
      });

      const data = await res.json();

      if (data.success) {
        setCupomAplicado(data.cupom);
        localStorage.setItem('cupomAplicado', JSON.stringify(data.cupom)); // ✅ SALVA NO LOCALSTORAGE
        alert(`✓ Cupom "${data.cupom.codigo}" aplicado com sucesso!`);
        setCupomDigitado('');
      } else {
        alert(data.error || 'Cupom inválido ou inativo');
      }
    } catch (err) {
      console.error('Erro ao aplicar cupom:', err);
      alert('Erro ao validar cupom');
    }
  };

  // ✅ REMOVER CUPOM E LIMPAR LOCALSTORAGE
  const removerCupom = () => {
    setCupomAplicado(null);
    setCupomDigitado('');
    localStorage.removeItem('cupomAplicado'); // ✅ REMOVE DO LOCALSTORAGE
  };

  if (!all_product || all_product.length === 0) {
    return (
      <div className="cartitems">
        <h2>Seu carrinho está vazio</h2>
      </div>
    );
  }

  return (
    <div className="cartitems">
      <div className="cartitems-format-main">
        <p>Produto</p>
        <p>Título</p>
        <p>Tamanho</p>
        <p>Cor</p>
        <p>Preço</p>
        <p>Quantidade</p>
        <p>Total</p>
        <p>Remover</p>
      </div>
      <hr />
      {Object.entries(cartItems).map(([key, entry]) => {
        const id = Number(key.split('_')[0]);
        const { qty, size, color } = entry;
        const product = all_product.find((p) => p.id === id);
        if (!product || qty <= 0) return null;

        return (
          <div key={key}>
            <div className="cartitems-format cartitems-format-main">
              <img src={product.images?.[0]} alt={product.name} className="carticon-product-icon" />
              <p>{product.name}</p>
              <p className="cartitems-variant">{size ?? '-'}</p>
              <div className="cartitems-color-cell">
                <span>{color ?? '-'}</span>
              </div>
              <p>{formatBRL(product.new_price)}</p>
              <div className="cartitems-quantity-controls" aria-label={`Quantidade de ${product.name}`}>
                <button
                  className="cartitems-qty-btn"
                  onClick={() => handleDecrease(id, size, color)}
                  aria-label={`Diminuir quantidade de ${product.name}`}
                >
                  -
                </button>
                <span className="cartitems-quantity">{qty}</span>
                <button
                  className="cartitems-qty-btn"
                  onClick={() => handleIncrease(id, size, color)}
                  aria-label={`Aumentar quantidade de ${product.name}`}
                >
                  +
                </button>
              </div>
              <p>{formatBRL(product.new_price * qty)}</p>
              <img
                className="cartitems-remove-icon"
                src={remove_icon}
                onClick={() => handleDecrease(id, size, color)}
                alt="Remover"
                role="button"
              />
            </div>
            <hr />
          </div>
        );
      })}
      <div className="cartitems-down">
        <div className="cartitems-total">
          <h1>Total</h1>
          <div>
            <div className="cartitems-total-item">
              <p>Subtotal</p>
              <p>{formatBRL(total)}</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <p>Taxas</p>
              <p>Gratis</p>
            </div>
            <hr />
            {cupomAplicado && valorDesconto > 0 && (
              <>
                <div className="cartitems-total-item" style={{ color: '#28a745' }}>
                  <p>Desconto ({cupomAplicado.codigo})</p>
                  <p>-{formatBRL(valorDesconto)}</p>
                </div>
                <hr />
              </>
            )}
            <div className="cartitems-total-item">
              <h3>Total</h3>
              <h3>{formatBRL(totalComDesconto)}</h3>
            </div>
          </div>
          <button disabled={total === 0} onClick={() => navigate('/checkout')}>
            CHECKOUT
          </button>
        </div>
        <div className="cartitems-promocode">
          <p>Se você tiver um cupom de promoção, INSIRA AQUI</p>
          {!cupomAplicado ? (
            <div className="cartitems-promobox">
              <input
                type="text"
                placeholder="Cupom de desconto"
                value={cupomDigitado}
                onChange={(e) => setCupomDigitado(e.target.value.toUpperCase())}
                maxLength={20}
              />
              <button onClick={aplicarCupomLocal}>Aplicar Cupom</button>
            </div>
          ) : (
            <div className="cupom-confirmacao">
              <p style={{ color: 'green', fontWeight: 'bold' }}>
                ✅ Cupom "{cupomAplicado.codigo}" aplicado com sucesso!
              </p>
              <p>
                Tipo: <strong>{cupomAplicado.tipo === 'percentual' ? 'Percentual' : 'Fixo'}</strong> — Valor:{' '}
                <strong>
                  {cupomAplicado.tipo === 'percentual'
                    ? `${cupomAplicado.valor}%`
                    : `R$ ${cupomAplicado.valor.toFixed(2)}`}
                </strong>
              </p>
              <button 
                onClick={removerCupom}
                style={{
                  marginTop: '10px',
                  padding: '8px 16px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Remover Cupom
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartItems;