import { BASE_URL } from '../config';
import React, { useState } from 'react';
import './CSS/Contato.css';

const Contato = () => {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    assunto: '',
    mensagem: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
  const res = await fetch(`${BASE_URL}/email/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      
      if (data.success) {
        alert('Mensagem enviada com sucesso!');
        setForm({ nome: '', email: '', assunto: '', mensagem: '' });
      } else {
        alert('Erro ao enviar mensagem.');
      }
    } catch (err) {
      alert('Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contato-page">
      <div style={{ paddingTop: '92px' }}></div>
      <div className="contato-container">
        <h1 className="contato-titulo">📬 Fale com a AsapStore</h1>
        <p className="contato-subtitulo">Dúvidas, sugestões ou parcerias? Manda pra gente!</p>

        <form className="contato-form" onSubmit={handleSubmit}>
          <input type="text" name="nome" placeholder="Seu nome" value={form.nome} onChange={handleChange} required disabled={loading} />
          <input type="email" name="email" placeholder="Seu e-mail" value={form.email} onChange={handleChange} required disabled={loading} />
          <select name="assunto" value={form.assunto} onChange={handleChange} required disabled={loading}>
            <option value="">Assunto</option>
            <option value="duvida">Dúvida</option>
            <option value="pedido">Pedido</option>
            <option value="parceria">Parceria</option>
            <option value="outro">Outro</option>
          </select>
          <textarea name="mensagem" placeholder="Sua mensagem" value={form.mensagem} onChange={handleChange} required disabled={loading} />
          
          <button type="submit" disabled={loading} className={loading ? 'loading' : ''}>
            {loading ? (
              <>
                <span className="spinner"></span>
                <span>Enviando...</span>
              </>
            ) : (
              'Enviar mensagem'
            )}
          </button>
        </form>

        <div className="contato-info">
          <h2>📞 Outras formas de contato</h2>
          <p><strong>Email:</strong> contato@asapstore.shop </p>
          <p><strong>WhatsApp:</strong> (22) 99201-0218 </p>
          <p><strong>Atendimento:</strong> 24h </p>
        </div>
      </div>
    </div>
  );
};

export default Contato;
