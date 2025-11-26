// src/Pages/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import  api  from "../services/api";
import { toast } from "react-hot-toast";

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/v1/register", { name, email, password });
      if (res.data?.success) {
        toast.success("Cuenta creada correctamente");
        navigate("/");
      } else {
        toast.error(res.data?.error || "Error al registrar usuario");
      }
    } catch (err) {
      toast.error(err.message || "Error desconocido");
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
        <h2 className="text-center text-primary mb-4">Crear Cuenta</h2>

        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label className="form-label">Nombre</label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Tu nombre completo"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
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
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Confirmar Contraseña</label>
            <input
              type="password"
              className="form-control"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              placeholder="********"
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
              "Registrarse"
            )}
          </button>
        </form>

        <div className="text-center">
          <p>
            ¿Ya tienes cuenta?{" "}
            <span
              className="text-primary fw-bold"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/login")}
            >
              Inicia sesión
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
