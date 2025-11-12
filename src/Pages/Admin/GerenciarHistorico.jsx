import React, { useState, useEffect } from 'react';
import './CSS/GerenciarHistorico.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const GerenciarHistorico = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      console.log('🔍 Buscando usuários...');
      const token = localStorage.getItem('auth-token');
      
      if (!token) {
        console.error('❌ Token não encontrado');
        setError('Token não encontrado');
        setLoading(false);
        return;
      }

      console.log('📡 Fazendo requisição para:', `${API_URL}/users/getall`);
      
      const res = await fetch(`${API_URL}/users/getall`, {
        method: 'GET',
        headers: { 
          'auth-token': token,
          'Content-Type': 'application/json'
        }
      });

      console.log('📊 Status da resposta:', res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Erro na resposta:', errorText);
        throw new Error(`Erro ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      console.log('✅ Dados recebidos:', data);
      console.log('👥 Usuários:', data.users?.length || 0);

      if (data.success && Array.isArray(data.users)) {
        setUsuarios(data.users);
        console.log('✅ Usuários salvos no estado');
      } else {
        console.warn('⚠️ Resposta sem usuários válidos');
        setUsuarios([]);
      }

      setLoading(false);
    } catch (err) {
      console.error('❌ Erro ao buscar usuários:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleClearHistorico = async (userId, userName) => {
    if (!window.confirm(`Tem certeza que deseja apagar TODO o histórico de ${userName}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('auth-token');
      const res = await fetch(`${API_URL}/users/admin/clear-historico/${userId}`, {
        method: 'DELETE',
        headers: { 'auth-token': token }
      });

      const data = await res.json();

      if (data.success) {
        alert('Histórico apagado com sucesso!');
        fetchUsuarios();
      } else {
        alert(data.error || 'Erro ao apagar histórico');
      }
    } catch (err) {
      console.error('Erro:', err);
      alert('Erro ao apagar histórico');
    }
  };

  const handleDeletePedido = async (userId, pedidoId, userName, pedidoNum) => {
    if (!window.confirm(`Apagar pedido #${pedidoNum} de ${userName}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('auth-token');
      const res = await fetch(`${API_URL}/users/admin/delete-pedido/${userId}/${pedidoId}`, {
        method: 'DELETE',
        headers: { 'auth-token': token }
      });

      const data = await res.json();

      if (data.success) {
        alert('Pedido removido com sucesso!');
        fetchUsuarios();
      } else {
        alert(data.error || 'Erro ao remover pedido');
      }
    } catch (err) {
      console.error('Erro:', err);
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
                      <span>Data: {pedido.data ? new Date(pedido.data).toLocaleDateString('pt-BR') : 'N/A'}</span>
                    </div>
                    <button
                      onClick={() => handleDeletePedido(user._id, pedido._id, user.name, index + 1)}
                      className="btn-delete"
                    >
                      ❌ Remover
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="sem-historico">📦 Sem histórico de compras</p>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default GerenciarHistorico;