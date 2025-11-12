import React from 'react';
import './Breadcrum.css';

const Breadcrum = ({ product }) => {
  if (!product || !product.category || !product.name) return null;

  return (
    <div className="breadcrum">
      <div style={{ paddingTop: '92px' }}></div><div style={{ paddingTop: '92px' }}></div>
      Home / {product.category} / {product.name}
    </div>
  );
};

export default Breadcrum;
