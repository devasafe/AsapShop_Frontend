import React from 'react';
import './Footer.css';
import footer_logo from '../Assets/logo preta.png';
import instagram_icon from '../Assets/instagram_icon.png';
import pintester_icon from '../Assets/pintester_icon.png';
import whatsapp_icon from '../Assets/whatsapp_icon.png';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <img src={footer_logo} alt="AsapSneaks logo" />
          <h3>AsapStore</h3>
        </div>

        <ul className="footer-nav">
          <Link className='link' to="/">Início</Link>
          <Link className='link' to="/produtos">Produtos</Link>
          <Link className='link' to="/historico">Histórico</Link>
          <Link className='link' to="/sobre">Sobre</Link>
          <Link className='link' to="/contato">Contato</Link>
          <Link className='link' to="/FAQ">FAQ</Link>

        </ul>

        <div className="footer-social">
          <a href="https://www.instagram.com/_asapstore_/"><img src={instagram_icon} alt="Instagram" /></a>
          <a href="https://wa.me/5522992010218"><img src={whatsapp_icon} alt="WhatsApp" /></a>
        </div>
      </div>

      <div className="footer-bottom">
        <hr />
        <p>© 2025 AsapStore — Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
