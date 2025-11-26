import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../Context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password); // login via AuthContext
      toast.success("¡Bienvenido!");
      navigate("/"); // navegamos solo si login fue exitoso
    } catch (error) {
      toast.error(error.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #ff7f50, #000000)",
      }}
    >
      <div
        className="p-5 rounded-4 shadow-lg"
        style={{
          background: "rgba(255,255,255,0.95)",
          maxWidth: "400px",
          width: "100%",
        }}
      >
        <h2 className="text-center text-primary mb-4">Iniciar Sesión</h2>

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="********"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 mb-3"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm"></span>
            ) : (
              "Ingresar"
            )}
          </button>
        </form>

        <div className="text-center">
          <p>
            ¿No tienes cuenta?{" "}
            <span
              className="text-primary fw-bold"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/register")}
            >
              Regístrate
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
