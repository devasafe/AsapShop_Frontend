import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Navbar from './Components/Navbar/Navbar';
import Footer from './Components/Footer/Footer';
import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute';

import Inicio from './Pages/Inicio';
import Produtos from './Pages/Produtos';
import Product from './Pages/Product';
import Cart from './Pages/Cart';
import LoginSignup from './Pages/LoginSignup';
import Perfil from './Components/Perfil/Perfil';
import Historico from './Pages/Historico';
import Sobre from './Pages/Sobre';
import Contato from './Pages/Contato';
import Faq from './Pages/Faq';
import Checkout from './Pages/Checkout';

import men_banner from './Components/Assets/banner_mens.png';
import women_banner from './Components/Assets/banner_women.png';
import kid_banner from './Components/Assets/banner_kids.png';

import Admin from './Pages/Admin/Admin';
import CheckoutSucesso from './Pages/CheckoutSucesso';
import CheckoutPendente from './Pages/CheckoutPendente';
import PixStatusScreen from './Pages/PixStatusScreen';
import PagamentoCartao from './Pages/PagamentoCartao';
import TermosDeUso from './Pages/Termos';
import PoliticaDePrivacidade from './Pages/Politica';
import Falha from './Pages/Falha';

function App() {
  return (
    <div className="app-wrapper">
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/produtos" element={<Produtos banner={men_banner} category="produtos" />} />
          <Route path="/camisas" element={<Produtos banner={women_banner} category="camisas" />} />
          <Route path="/acessorios" element={<Produtos banner={kid_banner} category="acessorios" />} />
          <Route path="/product" element={<Product />}>
            <Route path="/product/:productId" element={<Product />} />
          </Route>
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<LoginSignup />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/historico" element={<Historico />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/contato" element={<Contato />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/checkout/pendente" element={<CheckoutPendente />} />
          <Route path="/pix/status" element={<PixStatusScreen />} />
          <Route path="/checkout/sucesso" element={<CheckoutSucesso />} />
          <Route path="/pagamento/cartao" element={<PagamentoCartao />} />
          <Route path="/termos-de-uso" element={<TermosDeUso />} />
          <Route path="/politica-de-privacidade" element={<PoliticaDePrivacidade />} /> 
          <Route path="/falha" element={<Falha />} />

          {/* Painel Admin protegido */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;