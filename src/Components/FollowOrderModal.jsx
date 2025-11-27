// src/components/FollowOrderModal.jsx
import { useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { followOrder } from "../services/api";
import { toast } from "react-toastify";
import telefonoIcono from "/images/dec10.png"; // ruta a tu icono

// Dentro del JSX
{telefonoIcono && (
  <img
    src={telefonoIcono}
    alt="Teléfono"
    style={{ width: "16px", height: "16px", marginRight: "5px" }}
  />
)}


// ==================
// Iconos de estados (SVGs)
// ==================

// Pendiente (reloj)
const IconPendiente = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="orange" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 1a11 11 0 1 0 11 11A11.012 11.012 0 0 0 12 1zm1 12h5v-2h-4V6h-2v7z"/>
  </svg>
);

// Procesando (engranaje)
const IconProcesando = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="blue" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.43 12.98l.04-.32-.93-.54 1.08-1.87-1.42-1.42-1.87 1.08-.54-.93-.32.04-.21-1.73h-2l-.21 1.73-.32-.04-.54.93-1.87-1.08-1.42 1.42 1.08 1.87-.93.54.04.32-1.73.21v2l1.73.21-.04.32.93.54-1.08 1.87 1.42 1.42 1.87-1.08.54.93.32-.04.21 1.73h2l.21-1.73.32.04.54-.93 1.87 1.08 1.42-1.42-1.08-1.87.93-.54-.04-.32 1.73-.21v-2zM12 15a3 3 0 1 1 3-3 3.003 3.003 0 0 1-3 3z"/>
  </svg>
);

// Enviado (camión azul claro)
const IconEnviado = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="skyblue" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 4h13v4h5l3 4v7h-4a2 2 0 0 1-4 0H7a2 2 0 0 1-4 0H1V6a2 2 0 0 1 2-2zm16 7h2.5l1.5 2H19v-2zM7 18a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm12 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
  </svg>
);

// En ruta (camión azul más oscuro)
const IconEnRuta = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="blue" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 4h13v4h5l3 4v7h-4a2 2 0 0 1-4 0H7a2 2 0 0 1-4 0H1V6a2 2 0 0 1 2-2zm16 7h2.5l1.5 2H19v-2zM7 18a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm12 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
  </svg>
);

// Entregado (check verde)
const IconEntregado = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="green" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 16.17l-3.5-3.5-1.41 1.41L9 19 20.5 7.5l-1.41-1.41z"/>
  </svg>
);

// Cancelado (cruz roja)
const IconCancelado = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="red" xmlns="http://www.w3.org/2000/svg">
    <line x1="4" y1="4" x2="20" y2="20" stroke="white" strokeWidth="2"/>
    <line x1="20" y1="4" x2="4" y2="20" stroke="white" strokeWidth="2"/>
  </svg>
);

const statusIcons = {
  pendiente: <IconPendiente />,
  procesando: <IconProcesando />,
  enviado: <IconEnviado />,
  en_ruta: <IconEnRuta />,
  entregado: <IconEntregado />,
  cancelado: <IconCancelado />,
};

const statusColors = {
  pendiente: "text-warning fw-semibold",
  procesando: "text-primary fw-semibold",
  enviado: "text-info fw-semibold",
  en_ruta: "text-info fw-semibold",
  entregado: "text-success fw-semibold",
  cancelado: "text-danger fw-semibold",
};


// ==================
// Componente principal
// ==================
export default function FollowOrderModal({ show, onClose }) {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFollow = async (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      toast.error("Introduce tu número de seguimiento");
      return;
    }

    setLoading(true);
    try {
      const { success, data, error } = await followOrder(trackingNumber.trim());

      if (!success) {
        toast.error(error || "Pedido no encontrado ❌");
        setOrderData(null);
        return;
      }

      setOrderData(data.order);
      toast.success("Pedido encontrado ✅");
    } catch {
      toast.error("Error al consultar el pedido ❌");
      setOrderData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Seguimiento de pedido</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Formulario */}
        <Form onSubmit={handleFollow}>
          <Form.Group className="mb-3">
            <Form.Label>Número de seguimiento</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ejemplo: DEC-ORD-ZJG26FB9"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
            />
          </Form.Group>

          <Button type="submit" className="w-100" disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" /> Consultando...
              </>
            ) : (
              "Seguir pedido"
            )}
          </Button>
        </Form>

        {/* Información del pedido */}
        {orderData && (
          <div className="mt-4 p-3 rounded bg-light border">
            <h5 className="fw-bold mb-3">Pedido #{orderData.order_code }</h5>
            <p>
              <strong>Estado actual:</strong>{" "}
              <span className={statusColors[orderData.status?.toLowerCase()]}>
                {orderData.status}
              </span>
            </p>

            {orderData.estimated_delivery_date && (
              <p>
                <strong>Entrega estimada:</strong>{" "}
                {new Date(orderData.estimated_delivery_date).toLocaleDateString("es-ES")}
              </p>
            )}

            <p>
              <strong>Dirección:</strong> {orderData.shipping_address}
            </p>
            {/* Información de contacto de la empresa */}
<div className="mt-4 p-3 rounded bg-white border">
  <h6 className="fw-bold mb-2">Contacto de la empresa</h6>
  <p className="mb-1">
    <strong>Empresa:</strong> Decora10
  </p>
  <p className="mb-1">
    <a href="https://www.decora10.com" target="_blank" rel="noopener noreferrer">
      www.decora10.com
    </a>
  </p>
  <p className="mb-1 d-flex align-items-center">
    {telefonoIcono && (
      <img
        src={telefonoIcono}
        alt="Teléfono"
        style={{ width: "16px", height: "16px", marginRight: "5px" }}
      />
    )}
    953-581-802
  </p>
  <p className="mb-0">Avenida Andalucía 8, Alcalá la Real</p>
</div>


            <hr />

            {/* Timeline */}
            <h6 className="fw-bold mb-2">Progreso del pedido:</h6>
            <div className="d-flex flex-column gap-3">
              {orderData.timeline?.map((step, index) => (
                <div key={index} className="d-flex align-items-center gap-2">
                  <div>{statusIcons[step.status?.toLowerCase()]}</div>
                  <div>
                    <div className={statusColors[step.status?.toLowerCase()]}>
                      {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                    </div>
                    <div className="text-muted small">{step.cambiado_en}</div>
                    {step.nota && <div className="fst-italic small">{step.nota}</div>}
                  </div>
                </div>
              ))}
            </div>

            <hr />

            {/* Productos */}
            <h6 className="fw-bold mb-2">Productos:</h6>
            <ul className="list-unstyled mb-0">
              {orderData.items?.map((item) => (
                <li key={item.id} className="mb-1">
                  🛒 {item.product_name || item.product?.name} × {item.quantity} — €
                  {(item.price * item.quantity).toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
          
        )}
        
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
