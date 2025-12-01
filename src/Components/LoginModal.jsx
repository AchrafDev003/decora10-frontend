import { useState, useEffect } from "react";
import { Modal, Button, Form, Tab, Nav } from "react-bootstrap";
import { useAuth } from "../Context/AuthContext";
import "../css/LoginModal.css";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function AuthModal({ show, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleInitialized, setGoogleInitialized] = useState(false);

  const { login, register, loginWithGoogle } = useAuth();

  // ------------------- LOGIN -------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ------------------- REGISTER -------------------
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({
        name,
        email,
        password,
        password_confirmation: passwordConfirm,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ------------------- GOOGLE LOGIN -------------------
  useEffect(() => {
    if (!window.google || !GOOGLE_CLIENT_ID) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
    });

    setGoogleInitialized(true);
  }, []);

  const handleCredentialResponse = async (response) => {
    if (!response.credential) return;

    setLoading(true);
    try {
      await loginWithGoogle(response.credential);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = () => {
    if (!googleInitialized || !window.google?.accounts?.id) return;
    window.google.accounts.id.prompt();
  };

  // ------------------- UI -------------------
  return (
    <Modal show={show} onHide={onClose} centered backdrop="static">
      <Modal.Dialog className="glass-modal p-0">
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold" style={{ color: "var(--bs-brown)" }}>
            Acceso a tu cuenta
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Tab.Container defaultActiveKey="login">
            <Nav variant="tabs" className="mb-4 justify-content-center">
              <Nav.Item>
                <Nav.Link eventKey="login" className="fw-bold">
                  Iniciar sesión
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="register" className="fw-bold">
                  Registrarse
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              {/* LOGIN */}
              <Tab.Pane eventKey="login">
                <Form onSubmit={handleLogin} className="d-flex flex-column gap-3">
                  <Form.Group>
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="usuario@correo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group>
                    <Form.Label>Contraseña</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    className="btn-success py-2 fw-bold"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm"></span>
                    ) : (
                      "Iniciar sesión"
                    )}
                  </Button>

                  {/* GOOGLE BUTTON */}
                  <Button
                    type="button"
                    className="btn-google fw-bold py-2 d-flex align-items-center justify-content-center gap-2"
                    onClick={handleGoogleClick}
                    disabled={loading || !googleInitialized}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm"></span>
                    ) : (
                      <>
                        <img
                          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                          alt="Google"
                          width="20"
                          height="20"
                        />
                        Iniciar sesión con Google
                      </>
                    )}
                  </Button>
                </Form>
              </Tab.Pane>

              {/* REGISTER */}
              <Tab.Pane eventKey="register">
                <Form onSubmit={handleRegister} className="d-flex flex-column gap-3">
                  <Form.Group>
                    <Form.Label>Nombre completo</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Tu nombre"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group>
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="usuario@correo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group>
                    <Form.Label>Contraseña</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group>
                    <Form.Label>Confirmar contraseña</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Repite tu contraseña"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    className="btn-success py-2 fw-bold"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm"></span>
                    ) : (
                      "Crear cuenta"
                    )}
                  </Button>
                </Form>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Modal.Body>
      </Modal.Dialog>
    </Modal>
  );
}
