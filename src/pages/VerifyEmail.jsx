// src/pages/VerifyEmail.jsx
import { useEffect, useState, useRef } from "react";
import LoginModal from "../Components/LoginModal";

const VerifyEmail = () => {
  const [message, setMessage] = useState("Verificando tu correo...");
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  // Evita doble ejecución del useEffect en React.StrictMode
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return; // <-- Previene la segunda llamada
    hasFetched.current = true;

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (!token) {
      setMessage("Token no proporcionado");
      setLoading(false);
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/verify-email/${token}`
        );
        const data = await res.json();

        if (res.ok) {
          setMessage(data.message);
        } else {
          setMessage(data.error || "Error al verificar el correo");
        }
      } catch (err) {
        setMessage("Error al verificar el correo");
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, []);

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80vh",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        {loading ? (
          <p>{message}</p>
        ) : (
          <>
            <h1>{message}</h1>
            {message === "Correo verificado exitosamente" && (
              <button
                className="btn btn-outline-light fs-4 p-3 btn-primary btn-sm nav-link-custom"
                onClick={() => setShowLogin(true)}
                style={{ marginTop: "20px" }}
              >
                Abrir login
              </button>
            )}
          </>
        )}
      </div>

      <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
};

export default VerifyEmail;
