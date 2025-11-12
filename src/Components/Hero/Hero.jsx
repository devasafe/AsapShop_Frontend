import React from 'react';
import './Hero.css';
import hand_icon from '../Assets/hand_icon.png';
import arrow_icon from '../Assets/arrow.png';
import hero_image from '../Assets/hero_image.png';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className='hero'>
      <div className="hero-left">
        <h2 className="hero-subtitle">VOCÊ SABE O QUE VESTIR</h2>
        
        <div className="hero-text-wrapper">
          <p className="hero-text">Novo</p>
          
          <div className="hero-hand-icon">
            <div className="typing-drop">
              <span className="typing-text">drop</span>
            </div>
            <img src={hand_icon} alt="hand icon" />
          </div>
          
          <p className="hero-text">disponível</p>
        </div>
        
        <Link to="/produtos" className="hero-latest-btn">
          <span>Último Lançamento</span>
          <img src={arrow_icon} alt="arrow" />
        </Link>
      </div>

      <div className="hero-right">
        <img src={hero_image} alt="hero" />
      </div>
    </div>
  );
};

export default Hero;
