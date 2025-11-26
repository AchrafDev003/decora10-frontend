// src/main.jsx o src/index.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import AppContent from "./App.jsx";

import { AuthProvider } from "./Context/AuthContext";
import { CartProvider } from "./Context/Carrito/CartContext";

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import './App.css';
import 'aos/dist/aos.css';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* AuthProvider primero para manejar user y token */}
    <AuthProvider>
      {/* CartProvider escucha cambios en user y sincroniza automáticamente guestCart */}
      <CartProvider>
        <Router>
          <AppContent />
        </Router>
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);
