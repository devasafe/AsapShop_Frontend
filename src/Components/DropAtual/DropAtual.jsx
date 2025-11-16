import { BASE_URL } from '../../config';
import React, { useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useNavigate } from 'react-router-dom';
import './DropAtual.css';

const DropAtual = () => {
  const [produtos, setProdutos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
  fetch(`${BASE_URL}/products/allproducts`)
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

  return (
    <div className="drop-atual-container">
      <div className="drop-header">
        <span className="drop-atual-eyebrow">Edição Limitada</span>
        <h2 className="drop-atual-heading">
          Drop <span className="drop-atual-heading-accent">atual</span>
        </h2>
        <p className="drop-atual-subtitle">
          Peças únicas disponíveis por tempo limitado. Não perca.
        </p>
      </div>

      <div className="embla" ref={emblaRef}>
        <div className="embla__viewport">
          <div className="embla__container">
            {produtos.map((p, i) => {
              const desconto = p.old_price
                ? Math.round(((p.old_price - p.new_price) / p.old_price) * 100)
                : 0;

              return (
                <div className="embla__slide" key={i} onClick={() => handleClick(p)}>
                  <div className="drop-atual-card">
                    <div className="drop-atual-img-container">
                      <img src={p.images?.[0]} alt={p.name} className="drop-atual-img" />
                      
                      <div className="drop-status-badge">
                        <span className="status-dot"></span>
                        <span className="status-text">Disponível</span>
                      </div>

                      {desconto > 0 && (
                        <div className="drop-discount-badge">-{desconto}%</div>
                      )}
                    </div>

                    <div className="drop-atual-content">
                      <h3 className="drop-atual-name">{p.name}</h3>

                      <div className="drop-price-container">
                        <span className="drop-atual-new-price">
                          R$ {p.new_price}
                        </span>
                        {p.old_price && (
                          <span className="drop-atual-old-price">
                            R$ {p.old_price}
                          </span>
                        )}
                      </div>

                      <button className="drop-cta-button">
                        <span>Ver Detalhes</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DropAtual;
