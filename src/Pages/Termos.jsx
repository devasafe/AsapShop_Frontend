import React from 'react';
import '../Pages/CSS/Termos.css';

const TermosDeUso = () => {
  return (
    <div className="termos-page">
      <div className="termos-container">
        <h1>Termos de Uso</h1>
        <p><strong>Última atualização:</strong> {new Date().toLocaleDateString()}</p>
        
        <section>
          <h2>1. Aceitação dos Termos</h2>
          <p>
            Ao acessar e usar este site, você aceita e concorda em cumprir estes termos e condições de uso.
          </p>
        </section>

        <section>
          <h2>2. Uso do Site</h2>
          <p>
            Este site é destinado apenas para uso pessoal e não comercial. Você concorda em não usar o site para qualquer propósito ilegal.
          </p>
        </section>

        <section>
          <h2>3. Conta de Usuário</h2>
          <p>
            Você é responsável por manter a confidencialidade de sua conta e senha. Concorda em aceitar responsabilidade por todas as atividades que ocorram sob sua conta.
          </p>
        </section>

        <section>
          <h2>4. Compras</h2>
          <p>
            Todos os preços estão sujeitos a alteração sem aviso prévio. Reservamo-nos o direito de recusar qualquer pedido.
          </p>
        </section>

        <section>
          <h2>5. Propriedade Intelectual</h2>
          <p>
            Todo o conteúdo deste site, incluindo textos, gráficos, logos e imagens, é propriedade da ASAP Shop e está protegido por leis de direitos autorais.
          </p>
        </section>

        <section>
          <h2>6. Limitação de Responsabilidade</h2>
          <p>
            Não nos responsabilizamos por quaisquer danos diretos, indiretos, incidentais ou consequenciais resultantes do uso ou incapacidade de usar nosso site.
          </p>
        </section>

        <section>
          <h2>7. Modificações</h2>
          <p>
            Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entrarão em vigor imediatamente após a publicação no site.
          </p>
        </section>

        <section>
          <h2>8. Contato</h2>
          <p>
            Para dúvidas sobre estes termos, entre em contato conosco através do email: contato@asapshop.com
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermosDeUso;