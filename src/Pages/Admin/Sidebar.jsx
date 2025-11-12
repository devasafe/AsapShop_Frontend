import React from 'react';
import { Link } from 'react-router-dom';
import './CSS/Sidebar.css';

const Sidebar = () => {
  return (
    <div className="admin-sidebar">
      <div style={{ paddingTop: '92px' }}></div>
      <h2>Admin</h2>
      <nav>
        <ul>
          <li><Link to="/admin">📊 Dashboard</Link></li>
          <li><Link to="/admin/add">📦 Add Produtos</Link></li>
          <li><Link to="/admin/coupons">🎟️ Cupons</Link></li>
          <li><Link to="/admin/stock">📁 Estoque</Link></li>
          <li><Link to="/admin/getallpedidos">🧾 Pedidos</Link></li>
          <li><Link to="/admin/historico">📋 Históricos</Link></li> {/* ✅ ADICIONAR */}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
