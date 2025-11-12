import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import AddProduct from './AddProduct';
import StockControl from './StockControl';
import CouponManager from './CouponManager';
import AdminPedidos from './AdminPedidos';
import GerenciarHistorico from './GerenciarHistorico';
const Admin = () => {
  return (
    <div className="admin-panel" style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ marginLeft: '220px', paddingTop: '92px', width: '100%' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add" element={<AddProduct />} />
          <Route path="/stock" element={<StockControl />} />
          <Route path="/coupons" element={<CouponManager />} />
          <Route path="/getallpedidos" element={<AdminPedidos />} /> {/* ✅ Aqui! */}
          <Route path="/historico" element={<GerenciarHistorico />} />  
        </Routes>
      </div>
    </div>
  );
};

export default Admin;
