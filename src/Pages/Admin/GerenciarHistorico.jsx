import React, { useState, useEffect } from 'react';
import './CSS/GerenciarHistorico.css';
import { BASE_URL } from '../../config';

const GerenciarHistorico = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const getAuthToken = () => localStorage.getItem('auth-token');

  const fetchUsuarios = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setError('Token não encontrado');
        setLoading(false);
        return;
      }

      const res = await fetch(`${BASE_URL}/users/getall`, {
        method: 'GET',
        headers: {
          'auth-token': token,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Erro ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      const users = Array.isArray(data.users) ? data.users : [];
      setUsuarios(users);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleClearHistorico = async (userId, userName) => {
    if (!window.confirm(`Tem certeza que deseja apagar TODO o histórico de ${userName}?`)) return;

    try {
      const token = getAuthToken();
      const res = await fetch(`${BASE_URL}/users/admin/clear-historico/${userId}`, {
        method: 'DELETE',
        headers: {
          'auth-token': token,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();
      if (data.success) {
        alert('Histórico apagado com sucesso!');
        fetchUsuarios();
      } else {
        alert(data.error || 'Erro ao apagar histórico');
      }
    } catch (err) {
      alert('Erro ao apagar histórico');
    }
  };

  const handleDeletePedido = async (userId, pedidoId, userName, pedidoNum) => {
    if (!window.confirm(`Apagar pedido #${pedidoNum} de ${userName}?`)) return;

    try {
      const token = getAuthToken();
      const res = await fetch(`${BASE_URL}/users/admin/delete-pedido/${userId}/${pedidoId}`, {
        method: 'DELETE',
        headers: {
          'auth-token': token,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();
      if (data.success) {
        alert('Pedido removido com sucesso!');
        fetchUsuarios();
      } else {
        alert(data.error || 'Erro ao remover pedido');
      }
    } catch (err) {
      alert('Erro ao remover pedido');
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <p>⏳ Carregando usuários...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error">
        <h3>❌ Erro ao carregar dados</h3>
        <p>{error}</p>
        <button onClick={fetchUsuarios}>🔄 Tentar novamente</button>
      </div>
    );
  }

  return (
    <div className="gerenciar-historico">
      <h2>📋 Gerenciar Históricos de Compras</h2>
      <p className="total-usuarios">Total de usuários: {usuarios.length}</p>

      {usuarios.length === 0 ? (
        <div className="sem-usuarios">
          <p>👥 Nenhum usuário encontrado</p>
        </div>
      ) : (
        usuarios.map((user) => (
          <div key={user._id} className="user-historico-card">
            <div className="user-header">
              <div>
                <h3>{user.name || 'Nome não informado'}</h3>
                <p>{user.email || 'Email não informado'}</p>
              </div>
              <button
                onClick={() => handleClearHistorico(user._id, user.name)}
                className="btn-danger"
                disabled={!user.historico || user.historico.length === 0}
              >
                🗑️ Limpar Todo Histórico
              </button>
            </div>

            {user.historico && user.historico.length > 0 ? (
              <div className="pedidos-list">
                <h4>Pedidos ({user.historico.length}):</h4>
                {user.historico.map((pedido, index) => (
                  <div key={pedido._id} className="pedido-item">
                    <div className="pedido-info">
                      <strong>Pedido #{index + 1}</strong>
                      <span>Total: R$ {pedido.total?.toFixed(2) || '0.00'}</span>
                      <span>Status: {pedido.status || 'N/A'}</span>
                      <span>
                        Data:{' '}
                        {pedido.data
                          ? new Intl.DateTimeFormat('pt-BR', {
                              dateStyle: 'medium',
                            }).format(new Date(pedido.data))
                          : 'N/A'}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        handleDeletePedido(user._id, pedido._id, user.name, index + 1)
                      }
                      className="btn-delete"
                    >
                      ❌ Remover
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p>Sem histórico de pedidos.</p>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default GerenciarHistorico;
