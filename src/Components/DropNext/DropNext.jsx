import { BASE_URL } from '../../config';
import React, { useEffect, useState } from 'react';
import './DropNext.css'; // Certifique-se que esse CSS está importado

const DropNext = () => {
  const [tempoRestante, setTempoRestante] = useState(null);

  useEffect(() => {
    const buscarProximoDrop = async () => {
      try {
  const res = await fetch(`${BASE_URL}/products/allproducts`);
        const data = await res.json();

        if (Array.isArray(data)) {
          const agora = new Date();
          const futuros = data.filter(p => p.drop_start && new Date(p.drop_start) > agora);

          if (futuros.length > 0) {
            const maisProximo = futuros.reduce((prev, curr) => {
              const prevDate = new Date(prev.drop_start);
              const currDate = new Date(curr.drop_start);
              return currDate < prevDate ? curr : prev;
            });

            const dataDrop = new Date(maisProximo.drop_start);

            const atualizarTempo = () => {
              const agora = new Date();
              const diffMs = dataDrop - agora;

              if (diffMs <= 0) {
                setTempoRestante('ready');
                return;
              }

              const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
              const horas = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
              const minutos = Math.floor((diffMs / (1000 * 60)) % 60);
              const segundos = Math.floor((diffMs / 1000) % 60);

              setTempoRestante({ dias, horas, minutos, segundos });
            };

            atualizarTempo();
            const intervalo = setInterval(atualizarTempo, 1000);
            return () => clearInterval(intervalo);
          }
        }
      } catch (err) {
        console.error("Erro ao buscar próximo drop:", err);
      }
    };

    buscarProximoDrop();
  }, []);

  return (
    <div className="drop-next">
      <h2>Próximo Drop</h2>
      {tempoRestante === 'ready' ? (
        <p className="drop-next-ready">O próximo drop já começou!</p>
      ) : tempoRestante ? (
        <div className="drop-next-timer">
          <div>
            <span>{tempoRestante.dias}</span>
            <p>dias</p>
          </div>
          <div>
            <span>{tempoRestante.horas}</span>
            <p>horas</p>
          </div>
          <div>
            <span>{tempoRestante.minutos}</span>
            <p>min</p>
          </div>
          <div>
            <span>{tempoRestante.segundos}</span>
            <p>seg</p>
          </div>
        </div>
      ) : (
        <p className="drop-next-ready">Nenhum drop futuro encontrado.</p>
      )}
    </div>
  );
};

export default DropNext;
