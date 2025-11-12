import React, { useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useNavigate } from 'react-router-dom';
import './DropsPassados.css';

const DropsPassados = () => {
  const [produtos, setProdutos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
  fetch('https://asapshop-backend.onrender.com/products/allproducts')
      .then(res => res.json())
      .then(data => {
        const agora = new Date();
        const passados = data.filter(p => {
          const dropEnd = p.drop_end ? new Date(p.drop_end) : null;
          return !p.available || (dropEnd && dropEnd < agora);
        });
        setProdutos(passados);
      });
  }, []);

  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      dragFree: true,
      align: 'start',
    },
    [Autoplay({ delay: 1500, stopOnInteraction: false })]
  );

  const handleClick = (produto) => {
    navigate(`/product/${produto.id}`, { state: { produto } });
  };

  if (produtos.length === 0) {
    return null;
  }

  return (
    <div className="drops-passados-container">
      <div className="drops-passados-header">
        <h2 className="drops-passados-heading">
          📦 <span className="drops-passados-heading-accent">Drops Passados</span>
        </h2>
        <p className="drops-passados-subtitle">
          Veja os produtos que já passaram pela AsapStore
        </p>
      </div>

      <div className="embla" ref={emblaRef}>
        <div className="embla__viewport">
          <div className="embla__container">
            {produtos.map((p, i) => (
              <div className="embla__slide" key={i} onClick={() => handleClick(p)}>
                <div className="passado-card">
                  <div className="passado-img-container">
                    <img src={p.images?.[0]} alt={p.name} className="passado-img" />
                    <span className="passado-status-badge">Drop Encerrado</span>
                  </div>
                  
                  <div className="passado-content">
                    <h3 className="passado-name">{p.name}</h3>
                    <div className="passado-price-container">
                      <p className="passado-new-price">R$ {p.new_price}</p>
                      {p.old_price && (
                        <p className="passado-old-price">R$ {p.old_price}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="embla__spacer" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DropsPassados;
