import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/LoginSignup.css';

const LoginSignup = () => {
  const navigate = useNavigate();
  const [state, setState] = useState("Login");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    confirmEmail: "",
    password: "",
    confirmPassword: "",
    verificationCode: ""
  });
  const [imageFile, setImageFile] = useState(null);
  const [verificationSent, setVerificationSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewURL, setPreviewURL] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const fileInputRef = useRef(null);

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        alert('Imagem muito grande. Máximo: 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Por favor selecione uma imagem válida');
        return;
      }

      setImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewURL(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const sendVerificationCode = async () => {
    const { username, email, password, confirmPassword } = formData;

    if (!username || !email || !password) {
      alert("Preencha nome, email e senha antes de enviar o código.");
      return;
    }

    if (!isValidEmail(email)) {
      alert("Formato de email inválido.");
      return;
    }

    if (password.length < 6) {
      alert("Senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      alert("As senhas não coincidem.");
      return;
    }

    if (!termsAccepted) {
      alert("Você precisa aceitar os termos de uso e política de privacidade.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('http://localhost:4000/users/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setVerificationSent(true);
        alert("Código enviado para seu email. Verifique a caixa de entrada (ou spam).");
      } else {
        alert(data.errors || data.error || "Erro ao enviar código.");
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
      alert("Erro de rede ao enviar código.");
    }
  };

  const login = async () => {
    const { email, password } = formData;
    if (!email || !password) {
      alert("Preencha email e senha.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('http://localhost:4000/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        localStorage.setItem('auth-token', data.token);
        localStorage.setItem('userId', data.user._id);
        window.location.replace("/");
      } else {
        alert(data.errors || "Erro no login.");
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
      alert("Erro de rede.");
    }
  };

  const signup = async () => {
    const {
      username, email, confirmEmail,
      password, confirmPassword,
      verificationCode
    } = formData;

    if (!username || !email || !password || !verificationCode) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    if (!isValidEmail(email)) {
      alert("Formato de email inválido.");
      return;
    }

    if (email !== confirmEmail) {
      alert("Os e-mails não coincidem.");
      return;
    }

    if (password.length < 6) {
      alert("Senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      alert("As senhas não coincidem.");
      return;
    }

    if (!/^\d{6}$/.test(verificationCode)) {
      alert("Código de verificação deve ter 6 dígitos.");
      return;
    }

    if (!termsAccepted) {
      alert("Você precisa aceitar os termos de uso e política de privacidade.");
      return;
    }

    try {
      setLoading(true);
      
      const res = await fetch('http://localhost:4000/users/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode })
      });
      const data = await res.json();

      if (!data.success) {
        setLoading(false);
        alert(data.error || data.errors || "Falha na confirmação.");
        return;
      }

      if (imageFile) {
        const formDataImg = new FormData();
        formDataImg.append('avatar', imageFile);

        await fetch('http://localhost:4000/users/upload-avatar', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${data.token}`
          },
          body: formDataImg
        });
      }

      setLoading(false);
      localStorage.setItem('auth-token', data.token);
      localStorage.setItem('userId', data.user._id);
      window.location.replace("/");

    } catch (err) {
      setLoading(false);
      console.error(err);
      alert("Erro de rede.");
    }
  };

  const handleTermsClick = (e) => {
    e.preventDefault();
    window.open('/termos-de-uso', '_blank');
  };

  const handlePrivacyClick = (e) => {
    e.preventDefault();
    window.open('/politica-de-privacidade', '_blank');
  };

  return (
    <div className='loginsignup'>
      <div className="loginsignup-container">
        <div className="loginsignup-header">
          <h1>{state === "Login" ? "Bem-vindo de volta!" : "Criar Conta"}</h1>
          <p>{state === "Login" ? "Faça login para continuar" : "Preencha os dados para se cadastrar"}</p>
        </div>

        <div className="loginsignup-fields">
          {state === "Sign Up" && (
            <>
              <div className="input-group">
                <label>Nome Completo</label>
                <input
                  name='username'
                  value={formData.username}
                  onChange={changeHandler}
                  type="text"
                  placeholder='Digite seu nome'
                />
              </div>

              <div className="input-group">
                <label>Email</label>
                <input
                  name='email'
                  value={formData.email}
                  onChange={changeHandler}
                  type="email"
                  placeholder='seu@email.com'
                />
              </div>

              <div className="input-group">
                <label>Confirmar Email</label>
                <input
                  name='confirmEmail'
                  value={formData.confirmEmail}
                  onChange={changeHandler}
                  type="email"
                  placeholder='seu@email.com'
                />
              </div>

              <div className="input-group">
                <label>Senha</label>
                <input
                  name='password'
                  value={formData.password}
                  onChange={changeHandler}
                  type="password"
                  placeholder='Mínimo 6 caracteres'
                />
              </div>

              <div className="input-group">
                <label>Confirmar Senha</label>
                <input
                  name='confirmPassword'
                  value={formData.confirmPassword}
                  onChange={changeHandler}
                  type="password"
                  placeholder='Digite a senha novamente'
                />
              </div>

              <div className="image-upload-section">
                <label>Foto de Perfil (Opcional)</label>
                <div className="image-upload-wrapper">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  
                  {previewURL ? (
                    <div className="preview-container">
                      <img src={previewURL} alt="Preview" className="preview-image" />
                      <button 
                        type="button"
                        onClick={triggerFileInput}
                        className="change-photo-btn"
                      >
                        Trocar Foto
                      </button>
                    </div>
                  ) : (
                    <button 
                      type="button"
                      onClick={triggerFileInput}
                      className="upload-btn"
                    >
                      <span className="upload-icon">📷</span>
                      Escolher Foto
                    </button>
                  )}
                </div>
              </div>

              <div className="terms-container">
                <label className="checkbox-container">
                  <input 
                    type="checkbox" 
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  <span className="checkbox-label">
                    Li e concordo com os{' '}
                    <a href="/termos-de-uso" onClick={handleTermsClick}>
                      Termos de Uso
                    </a>
                    {' '}e{' '}
                    <a href="/politica-de-privacidade" onClick={handlePrivacyClick}>
                      Política de Privacidade
                    </a>
                  </span>
                </label>
              </div>

              <div className="verification-section">
                <button 
                  onClick={sendVerificationCode} 
                  disabled={loading}
                  className="verification-btn"
                >
                  {loading ? (
                    <span className="loader"></span>
                  ) : (
                    <>
                      <span className="btn-icon">✉️</span>
                      {verificationSent ? 'Reenviar Código' : 'Enviar Código de Verificação'}
                    </>
                  )}
                </button>
                {verificationSent && (
                  <div className="success-message">
                    ✓ Código enviado! Verifique seu email
                  </div>
                )}
              </div>

              <div className="input-group">
                <label>Código de Verificação</label>
                <input
                  name='verificationCode'
                  value={formData.verificationCode}
                  onChange={changeHandler}
                  type="text"
                  placeholder='000000'
                  maxLength={6}
                  className="verification-input"
                />
              </div>
            </>
          )}
          
          {state === "Login" && (
            <>
              <div className="input-group">
                <label>Email</label>
                <input
                  name='email'
                  value={formData.email}
                  onChange={changeHandler}
                  type="email"
                  placeholder='seu@email.com'
                />
              </div>

              <div className="input-group">
                <label>Senha</label>
                <input
                  name='password'
                  value={formData.password}
                  onChange={changeHandler}
                  type="password"
                  placeholder='Digite sua senha'
                />
              </div>
            </>
          )}
        </div>

        <button 
          onClick={() => state === "Login" ? login() : signup()} 
          disabled={loading}
          className="submit-btn"
        >
          {loading ? <span className="loader"></span> : state === "Login" ? 'Entrar' : 'Criar Conta'}
        </button>

        <div className="switch-mode">
          {state === "Sign Up" ? (
            <p>
              Já tem uma conta?{' '}
              <span onClick={() => { 
                setState("Login"); 
                setVerificationSent(false); 
                setTermsAccepted(false);
                setFormData({
                  username: "",
                  email: "",
                  confirmEmail: "",
                  password: "",
                  confirmPassword: "",
                  verificationCode: ""
                });
              }}>
                Faça login
              </span>
            </p>
          ) : (
            <p>
              Não tem uma conta?{' '}
              <span onClick={() => setState("Sign Up")}>
                Cadastre-se
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;