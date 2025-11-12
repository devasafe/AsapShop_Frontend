import { useState } from 'react';

const StockControl = () => {
  const [stock, setStock] = useState([]);

  const updateStock = (id, quantity) => {
    setStock((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  return (
    <div>
      <h2>Controle de Estoque</h2>
      {stock.map((item) => (
        <div key={item.id}>
          <p>{item.name}</p>
          <input
            type="number"
            value={item.quantity}
            onChange={(e) => updateStock(item.id, Number(e.target.value))}
          />
        </div>
      ))}
    </div>
  );
};

export default StockControl;
