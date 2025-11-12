import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './CSS/Historico.css';

const Historico = () => {
  const [dropsPassados, setDropsPassados] = useState([]);

  useEffect(() => {
    fetch('http://localhost:4000/products/allproducts')
      .then(res => res.json())
      .then(data => {
        const agora = new Date();
        const passados = data.filter(p => {
          const dropEnd = p.drop_end ? new Date(p.drop_end) : null;
          return !p.available || (dropEnd && dropEnd < agora);
        });
        setDropsPassados(passados);
      });
  }, []);

  return (
    <div className="historico-page">
      <div style={{ paddingTop: '92px' }}></div>

      <div className="historico-header">
        <h2 className="historico-titulo">
          📦 <span className="historico-titulo-accent">Drops Passados</span>
        </h2>
        <p className="historico-subtitulo">
          Veja os produtos que já passaram pela AsapStore
        </p>
      </div>

      {dropsPassados.length > 0 ? (
        <div className="historico-grid">
          {dropsPassados.map((p, i) => (
            <Link to={`/product/${p.id}`} key={i} className="historico-link">
              <div className="historico-card">
                <div className="historico-img-wrapper">
                  <img src={p.images?.[0]} alt={p.name} className="historico-img" />
                  <span className="historico-status">Drop Encerrado</span>
                </div>
                
                <div className="historico-info">
                  <h3>{p.name}</h3>
                  <div className="historico-price-container">
                    <p className="historico-new-price">R$ {p.new_price}</p>
                    {p.old_price && (
                      <p className="historico-old-price">R$ {p.old_price}</p>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="historico-vazio">
          <p>Nenhum drop encerrado ainda.</p>
        </div>
      )}
    </div>
  );
};

export default Historico;