import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './CSS/Produtos.css';
import DropEnd from '../Components/DropEnd/DropEnd';
import DropNext from '../Components/DropNext/DropNext';

const Produtos = () => {
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
  fetch('https://asapshop-backend.onrender.com/products/allproducts')
      .then(res => res.json())
      .then(data => {
        const agora = new Date();
        const ativos = data.filter(p =>
          p.available &&
          new Date(p.drop_start) <= agora &&
          new Date(p.drop_end) >= agora
        );
        setProdutos(ativos);
      });
  }, []);

  return (
    <div className="produtos-page">
      <div style={{ paddingTop: '92px' }}></div>
      
      <DropEnd />

      <div className="produtos-header">
        <h2 className="produtos-titulo">
          🔥 <span className="produtos-titulo-accent">Drop Atual</span>
        </h2>
        <p className="produtos-subtitulo">
          Confira os itens disponíveis no drop mais recente
        </p>
      </div>

      <div className="produtos-grid">
        {produtos.map((p, i) => (
          <Link to={`/product/${p.id}`} key={i} className="produto-link">
            <div className="produto-card">
              <div className="produto-img-wrapper">
                <img src={p.images?.[0]} alt={p.name} className="produto-img" />
                {!p.available && (
                  <span className="produto-status">Esgotado</span>
                )}
              </div>
              
              <div className="produto-info">
                <h3>{p.name}</h3>
                <div className="produto-price-container">
                  <p className="produto-new-price">R$ {p.new_price}</p>
                  {p.old_price && (
                    <p className="produto-old-price">R$ {p.old_price}</p>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ paddingTop: '92px' }}></div>
      
      <DropNext />
    </div>
  );
};

export default Produtos;
