import React from 'react';
import './CSS/Termos.css';

const PoliticaDePrivacidade = () => {
  return (
    <div className="termos-page">
      <div className="termos-container">
        <h1>Política de Privacidade</h1>
        <p><strong>Última atualização:</strong> {new Date().toLocaleDateString()}</p>
        
        <section>
          <h2>1. Informações que Coletamos</h2>
          <p>
            Coletamos informações que você nos fornece diretamente, incluindo nome, email, endereço de entrega e informações de pagamento.
          </p>
        </section>

        <section>
          <h2>2. Como Usamos Suas Informações</h2>
          <ul>
            <li>Processar e entregar seus pedidos</li>
            <li>Enviar confirmações e atualizações de pedidos</li>
            <li>Melhorar nossos produtos e serviços</li>
            <li>Comunicar promoções e ofertas (com seu consentimento)</li>
          </ul>
        </section>

        <section>
          <h2>3. Compartilhamento de Informações</h2>
          <p>
            Não vendemos suas informações pessoais. Compartilhamos apenas com:
          </p>
          <ul>
            <li>Processadores de pagamento para completar transações</li>
            <li>Serviços de entrega para enviar seus produtos</li>
            <li>Prestadores de serviço que nos auxiliam nas operações</li>
          </ul>
        </section>

        <section>
          <h2>4. Segurança dos Dados</h2>
          <p>
            Implementamos medidas de segurança para proteger suas informações contra acesso não autorizado, alteração ou destruição.
          </p>
        </section>

        <section>
          <h2>5. Cookies</h2>
          <p>
            Utilizamos cookies para melhorar sua experiência de navegação e personalizar conteúdo. Você pode desabilitar cookies nas configurações do seu navegador.
          </p>
        </section>

        <section>
          <h2>6. Seus Direitos</h2>
          <p>
            Você tem direito a:
          </p>
          <ul>
            <li>Acessar suas informações pessoais</li>
            <li>Corrigir dados incorretos</li>
            <li>Solicitar exclusão de seus dados</li>
            <li>Revogar consentimento a qualquer momento</li>
          </ul>
        </section>

        <section>
          <h2>7. Menores de Idade</h2>
          <p>
            Nosso site não é direcionado a menores de 18 anos. Não coletamos intencionalmente informações de menores.
          </p>
        </section>

        <section>
          <h2>8. Alterações na Política</h2>
          <p>
            Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas através do email cadastrado.
          </p>
        </section>

        <section>
          <h2>9. Contato</h2>
          <p>
            Para exercer seus direitos ou esclarecer dúvidas, contate-nos em: privacidade@asapshop.com
          </p>
        </section>
      </div>
    </div>
  );
};

export default PoliticaDePrivacidade;