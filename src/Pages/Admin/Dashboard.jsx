import React, { useEffect, useState } from 'react';
import './CSS/Dashboard.css';

const Dashboard = () => {
  const [produtos, setProdutos] = useState([]);
  const [filtroDrop, setFiltroDrop] = useState('');
  const [dropsAtivos, setDropsAtivos] = useState({});
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editDropStart, setEditDropStart] = useState('');
  const [editDropEnd, setEditDropEnd] = useState('');
  const [coupons, setCoupons] = useState([]);
  const [newCoupon, setNewCoupon] = useState({ 
    code: '', 
    discount: '',
    tipo: 'percentual' // ✅ Valor padrão correto
  });

  useEffect(() => {
    fetch('http://localhost:4000/products/allproducts')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProdutos(data);
          const ativos = {};
          data.forEach(p => {
            if (p.drop_id) {
              if (!(p.drop_id in ativos)) ativos[p.drop_id] = p.available;
              else ativos[p.drop_id] = ativos[p.drop_id] || p.available;
            }
          });
          setDropsAtivos(ativos);
        }
      });

    fetch('http://localhost:4000/coupons/allcoupons')
      .then(res => res.json())
      .then(data => {
        // ✅ CORRIGIDO: verifica se data.success existe e usa data.coupons
        if (data.success && Array.isArray(data.coupons)) {
          setCoupons(data.coupons);
        } else if (Array.isArray(data)) {
          setCoupons(data);
        }
      });
  }, []);

  useEffect(() => {
    if (filtroDrop) {
      const produtosDoDrop = produtos.filter(p => p.drop_id === filtroDrop);
      if (produtosDoDrop.length > 0) {
        const { drop_start, drop_end } = produtosDoDrop[0];
        setEditDropStart(drop_start ? drop_start.slice(0, 16) : '');
        setEditDropEnd(drop_end ? drop_end.slice(0, 16) : '');
      }
    } else {
      setEditDropStart('');
      setEditDropEnd('');
    }
  }, [filtroDrop, produtos]);

  const produtosFiltrados = filtroDrop
    ? produtos.filter(p => p.drop_id === filtroDrop)
    : produtos;

  const categorias = [...new Set(produtos.map(p => p.category).filter(Boolean))];
  const drops = [...new Set(produtos.map(p => p.drop_id).filter(Boolean))];

  const toggleDrop = async (dropId) => {
    const statusAtual = dropsAtivos[dropId];
    const novoStatus = !statusAtual;

    const res = await fetch('http://localhost:4000/products/toggleDropAvailable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drop_id: dropId, available: novoStatus })
    });

    const result = await res.json();
    if (result.success) {
      const atualizados = produtos.map(p =>
        p.drop_id === dropId ? { ...p, available: novoStatus } : p
      );
      setProdutos(atualizados);
      setDropsAtivos(prev => ({ ...prev, [dropId]: novoStatus }));
    }
  };

  const salvarDatasDrop = async () => {
    const res = await fetch('http://localhost:4000/products/updatedropdates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        drop_id: filtroDrop,
        drop_start: editDropStart,
        drop_end: editDropEnd
      })
    });

    const result = await res.json();
    if (result.success) {
      const atualizados = produtos.map(p =>
        p.drop_id === filtroDrop
          ? { ...p, drop_start: editDropStart, drop_end: editDropEnd }
          : p
      );
      setProdutos(atualizados);
      alert("Datas atualizadas com sucesso!");
    }
  };

  const abrirEdicao = (produto) => {
    setProdutoEditando(produto);
    setEditName(produto.name);
    setEditPrice(produto.new_price);
    setEditStock(produto.stock ?? 0);
  };

  const salvarEdicao = async () => {
    const res = await fetch('http://localhost:4000/products/updateproduct', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: produtoEditando.id,
        name: editName,
        new_price: editPrice,
        stock: editStock
      })
    });

    const result = await res.json();
    if (result.success) {
      const atualizados = produtos.map(p =>
        p.id === produtoEditando.id
          ? { ...p, name: editName, new_price: editPrice, stock: editStock }
          : p
      );
      setProdutos(atualizados);
      setProdutoEditando(null);
    }
  };

  const salvarEstoqueDireto = async (produtoId, novoEstoque) => {
    const res = await fetch('http://localhost:4000/products/updateproduct', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: produtoId, stock: novoEstoque })
    });

    const result = await res.json();
    if (result.success) {
      const atualizados = produtos.map(p =>
        p.id === produtoId ? { ...p, stock: novoEstoque } : p
      );
      setProdutos(atualizados);
    } else {
      alert('Erro ao atualizar estoque');
    }
  };

  const deletarProduto = async (id) => {
    const confirmar = window.confirm("Tem certeza que deseja deletar?");
    if (!confirmar) return;

    const res = await fetch('http://localhost:4000/products/removeproduct', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });

    const result = await res.json();
    if (result.success) {
      setProdutos(produtos.filter(p => p.id !== id));
    }
  };

  // ✅ CORRIGIDO: Função de adicionar cupom
  const adicionarCupom = async () => {
    if (!newCoupon.code || !newCoupon.discount) {
      return alert("Preencha os campos");
    }

    const cupomData = {
      codigo: newCoupon.code.toUpperCase(),
      tipo: newCoupon.tipo, // ✅ USA O TIPO SELECIONADO ('percentual' ou 'fixo')
      valor: Number(newCoupon.discount)
    };

    try {
      const res = await fetch('http://localhost:4000/coupons/addcoupon', {
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

  const removerCupom = async (id) => {
    if (!window.confirm('Deseja remover este cupom?')) return;

    try {
      const res = await fetch(`http://localhost:4000/coupons/removercupom/${id}`, {
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

  return (
    <div className="dashboard-admin">
      <h2>Dashboard de Gerenciamento</h2>

      <div className="dashboard-cards">
        <div className="card"><h3>Total de Produtos</h3><p>{produtos.length}</p></div>
        <div className="card"><h3>Categorias</h3><p>{categorias.length}</p></div>
        <div className="card"><h3>Drops únicos</h3><p>{drops.length}</p></div>
      </div>

      <div className="drop-controle">
        <label>Selecionar Drop:</label>
        <select value={filtroDrop} onChange={(e) => setFiltroDrop(e.target.value)}>
          <option value="">Todos</option>
          {drops.map((d, i) => <option key={i} value={d}>{d}</option>)}
        </select>

        {filtroDrop && (
          <>
            <button
              className={dropsAtivos[filtroDrop] ? 'inativo' : 'ativo'}
              onClick={() => toggleDrop(filtroDrop)}
            >
              {dropsAtivos[filtroDrop] ? 'Inativar Drop' : 'Ativar Drop'}
            </button>

            <div className="drop-datas">
              <label>Início do Drop:</label>
              <input type="datetime-local" value={editDropStart} onChange={(e) => setEditDropStart(e.target.value)} />
              <label>Fim do Drop:</label>
              <input type="datetime-local" value={editDropEnd} onChange={(e) => setEditDropEnd(e.target.value)} />
              <button onClick={salvarDatasDrop}>Salvar Datas</button>
            </div>
          </>
        )}
      </div>

      <table className="dashboard-tabela">
        <thead>
          <tr>
            <th>Imagem</th>
            <th>Nome</th>
            <th>Categoria</th>
            <th>Preço</th>
            <th>Estoque</th>
            <th>Drop</th>
            <th>Ativo</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {produtosFiltrados.map((p, i) => (
            <tr key={i}>
              <td>
                {p.images && p.images[0] ? (
                  <img src={p.images[0]} alt={p.name} className="img-mini" />
                ) : p.image ? (
                  <img src={p.image} alt={p.name} className="img-mini" />
                ) : (
                  '—'
                )}
              </td>
              <td>{p.name}</td>
              <td>{p.category}</td>
              <td>{p.new_price ? `R$ ${p.new_price}` : '—'}</td>
              <td>
                <input
                  type="number"
                  value={p.stock ?? 0}
                  onChange={(e) => {
                    const novoEstoque = Number(e.target.value);
                    const atualizados = produtos.map(prod =>
                      prod.id === p.id ? { ...prod, stock: novoEstoque } : prod
                    );
                    setProdutos(atualizados);
                  }}
                  onBlur={(e) => salvarEstoqueDireto(p.id, Number(e.target.value))}
                  className="estoque-input"
                />
              </td>
              <td>{p.drop_id || '—'}</td>
              <td>{p.available ? 'Sim' : 'Não'}</td>
              <td>
                <button className="editar-btn" onClick={() => abrirEdicao(p)}>Editar</button>
                <button className="deletar-btn" onClick={() => deletarProduto(p.id)}>Deletar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {produtoEditando && (
        <div className="modal-edicao">
          <h3>Editar Produto</h3>
          <p><strong>Estoque atual:</strong> {produtoEditando?.stock ?? 0} peça(s)</p>

          <label>Nome:</label>
          <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} />

          <label>Novo Preço:</label>
          <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />

          <label>Estoque:</label>
          <input type="number" value={editStock} onChange={(e) => setEditStock(e.target.value)} />

          <div className="modal-botoes">
            <button onClick={salvarEdicao}>Salvar</button>
            <button onClick={() => setProdutoEditando(null)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* ✅ SEÇÃO DE CUPONS MELHORADA */}
      <div className="cupons-section" style={{ marginTop: '40px', padding: '24px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '20px' }}>Gerenciar Cupons</h3>
        
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Código (ex: NATAL10)"
            value={newCoupon.code}
            onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
            style={{ flex: '1', minWidth: '200px', padding: '10px', fontSize: '14px', border: '1px solid #ced4da', borderRadius: '6px' }}
          />
          
          <select
            value={newCoupon.tipo}
            onChange={(e) => setNewCoupon({ ...newCoupon, tipo: e.target.value })}
            style={{ padding: '10px', fontSize: '14px', border: '1px solid #ced4da', borderRadius: '6px', backgroundColor: 'white' }}
          >
            <option value="percentual">Percentual (%)</option>
            <option value="fixo">Valor Fixo (R$)</option>
          </select>
          
          <input
            type="number"
            placeholder={newCoupon.tipo === 'percentual' ? '% desconto' : 'R$ desconto'}
            value={newCoupon.discount}
            onChange={(e) => setNewCoupon({ ...newCoupon, discount: e.target.value })}
            style={{ width: '140px', padding: '10px', fontSize: '14px', border: '1px solid #ced4da', borderRadius: '6px' }}
          />
          
          <button 
            onClick={adicionarCupom}
            style={{ padding: '10px 24px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
          >
            Adicionar
          </button>
        </div>

        <ul style={{ listStyle: 'none', padding: 0 }}>
          {coupons.map((c) => (
            <li key={c._id} className="cupom-card-inline">
              <div className="cupom-info">
                <strong className="cupom-codigo">{c.codigo}</strong>
                <span className="cupom-valor">
                  {c.tipo === 'percentual' ? `${c.valor}%` : `R$ ${c.valor.toFixed(2)}`}
                </span>
                <span className="cupom-tipo">
                  ({c.tipo === 'percentual' ? 'Percentual' : 'Fixo'})
                </span>
                <span className={`cupom-status ${c.ativo ? 'ativo' : 'inativo'}`}>
                  {c.ativo ? '✓ Ativo' : '✗ Inativo'}
                </span>
              </div>
              <button 
                onClick={() => removerCupom(c._id)}
                className="cupom-remover"
              >
                Remover
              </button>
            </li>
          ))}
        </ul>

        {coupons.length === 0 && (
          <p style={{ textAlign: 'center', color: '#6c757d', padding: '20px' }}>
            Nenhum cupom cadastrado
          </p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;