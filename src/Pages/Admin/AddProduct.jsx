import { BASE_URL } from '../../config';
import React, { useState } from 'react';
import './CSS/AddProduct.css';

const AddProduct = () => {
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [product, setProduct] = useState({
    name: '',
    category: 'tenis',
    new_price: '',
    old_price: '',
    drop_id: '',
    drop_start: '',
    drop_end: '',
    sizes: '',
    colors: ''
  });

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);

    const previewUrls = files.map(file => URL.createObjectURL(file));
    setPreviews(previewUrls);
  };

  const handleSubmit = async () => {
    if (
      images.length === 0 ||
      !product.name ||
      !product.new_price ||
      !product.old_price ||
      !product.drop_id
    ) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const formData = new FormData();
    images.forEach((img, i) => {
      formData.append('product_images', img);
    });

  const uploadRes = await fetch(`${BASE_URL}/upload/upload-multiple`, {
      method: 'POST',
      body: formData
    });

    const uploadData = await uploadRes.json();
    if (!uploadData.success) {
      alert('Erro ao fazer upload das imagens');
      return;
    }

    const productData = {
      ...product,
      images: uploadData.image_urls, // array de URLs
      sizes: product.sizes.split(',').map(s => s.trim()),
      colors: product.colors.split(',').map(c => c.trim())
    };

  const res = await fetch(`${BASE_URL}/products/addproduct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });

    const result = await res.json();
    if (result.success) {
      alert('Produto cadastrado com sucesso!');
      setProduct({
        name: '',
        category: 'tenis',
        new_price: '',
        old_price: '',
        drop_id: '',
        drop_start: '',
        drop_end: '',
        sizes: '',
        colors: ''
      });
      setImages([]);
      setPreviews([]);
    } else {
      alert('Erro ao cadastrar produto');
    }
  };

  return (
    <div className="add-product">
      <h2>Adicionar Produto</h2>

      <input type="text" name="name" placeholder="Nome" value={product.name} onChange={handleChange} />
      <input type="text" name="old_price" placeholder="Preço original" value={product.old_price} onChange={handleChange} />
      <input type="text" name="new_price" placeholder="Preço com desconto" value={product.new_price} onChange={handleChange} />

      <select name="category" value={product.category} onChange={handleChange}>
        <option value="tenis">Tênis</option>
        <option value="camisas">Camisas</option>
        <option value="acessorios">Acessórios</option>
      </select>

      <input type="text" name="sizes" placeholder="Tamanhos (ex: 38,39,40)" value={product.sizes} onChange={handleChange} />
      <input type="text" name="colors" placeholder="Cores (ex: Preto,Branco)" value={product.colors} onChange={handleChange} />

      <input type="text" name="drop_id" placeholder="ID do Drop" value={product.drop_id} onChange={handleChange} />
      <input type="datetime-local" name="drop_start" value={product.drop_start} onChange={handleChange} />
      <input type="datetime-local" name="drop_end" value={product.drop_end} onChange={handleChange} />

      <input type="file" multiple onChange={handleImages} />
      <div className="preview-gallery">
        {previews.map((src, i) => (
          <img key={i} src={src} alt={`Preview ${i}`} className="preview-img" />
        ))}
      </div>

      <button onClick={handleSubmit}>Cadastrar Produto</button>
    </div>
  );
};

export default AddProduct;
