import { BASE_URL } from '../../config';
import React, { useState, useEffect } from 'react';
import './CSS/AdminPedidos.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const AdminPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [loading, setLoading] = useState(true);

  // Detecta forma de pagamento de forma robusta
  const getFormaPagamento = (p) => {
    const candidates = [
      p.paymentMethod,
      p.formaPagamento,
      p.metodoPagamento,
      p.metodo,
      p.payment_method,
      p.payment_type,
      p.payment?.payment_method_id,
      p.payment?.payment_type_id,
      p.payment?.method,
      p.raw?.payment_method_id,
      p.raw?.payment_type_id,
      p.raw?.payment_method,
      p.raw?.payment_type,
    ];
    const raw = candidates.find(v => v) || '';
    const s = String(raw).toLowerCase();

    if (!raw && (p.paymentId || p.payment_id)) return 'Mercado Pago';
    if (s.includes('pix') || s === 'pix' || s.includes('bank_transfer')) return 'Pix';
    if (s.includes('credit') || s.includes('cart') || s === 'credit_card') return 'Cartão';
    if (s.includes('debit') || s === 'debit_card') return 'Débito';
    if (s.includes('boleto')) return 'Boleto';
    return raw || '—';
  };

  useEffect(() => {
    fetch(`${API_URL}/users/getallpedidos`, {
      headers: { 'auth-token': localStorage.getItem('auth-token') }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPedidos(data.pedidos);
        } else {
          alert('Erro ao carregar pedidos');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Erro na requisição:', err);
        setLoading(false);
      });
  }, []);

  const atualizarStatus = async (id, novoStatus) => {
    try {
      await fetch(`${API_URL}/users/updatepedido/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem('auth-token')
        },
        body: JSON.stringify({ status: novoStatus })
      });

      setPedidos(prev =>
        prev.map(p => (p._id === id ? { ...p, status: novoStatus } : p))
      );

      if (pedidoSelecionado && pedidoSelecionado._id === id) {
        setPedidoSelecionado(prev => ({ ...prev, status: novoStatus }));
      }
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    }
  };

  if (loading) return <p className="admin-loading">Carregando pedidos...</p>;

  return (
    <div className="admin-pedidos">
      <h2>🧾 Pedidos Recebidos</h2>
      {pedidos.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Cliente</th>
              <th>Email</th>
              <th>Total</th>
              <th>Pagamento</th>
              <th>Status</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((p, index) => (
              <tr key={p._id}>
                <td>{index + 1}</td>
                <td>{p.nome}</td>
                <td>{p.email}</td>
                <td>R$ {p.total?.toFixed(2)}</td>
                <td>{getFormaPagamento(p)}</td>
                <td>{p.status}</td>
                <td>{p.data ? new Date(p.data).toLocaleDateString('pt-BR') : '—'}</td>
                <td>
                  <button onClick={() => setPedidoSelecionado(p)}>Ver</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Nenhum pedido encontrado.</p>
      )}

      {pedidoSelecionado && (
        <div className="pedido-detalhes">
          <h3>Detalhes do Pedido</h3>
          <p><strong>Cliente:</strong> {pedidoSelecionado.nome}</p>
          <p><strong>Email:</strong> {pedidoSelecionado.email}</p>
          <p><strong>Total:</strong> R$ {pedidoSelecionado.total?.toFixed(2)}</p>
          <p><strong>Forma de Pagamento:</strong> {getFormaPagamento(pedidoSelecionado)}</p>
          {pedidoSelecionado.paymentId && (
            <p><strong>ID Transação:</strong> {pedidoSelecionado.paymentId}</p>
          )}
          <p><strong>Status:</strong> {pedidoSelecionado.status}</p>
          <p><strong>Data:</strong> {pedidoSelecionado.data ? new Date(pedidoSelecionado.data).toLocaleDateString('pt-BR') : '—'}</p>

          <p><strong>Itens:</strong></p>
          <ul className="pedido-itens">
            {pedidoSelecionado.itens?.map((item, i) => (
              <li key={i} className="item-bloco">
                <img
                  src={
                    item.image && item.image.startsWith('/images/')
                      ? `${BASE_URL}${item.image}`
                      : item.image && item.image.startsWith('http')
                        ? item.image
                        : 'https://via.placeholder.com/60'
                  }
                  alt={item.name || 'Produto'}
                  className="item-imagem"
                />
                <div className="item-info">
                  <p><strong>{item.name || 'Produto'}</strong></p>
                  <p>{item.qty}x — Tamanho: {item.size || '—'}, Cor: {item.color || '—'}</p>
                </div>
              </li>
            ))}
          </ul>

          <select
            value={pedidoSelecionado.status}
            onChange={e => atualizarStatus(pedidoSelecionado._id, e.target.value)}
          >
            <option value="Pendente">Pendente</option>
            <option value="Pago">Pago</option>
            <option value="Enviado">Enviado</option>
            <option value="Entregue">Entregue</option>
            <option value="Cancelado">Cancelado</option>
          </select>

          <button onClick={() => setPedidoSelecionado(null)}>Fechar</button>
        </div>
      )}
    </div>
  );
};

export default AdminPedidos;
