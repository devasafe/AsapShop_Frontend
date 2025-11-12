import React, { useContext } from 'react';
import { ShopContext } from '../Context/ShopContext';
import { useParams, Link } from 'react-router-dom';
import Breadcrum from '../Components/Breadcrums/Breadcrum';
import ProductDisplay from '../Components/ProductDisplay/ProductDisplay';
// ...existing code...

const Product = () => {
  const { all_product } = useContext(ShopContext);
  const { productId } = useParams();
  const product = all_product.find((e) => e.id === Number(productId));

  if (!product) {
    return (
      <div style={{
        padding: '100px',
        textAlign: 'center',
        color: '#fff',
        backgroundColor: '#0f0f0f',
        fontFamily: 'Segoe UI, sans-serif'
      }}>
        <h2 style={{ color: '#ffd700' }}>😕 Produto não encontrado</h2>
        <p>Verifique se o link está correto ou volte para a página de produtos.</p>
        <Link to="/produtos" style={{
          display: 'inline-block',
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#ffd700',
          color: '#0f0f0f',
          borderRadius: '6px',
          textDecoration: 'none',
          fontWeight: '600'
        }}>Voltar</Link>
      </div>
    );
  }

  return (
    <div>
      <Breadcrum product={product} />
      <ProductDisplay product={product} />

    </div>
  );
};

export default Product;
