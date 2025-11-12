import React, { useState, useEffect } from 'react';
import './Perfil.css';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'https://asapshop-backend.onrender.com';

const Perfil = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    
    if (!token) {
      console.log('⚠️ Nenhum token encontrado no Perfil');
      alert("Você precisa estar logado para acessar o perfil.");
      navigate('/login');
      return;
    }

    console.log('🔍 Buscando dados do usuário no Perfil...');
    
    fetch(`${API_URL}/users/getuser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': token,
        'Authorization': `Bearer ${token}`
      }
    })
      .then(async (res) => {
        console.log('📡 Status da resposta:', res.status);
        const text = await res.text();
        
        if (!res.ok) {
          throw new Error(text || `Erro ${res.status}`);
        }
        
        return text ? JSON.parse(text) : {};
      })
      .then((data) => {
        console.log('✅ Dados recebidos no Perfil:', data);
        
        if (data.success && data.user) {
          setUser(data.user);
          setFormData({
            name: data.user.name || '',
            email: data.user.email || '',
            password: '',
            confirmPassword: '',
            image: null
          });
          setImagePreview(data.user.image);
          setLoading(false);
        } else {
          console.error('❌ Resposta sem sucesso:', data);
          alert("Erro ao carregar perfil.");
          navigate('/login');
        }
      })
      .catch((err) => {
        console.error("❌ Erro ao buscar usuário:", err);
        alert("Erro ao carregar perfil.");
        navigate('/login');
      });
  }, [navigate]);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      confirmPassword: '',
      image: null
    });
    setImagePreview(user.image);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB');
        return;
      }
      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (formData.password && formData.password !== formData.confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      alert('A senha deve ter no mínimo 6 caracteres!');
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('auth-token');
      const form = new FormData();

      form.append('name', formData.name);
      form.append('email', formData.email);
      if (formData.password) {
        form.append('password', formData.password);
      }
      if (formData.image) {
        form.append('image', formData.image);
      }

      const res = await fetch(`${API_URL}/users/updateuser`, {
        method: 'PUT',
        headers: {
          'auth-token': token,
        },
        body: form
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert('Perfil atualizado com sucesso!');
        setUser(data.user);
        setFormData({
          name: data.user.name,
          email: data.user.email,
          password: '',
          confirmPassword: '',
          image: null
        });
        setImagePreview(data.user.image);
        setEditing(false);
      } else {
        alert(data.error || 'Erro ao atualizar perfil');
      }
    } catch (err) {
      console.error('❌ Erro ao salvar:', err);
      alert('Erro ao salvar alterações');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    console.log('🚪 Fazendo logout do Perfil...');
    localStorage.removeItem('auth-token');
    localStorage.removeItem('userId');
    alert('Você saiu da conta.');
    navigate('/');
  };

  const handleGoToCart = () => {
    navigate('/cart');
  };

  const formatBRL = (value) =>
    Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Data inválida';
    }
  };

  const getPaymentIcon = (metodo) => {
    if (!metodo) return '';
    if (metodo === 'pix') return '📱';
    if (metodo.includes('card') || metodo === 'visa' || metodo === 'master' || metodo === 'elo' || metodo === 'amex') return '💳';
    return '💰';
  };

  const getPaymentLabel = (metodo) => {
    if (!metodo) return '';
    if (metodo === 'pix') return 'Pix';
    if (metodo.includes('card') || metodo === 'visa' || metodo === 'master' || metodo === 'elo' || metodo === 'amex') return 'Cartão';
    return 'Outro';
  };

  const handleDeletePedido = async (pedidoId, index) => {
    if (!window.confirm(`Tem certeza que deseja apagar o Pedido #${index + 1}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('auth-token');
      const res = await fetch(`${API_URL}/users/admin/delete-pedido/${user._id}/${pedidoId}`, {
        method: 'DELETE',
        headers: { 'auth-token': token }
      });

      const data = await res.json();

      if (data.success) {
        alert('Pedido removido com sucesso!');
        // Atualizar estado local
        setUser(prev => ({
          ...prev,
          historico: prev.historico.filter(p => p._id !== pedidoId)
        }));
      } else {
        alert(data.error || 'Erro ao remover pedido');
      }
    } catch (err) {
      console.error('Erro:', err);
      alert('Erro ao remover pedido');
    }
  };

  const handleClearHistorico = async () => {
    if (!window.confirm('Tem certeza que deseja apagar TODO o seu histórico de compras?')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth-token');
      const res = await fetch(`${API_URL}/users/admin/clear-historico/${user._id}`, {
        method: 'DELETE',
        headers: { 'auth-token': token }
      });

      const data = await res.json();

      if (data.success) {
        alert('Histórico apagado com sucesso!');
        setUser(prev => ({ ...prev, historico: [] }));
      } else {
        alert(data.error || 'Erro ao apagar histórico');
      }
    } catch (err) {
      console.error('Erro:', err);
      alert('Erro ao apagar histórico');
    }
  };

  if (loading) {
    return (
      <div className="perfil-page">
        <div style={{ paddingTop: '92px' }}></div>
        <p className="perfil-loading">Carregando perfil...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="perfil-page">
        <div style={{ paddingTop: '92px' }}></div>
        <p className="perfil-loading">Erro ao carregar perfil.</p>
      </div>
    );
  }

  return (
    <div className="perfil-page">
      <div style={{ paddingTop: '92px' }}></div>
      <div className="perfil-card">
        <div className="perfil-top">
          <div className="perfil-avatar-wrapper">
            <img
              src={imagePreview || 'https://i.pravatar.cc/150?u=default'}
              alt="Foto de perfil"
              className="perfil-avatar"
              onError={(e) => {
                e.target.src = 'https://i.pravatar.cc/150?u=default';
              }}
            />
            {editing && (
              <label className="perfil-avatar-edit">
                📷
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>
          
          {editing ? (
            <div className="perfil-dados-edit">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Nome"
                className="perfil-input"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email"
                className="perfil-input"
              />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Nova senha (deixe em branco para manter)"
                className="perfil-input"
              />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirmar nova senha"
                className="perfil-input"
              />
              <small>Membro desde: {formatDate(user.date)}</small>
            </div>
          ) : (
            <div className="perfil-dados">
              <h2>{user.name}</h2>
              <p>{user.email}</p>
              <small>Membro desde: {formatDate(user.date)}</small>
            </div>
          )}
        </div>

        <div className="perfil-botoes">
          {editing ? (
            <>
              <button onClick={handleSave} disabled={saving}>
                {saving ? '⏳ Salvando...' : '💾 Salvar'}
              </button>
              <button onClick={handleCancel} disabled={saving}>❌ Cancelar</button>
            </>
          ) : (
            <>
              <button onClick={handleEdit}>✏️ Editar</button>
              <button onClick={handleLogout}>🚪 Sair</button>
              <button onClick={handleGoToCart}>🛒 Carrinho</button>
            </>
          )}
        </div>

        <div className="perfil-historico">
          <div className="historico-header">
            <h3>🧾 Histórico de Compras</h3>
            {user.isAdmin && user.historico && user.historico.length > 0 && (
              <button onClick={handleClearHistorico} className="btn-clear-historico">
                🗑️ Limpar Todo Histórico
              </button>
            )}
          </div>

          {user.historico && user.historico.length > 0 ? (
            <div className="compras-grid">
              {user.historico.map((pedido, index) => (
                <div key={pedido._id || index} className="compra-card">
                  <div className="compra-info">
                    <div className="compra-header">
                      <strong>Pedido #{index + 1}</strong>
                      <div className="payment-method">
                        <span className="payment-icon">{getPaymentIcon(pedido.payment_method)}</span>
                        <span className="payment-label">{getPaymentLabel(pedido.payment_method)}</span>
                      </div>
                      <span className={`status-badge status-${pedido.status?.toLowerCase()}`}>
                        {pedido.status || 'Pendente'}
                      </span>
                    </div>

                    {user.isAdmin && (
                      <button 
                        onClick={() => handleDeletePedido(pedido._id, index)} 
                        className="btn-delete-pedido"
                      >
                        ❌ Apagar Pedido
                      </button>
                    )}

                    <small>{formatDate(pedido.data)}</small>
                    <span className="compra-total">Total: {formatBRL(pedido.total)}</span>
                    
                    {pedido.endereco && (
                      <small className="compra-endereco">
                        📍 Entrega: {pedido.endereco.rua}, {pedido.endereco.numero} 
                        {pedido.endereco.complemento && ` - ${pedido.endereco.complemento}`}
                        <br />
                        {pedido.endereco.cidade}/{pedido.endereco.estado} - CEP: {pedido.endereco.cep}
                      </small>
                    )}
                    
                    <div className="compra-itens">
                      <strong>Itens:</strong>
                      <ul>
                        {pedido.itens?.map((item, i) => (
                          <li key={i}>
                            {item.image && (
                              <img src={item.image} alt={item.name} className="item-img-thumb" />
                            )}
                            <div>
                              {item.name || `Produto ${item.id}`}
                              <br />
                              <small>
                                Quantidade: {item.qty} | Tamanho: {item.size} | Cor: {item.color}
                              </small>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="perfil-vazio">Você ainda não comprou nenhum produto.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Perfil;