import React, { createContext, useState, useEffect, useCallback } from 'react';

export const ShopContext = createContext(null);

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
const getCartKey = (id, size, color) => `${id}_${size ?? 'Único'}_${color ?? 'Padrão'}`;

const fetchJSON = async (url, options) => {
  const res = await fetch(url, options);
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${text || 'Erro'}`);
  return text ? JSON.parse(text) : null;
};

const ShopContextProvider = (props) => {
  const [all_product, setAll_Product] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [cupomAplicado, setCupomAplicado] = useState(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth-token');
    return {
      'Content-Type': 'application/json',
      'auth-token': token || '',
      Authorization: token ? `Bearer ${token}` : '',
    };
  };

  const carregarDados = useCallback(async () => {
    try {
      const produtos = await fetchJSON(`${API_URL}/products/allproducts`);
      setAll_Product(Array.isArray(produtos) ? produtos : []);
      const token = localStorage.getItem('auth-token');
      if (!token) return;
      const carrinho = await fetchJSON(`${API_URL}/users/getcart`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      setCartItems(carrinho || {});
    } catch (e) {
      console.warn('carregarDados falhou:', e.message);
      setCartItems({});
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const addToCart = async (itemId, size = null, color = null) => {
    const token = localStorage.getItem('auth-token');
    if (!token) return alert('Login necessário');
    const produto = all_product.find((p) => p.id === itemId);
    if (!produto || produto.ativo === false) return alert('Indisponível');
    const stock = Number(produto.stock ?? 0);
    const key = getCartKey(itemId, size, color);
    const qtyCarrinho = Number(cartItems[key]?.qty ?? 0);
    if (stock <= 0 || qtyCarrinho >= stock) return alert('Esgotado');
    try {
      const r = await fetchJSON(`${API_URL}/users/addtocart`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ itemId, size, color }),
      });
      if (r?.success) {
        setCartItems((prev) => ({
          ...prev,
          [key]: { qty: (prev[key]?.qty || 0) + 1, size, color, id: itemId },
        }));
      }
    } catch (e) {
      console.warn('addToCart erro:', e.message);
      alert('Erro ao adicionar');
    }
  };

  const removeFromCart = async (itemId, size = null, color = null) => {
    const token = localStorage.getItem('auth-token');
    if (!token) return;
    const key = getCartKey(itemId, size, color);
    try {
      await fetchJSON(`${API_URL}/users/removefromcart`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ itemId, size, color }),
      });
      setCartItems((prev) => {
        const current = prev[key];
        if (!current || current.qty <= 1) {
          const copy = { ...prev };
          delete copy[key];
          return copy;
        }
        return { ...prev, [key]: { ...current, qty: current.qty - 1 } };
      });
    } catch (e) {
      console.warn('removeFromCart erro:', e.message);
    }
  };

  // Remoção completa robusta (fallback por variação e quantidade)
  const removeItemCompletely = async (itemId) => {
    const token = localStorage.getItem('auth-token');
    if (!token) return;
    const variations = Object.entries(cartItems).filter(([_, v]) => v.id === itemId);
    if (variations.length === 0) return;

    // Tenta remoção em massa com flag
    let massOK = false;
    try {
      const r = await fetchJSON(`${API_URL}/users/removefromcart`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ itemId, removeAll: true }),
      });
      massOK = !!r?.success;
    } catch {
      massOK = false;
    }

    // Fallback: remove cada unidade por chamada
    if (!massOK) {
  for (const [, entry] of variations) {
        const { size, color, qty } = entry;
        for (let i = 0; i < (qty || 0); i++) {
          try {
            await fetchJSON(`${API_URL}/users/removefromcart`, {
              method: 'POST',
              headers: getAuthHeaders(),
              body: JSON.stringify({ itemId, size, color }),
            });
          } catch (e) {
            console.warn('Falha parcial na remoção:', itemId, size, color, e.message);
            break;
          }
        }
      }
    }

    // Sincroniza com servidor para garantir
    try {
      const carrinhoAtual = await fetchJSON(`${API_URL}/users/getcart`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      setCartItems(carrinhoAtual || {});
    } catch (e) {
      // Se falhar, remove local mesmo
      setCartItems((prev) => {
        const copy = { ...prev };
        Object.keys(copy).forEach((k) => {
          if (copy[k].id === itemId) delete copy[k];
        });
        return copy;
      });
    }
  };

  const getTotalCartAmount = () => {
    let total = 0;
    for (const key in cartItems) {
      const entry = cartItems[key];
      const info = all_product.find((p) => p.id === Number(entry.id));
      if (info) total += info.new_price * entry.qty;
    }
    return total;
  };

  const getTotalComDesconto = () => {
    const total = getTotalCartAmount();
    if (!cupomAplicado) return total;
    if (cupomAplicado.tipo === 'porcentagem') return total - total * (cupomAplicado.valor / 100);
    if (cupomAplicado.tipo === 'fixo') return total - cupomAplicado.valor;
    if (cupomAplicado.tipo === 'frete') return total - 20;
    return total;
  };

  const aplicarCupom = (c) => setCupomAplicado(c);
  const removerCupom = () => setCupomAplicado(null);
  const clearCart = () => setCartItems({});
  const limparCarrinho = clearCart;

  const getTotalCartItems = () => {
    let t = 0;
    for (const k in cartItems) t += cartItems[k]?.qty || 0;
    return t;
  };

  const contextValue = {
    getTotalCartItems,
    getTotalCartAmount,
    getTotalComDesconto,
    all_product,
    cartItems,
    addToCart,
    removeFromCart,
    removeItemCompletely,
    limparCarrinho,
    clearCart,
    aplicarCupom,
    removerCupom,
    cupomAplicado,
    carregarDados,
  };

  return <ShopContext.Provider value={contextValue}>{props.children}</ShopContext.Provider>;
};

export default ShopContextProvider;