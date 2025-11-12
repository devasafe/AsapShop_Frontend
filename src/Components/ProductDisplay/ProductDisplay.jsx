import React, { useContext, useState } from 'react';
import './ProductDisplay.css';
import { ShopContext } from '../../Context/ShopContext';

const ProductDisplay = ({ product }) => {
  const { addToCart } = useContext(ShopContext);

  const sizes = product?.sizes?.length > 0 ? product.sizes : ['Único'];
  const colors = product?.colors?.length > 0 ? product.colors : ['Padrão'];
  const images = product?.images?.length > 0 ? product.images : [product.image];

  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [mainImage, setMainImage] = useState(images[0]);
  const [adicionado, setAdicionado] = useState(false);

  const handleAddToCart = () => {
    addToCart(product.id, selectedSize, selectedColor);
    setAdicionado(true);
    setTimeout(() => setAdicionado(false), 2000);
  };

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
      </div>
    );
  }

  return (
    <div className='productdisplay'>
      <div className="productdisplay-left">
        <div className="productdisplay-img-list">
          {images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Miniatura ${i + 1}`}
              onClick={() => setMainImage(img)}
              className={mainImage === img ? 'active-thumb' : ''}
            />
          ))}
        </div>
        <div className="productdisplay-img">
          <img className='productdisplay-main-img' src={mainImage} alt="Imagem principal" />
        </div>
      </div>

      <div className="productdisplay-right">
        <p className="productdisplay-right-stock">
          <strong>Estoque disponível:</strong> {product.stock ?? 0} unidade(s)
        </p>

        <h1>{product.name}</h1>

        <div className="productdisplay-right-prices">
          <div className="productdisplay-right-price-old">R$ {product.old_price}</div>
          <div className="productdisplay-right-price-new">R$ {product.new_price}</div>
        </div>

        <div className="productdisplay-right-description">
          {/* Descrição opcional */}
        </div>

        <div className="productdisplay-right-options">
          <div className="productdisplay-right-option">
            <h3>Escolha o tamanho:</h3>
            <div className="productdisplay-right-sizes">
              {sizes.map((size, i) => (
                <div
                  key={i}
                  className={selectedSize === size ? 'active' : ''}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </div>
              ))}
            </div>
          </div>

          <div className="productdisplay-right-option">
            <h3>Escolha a cor:</h3>
            <div className="productdisplay-right-sizes">
              {colors.map((color, i) => (
                <div
                  key={i}
                  className={selectedColor === color ? 'active' : ''}
                  onClick={() => setSelectedColor(color)}
                >
                  {color}
                </div>
              ))}
            </div>
          </div>
        </div>

        {product.stock > 0 && product.available ? (
<button
  onClick={handleAddToCart}
  className={`add-to-cart-button ${adicionado ? 'adicionado' : ''}`}
>
  {adicionado ? '✅ Adicionado ao carrinho' : 'ADICIONAR AO CARRINHO'}
</button>

        ) : (
          <p className="sold-out-msg">❌ SOLD OUT</p>
        )}

        <p className='productdisplay-right-category'>
          <span>Categoria:</span> {product.category}
        </p>

      </div>
    </div>
  );
};

export default ProductDisplay;
