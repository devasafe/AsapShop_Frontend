import { BASE_URL } from '../../config';
import { useEffect, useState } from 'react';
import './CSS/CouponManager.css';

const CouponManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [newCoupon, setNewCoupon] = useState({ 
    code: '', 
    discount: '',
    tipo: 'percentual'
  });

  // Carrega cupons ao iniciar
  useEffect(() => {
  fetch(`${BASE_URL}/coupons/allcoupons`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.coupons)) {
          setCoupons(data.coupons);
        }
      })
      .catch(err => console.error('Erro ao buscar cupons:', err));
  }, []);

  // Adiciona novo cupom
  const addCoupon = async () => {
    if (!newCoupon.code || !newCoupon.discount) {
      alert('Preencha os campos');
      return;
    }

    const cupomData = {
      codigo: newCoupon.code.toUpperCase(),
      tipo: newCoupon.tipo,
      valor: Number(newCoupon.discount)
    };

    try {
  const res = await fetch(`${BASE_URL}/coupons/addcoupon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cupomData)
      });

      const result = await res.json();
      if (result.success) {
        setCoupons([...coupons, result.cupom]);
        setNewCoupon({ code: '', discount: '', tipo: 'percentual' });
        alert('Cupom adicionado com sucesso!');
      } else {
        alert('Erro ao adicionar cupom: ' + result.error);
      }
    } catch (err) {
      console.error('Erro ao adicionar cupom:', err);
      alert('Erro ao adicionar cupom');
    }
  };

  // Remove cupom
  const removeCoupon = async (id) => {
    if (!window.confirm('Deseja remover este cupom?')) return;

    try {
  const res = await fetch(`${BASE_URL}/coupons/removercupom/${id}`, {
        method: 'DELETE'
      });

      const result = await res.json();
      if (result.success) {
        setCoupons(coupons.filter(c => c._id !== id));
        alert('Cupom removido com sucesso!');
      } else {
        alert('Erro ao remover cupom');
      }
    } catch (err) {
      console.error('Erro ao remover cupom:', err);
    }
  };

  // Toggle ativo/inativo
  const toggleStatus = async (id, ativoAtual) => {
    try {
  const res = await fetch(`${BASE_URL}/coupons/cupomstatus/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: !ativoAtual })
      });

      const result = await res.json();
      if (result.success) {
        setCoupons(coupons.map(c => 
          c._id === id ? { ...c, ativo: !ativoAtual } : c
        ));
      }
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    }
  };

  return (
    <div className="admin-content">
      <div className="cupom-page">
        <div className="cupom-container">
          <h1>Gerenciar Cupons</h1>

          <div className="cupom-form">
            <input
              type="text"
              placeholder="Código do cupom (ex: NATAL10)"
              value={newCoupon.code}
              onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
            />
            <select
              value={newCoupon.tipo}
              onChange={(e) => setNewCoupon({ ...newCoupon, tipo: e.target.value })}
            >
              <option value="percentual">Percentual (%)</option>
              <option value="fixo">Valor Fixo (R$)</option>
            </select>
            <input
              type="number"
              placeholder={newCoupon.tipo === 'percentual' ? '% desconto' : 'R$ desconto'}
              value={newCoupon.discount}
              onChange={(e) => setNewCoupon({ ...newCoupon, discount: e.target.value })}
            />
            <button onClick={addCoupon}>Adicionar Cupom</button>
          </div>

          <div className="cupom-lista">
            {coupons.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px' }}>
                Nenhum cupom cadastrado
              </p>
            ) : (
              coupons.map((c) => (
                <div key={c._id} className="cupom-card">
                  <h3>{c.codigo}</h3>
                  <p>
                    <strong>Tipo:</strong> {c.tipo === 'percentual' ? 'Percentual' : 'Valor Fixo'}
                  </p>
                  <p>
                    <strong>Valor:</strong> {c.tipo === 'percentual' ? `${c.valor}%` : `R$ ${c.valor.toFixed(2)}`}
                  </p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <span style={{ 
                      color: c.ativo ? 'var(--gold)' : 'var(--danger)',
                      fontWeight: '700'
                    }}>
                      {c.ativo ? '✓ Ativo' : '✗ Inativo'}
                    </span>
                  </p>
                  <div className="cupom-actions">
                    <button onClick={() => toggleStatus(c._id, c.ativo)}>
                      {c.ativo ? 'Desativar' : 'Ativar'}
                    </button>
                    <button onClick={() => removeCoupon(c._id)}>
                      Remover
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouponManager;
