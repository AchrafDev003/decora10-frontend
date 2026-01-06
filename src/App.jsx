import React, { Suspense, lazy, useEffect } from "react";
import { Routes, Route, useLocation,Link} from "react-router-dom";
import { Helmet } from "react-helmet";
import { Toaster } from "react-hot-toast"; // ✅ Añadido
import { trackPage } from "./Hooks/useAnalytics.js";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


<div className="d-flex align-items-center gap-2 mb-3">
  <span role="img" aria-label="Devoluciones" className="fs-4">🔄</span>
  <p className="mb-0 text-muted">
    <Link to="/politica-devoluciones" className="text-decoration-none">
      Política de devoluciones
    </Link>
  </p>
</div>



// src/main.jsx o index.jsx
import 'leaflet/dist/leaflet.css';


// Componentes
import Header from "./Components/Header.jsx";
import Footer from "./Components/Footer.jsx";
import ProtectedRoute from "./Components/ProtectedRoute.jsx";
import CookieConsent from "./Components/CookieConsent.jsx";


// Lazy loading de páginas
const Home = lazy(() => import("./pages/Home.jsx"));
const Shop = lazy(() => import("./pages/Shop.jsx"));
const ProductDetail = lazy(() => import("./pages/ProductDetail.jsx"));
const Cart = lazy(() => import("./pages/Cart.jsx"));
const Checkout = lazy(() => import("./pages/Checkout.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const Register = lazy(() => import("./pages/Register.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));
const Gracias = lazy(() => import("./pages/Gracias.jsx"));
const ColchoneriaPage = lazy(() => import("./pages/ColchoneriaPage.jsx"));
const Contact = lazy(() => import("./pages/Contact.jsx"));
const Privacy = lazy(() => import("./pages/PrivacyPolicy.jsx"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail.jsx"));
const PoliticaDevoluciones = lazy(() => import("./pages/PoliticaDevoluciones.jsx"));


function AppContent() {
  const location = useLocation();

  useEffect(() => {
    trackPage(location.pathname + location.search);
  }, [location]);

  return (
    <>
      <Helmet>
        <title>Decor@10 - Tu tienda de decoración online</title>
        <meta
          name="description"
          content="Compra muebles, decoración y accesorios modernos para tu hogar en Decor@10."
        />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <CookieConsent />
      <Header />

      {/* ✅ Toaster global — visible en toda la app */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#522020",
            color: "#fff",
            fontWeight: 600,
            borderRadius: "8px",
            padding: "12px 18px",
            textAlign: "center",
          },
          duration: 3500,
        }}
      />

      <Suspense fallback={<div className="text-center my-5">Cargando...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tienda" element={<Shop />} />
          <Route path="/producto/:id" element={<ProductDetail />} />
          <Route path="/carrito" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/register" element={<Register />} />
          <Route path="/gracias" element={<Gracias />} />
          <Route path="/politica-privacidad" element={<Privacy />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/politica-devoluciones" element={<PoliticaDevoluciones />} />
          

<Route path="/colchoneria" element={<ColchoneriaPage />} />
              <Route path="/contacto" element={<Contact />} />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      <Footer />
    </>
  );
}

export default AppContent;
