import React, { useState, useContext, useEffect, useRef } from 'react';
import './Navbar.css';
import logo from '../Assets/logo.png';
import cart_icon from '../Assets/cart_icon.png';
import nav_dropdown from '../Assets/nav_dropdown.png';
import { Link } from 'react-router-dom';
import { ShopContext } from '../../Context/ShopContext';

const API_URL = process.env.REACT_APP_API_URL || 'https://asapshop-backend.onrender.com';

const Navbar = () => {
  const [menu, setMenu] = useState('inicio');
  const [userImage, setUserImage] = useState('https://i.pravatar.cc/40?u=default');
  const { getTotalCartItems } = useContext(ShopContext);
  const menuRef = useRef();

  const dropdown_toggle = (e) => {
    if (menuRef.current) {
      menuRef.current.classList.toggle('nav-menu-visible');
    }
    e.target.classList.toggle('open');
  };

  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    
    if (!token) {
      console.log('⚠️ Nenhum token encontrado');
      return;
    }

    console.log('🔍 Buscando dados do usuário...');
    console.log('🔗 URL da API:', `${API_URL}/users/getuser`);

    fetch(`${API_URL}/users/getuser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': token,
        'Authorization': `Bearer ${token}`
      }
    })
      .then(async (res) => {
        console.log('📡 Status da resposta:', res.status);
        const text = await res.text();
        
        if (!res.ok) {
          throw new Error(text || `Erro ${res.status}`);
        }
        
        return text ? JSON.parse(text) : {};
      })
      .then((data) => {
        console.log('✅ Dados recebidos:', data);
        
        if (data?.success && data?.user) {
          console.log('👤 Usuário:', data.user.name);
          console.log('🖼️ URL da imagem:', data.user.image);
          
          if (data.user.image) {
            setUserImage(data.user.image);
            console.log('✅ Imagem do usuário atualizada');
          } else {
            console.log('⚠️ Usuário sem imagem, usando padrão');
          }
        } else {
          console.log('❌ Resposta inválida:', data);
        }
      })
      .catch((err) => {
        console.error('❌ Erro ao buscar usuário:', err);
        console.error('📝 Detalhes:', err.message);
      });
  }, []);

  const handleLogout = () => {
    console.log('🚪 Fazendo logout...');
    localStorage.removeItem('auth-token');
    localStorage.removeItem('userId');
    window.location.replace('/');
  };

  return (
    <div className="navbar">
      <div className="nav-logo">
        <img src={logo} alt="Logo" />
        <p>AsapStore</p>
      </div>

      <img 
        className="nav-dropdown nav-dropdown-bg" 
        onClick={dropdown_toggle} 
        src={nav_dropdown} 
        alt="Menu" 
      />

      <ul ref={menuRef} className="nav-menu">
        {/* Carrinho só dentro do menu hamburguer/mobile */}
        {localStorage.getItem('auth-token') && (
          <li className="nav-cart-mobile">
            <Link to="/cart" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src={cart_icon} alt="Carrinho" className="nav-cart-img" style={{ width: 32, height: 32 }} />
              <span>Carrinho</span>
              <div className="nav-cart-count">{getTotalCartItems()}</div>
            </Link>
          </li>
        )}
        {/* Perfil só dentro do menu hamburguer/mobile */}
        {localStorage.getItem('auth-token') && (
          <li className="nav-profile-mobile">
            <Link to="/perfil" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img 
                src={userImage} 
                alt="Perfil" 
                className="nav-profile-img"
                style={{ width: 32, height: 32 }}
                onError={(e) => {
                  e.target.src = 'https://i.pravatar.cc/40?u=default';
                }}
              />
              <span>Perfil</span>
            </Link>
          </li>
        )}
        <li onClick={() => setMenu('inicio')}>
          <Link to="/">Início</Link>
          {menu === 'inicio' && <hr />}
        </li>
        <li onClick={() => setMenu('produtos')}>
          <Link to="/produtos">Produtos</Link>
          {menu === 'produtos' && <hr />}
        </li>
        <li onClick={() => setMenu('historico')}>
          <Link to="/historico">Histórico</Link>
          {menu === 'historico' && <hr />}
        </li>
        <li onClick={() => setMenu('sobre')}>
          <Link to="/sobre">Sobre</Link>
          {menu === 'sobre' && <hr />}
        </li>
        <li onClick={() => setMenu('contato')}>
          <Link to="/contato">Contato</Link>
          {menu === 'contato' && <hr />}
        </li>
        <li onClick={() => setMenu('FAQ')}>
          <Link to="/FAQ">FAQ</Link>
          {menu === 'FAQ' && <hr />}
        </li>
      </ul>

      <div className="nav-login-cart">
        {localStorage.getItem('auth-token') ? (
          <>
            {/* Ícone do perfil desktop */}
            <Link to="/perfil" className="nav-profile-desktop" style={{ alignItems: 'center', gap: 8 }}>
              <img 
                src={userImage} 
                alt="Perfil" 
                className="nav-profile-img"
                style={{ width: 36, height: 36, borderRadius: '50%' }}
                onError={(e) => { e.target.src = 'https://i.pravatar.cc/40?u=default'; }}
              />
              <span>Perfil</span>
            </Link>
            {/* Ícone do carrinho desktop */}
            <Link to="/cart" className="nav-cart-icon" style={{ alignItems: 'center', gap: 8 }}>
              <img src={cart_icon} alt="Carrinho" className="nav-cart-img" style={{ width: 36, height: 36 }} />
              <span>Carrinho</span>
              <div className="nav-cart-count">{getTotalCartItems()}</div>
            </Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">
              <button>Login</button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;