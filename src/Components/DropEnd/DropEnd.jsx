import React, { useEffect, useState } from 'react';
import './DropEnd.css';

const DropEnd = () => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [encerrado, setEncerrado] = useState(false);
  const [prevTime, setPrevTime] = useState(null);

  useEffect(() => {
    const buscarDropMaisProximoDoFim = async () => {
      try {
        const res = await fetch('http://localhost:4000/products/allproducts');
        const data = await res.json();

        if (Array.isArray(data)) {
          const agora = new Date();
          const dropsFuturos = data.filter(p => p.drop_end && new Date(p.drop_end) > agora);

          if (dropsFuturos.length > 0) {
            const maisProximo = dropsFuturos.reduce((prev, curr) => {
              const prevDate = new Date(prev.drop_end);
              const currDate = new Date(curr.drop_end);
              return currDate < prevDate ? curr : prev;
            });

            const dataFim = new Date(maisProximo.drop_end);

            const atualizarTempo = () => {
              const agora = new Date();
              const diffMs = dataFim - agora;

              if (diffMs <= 0) {
                setEncerrado(true);
                setTimeLeft(null);
                return;
              }

              const novoTempo = {
                dias: Math.floor(diffMs / (1000 * 60 * 60 * 24)),
                horas: Math.floor((diffMs / (1000 * 60 * 60)) % 24),
                minutos: Math.floor((diffMs / 1000 / 60) % 60),
                segundos: Math.floor((diffMs / 1000) % 60)
              };

              // Trigger flip animation quando mudar
              if (prevTime) {
                Object.keys(novoTempo).forEach(key => {
                  if (prevTime[key] !== novoTempo[key]) {
                    const elem = document.querySelector(`[data-timer="${key}"]`);
                    if (elem) {
                      elem.classList.add('flip');
                      setTimeout(() => elem.classList.remove('flip'), 600);
                    }
                  }
                });
              }

              setPrevTime(novoTempo);
              setTimeLeft(novoTempo);
            };

            atualizarTempo();
            const intervalo = setInterval(atualizarTempo, 1000);
            return () => clearInterval(intervalo);
          } else {
            setEncerrado(true);
          }
        }
      } catch (err) {
        console.error("Erro ao buscar drops:", err);
      }
    };

    buscarDropMaisProximoDoFim();
  }, []);

  return (
    <div className="drop-end">
      <h2>Este drop termina em:</h2>
      {!encerrado && timeLeft ? (
        <div className="drop-end-timer">
          <div><span data-timer="dias">{timeLeft.dias}</span><p>Dias</p></div>
          <div><span data-timer="horas">{timeLeft.horas}</span><p>Horas</p></div>
          <div><span data-timer="minutos">{timeLeft.minutos}</span><p>Min</p></div>
          <div><span data-timer="segundos">{timeLeft.segundos}</span><p>Seg</p></div>
        </div>
      ) : (
        <p className="drop-end-encerrado">Drop encerrado — aguarde o próximo!</p>
      )}
    </div>
  );
};

export default DropEnd;
