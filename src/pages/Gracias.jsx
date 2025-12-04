import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Confetti from "react-confetti";
import "../css/Gracias.css";

const Gracias = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [showConfetti, setShowConfetti] = useState(true);

  const orderCode = state?.orderCode || null;

  useEffect(() => {
    window.scrollTo(0, 0); // 🔥 Fuerza a empezar arriba
    const timer = setTimeout(() => setShowConfetti(false), 5000); // Confetti 5s
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="gracias-container d-flex flex-column justify-content-center align-items-center text-center">
      {showConfetti && <Confetti numberOfPieces={500} recycle={false} />}
      
      <h1 className="display-4 text-gradient animate__animated animate__zoomIn mb-3">
        🎉 ¡Gracias por tu compra!
      </h1>

      <p className="fs-5 mb-2 animate__animated animate__fadeInUp">
        Tu pedido ha sido recibido y se está procesando.
      </p>

      {orderCode ? (
        <p className="fs-5 mb-4 animate__animated animate__fadeInUp">
          Tu código de pedido es: <strong>{orderCode}</strong>
        </p>
      ) : (
        <p className="fs-5 mb-4 animate__animated animate__fadeInUp">
          Pronto recibirás la confirmación por correo.
        </p>
      )}

      <button
        className="btn btn-neon btn-lg animate__animated animate__pulse"
        onClick={() => navigate("/tienda")}
      >
        Volver a la Tienda
      </button>
    </div>
  );
};

export default Gracias;
