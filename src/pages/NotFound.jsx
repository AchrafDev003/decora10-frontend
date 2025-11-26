// src/Pages/NotFound.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center text-center"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #ff7f50, #000000)",
        color: "#fff",
        padding: "2rem"
      }}
    >
      <h1 style={{ fontSize: "6rem", fontWeight: "bold" }}>404</h1>
      <h2 className="mb-4" style={{ fontSize: "2rem" }}>
        Página no encontrada
      </h2>
      <p className="mb-4" style={{ maxWidth: "500px" }}>
        Lo sentimos, la página que estás buscando no existe o ha sido movida.  
        Verifica la URL o regresa al inicio de la tienda.
      </p>
      <button
        className="btn btn-warning btn-lg"
        onClick={() => navigate("/")}
        style={{ color: "#000", fontWeight: "bold" }}
      >
        Volver al Inicio
      </button>
    </div>
  );
};

export default NotFound;
