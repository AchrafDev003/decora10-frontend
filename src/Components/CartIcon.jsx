// src/Components/CartIcon.jsx
import { useState, useMemo, useEffect, useRef } from "react";
import { useCart } from "../Context/Carrito/CartContext";
import { getImageUrl } from "../services/api";



export default function CartIcon() {
  const { cartItems, total, fetchCart, removeCartItem, clearCart } = useCart();
  const [hover, setHover] = useState(false);
  const timeoutRef = useRef();

  // Fetch inicial del carrito
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Total de items
  const totalItems = useMemo(
    () => (cartItems || []).reduce((sum, item) => sum + (item.quantity || 0), 0),
    [cartItems]
  );

  return (
    <div
      className="position-relative d-inline-block"
      onMouseEnter={() => {
        clearTimeout(timeoutRef.current);
        setHover(true);
      }}
      onMouseLeave={() => {
        timeoutRef.current = setTimeout(() => setHover(false), 150);
      }}
    >
      <div
  className="carrito position-relative ms-3"
  style={{
    cursor: "pointer",
    fontSize: "1.4rem",
    color: "#522020", // tu color marrón
    display: "inline-block",
    transition: "transform 0.3s ease, color 0.3s ease",
  }}
  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
>
  <i className="bi bi-cart3"></i>
  {totalItems > 0 && (
    <span
      className="position-absolute top-0 start-100 translate-middle rounded-pill"
      style={{
        backgroundColor: "#ddb4a9",
        color: "#000",
        fontSize: "0.75rem",
        fontWeight: "700",
        padding: "0.35em 0.5em",
        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        transition: "transform 0.3s ease",
        animation: "bounce 0.5s",
      }}
    >
      {totalItems}
    </span>
  )}

  {/* Keyframes para la animación de rebote */}
  <style>
    {`
      @keyframes bounce {
        0%   { transform: scale(1); }
        25%  { transform: scale(1.3); }
        50%  { transform: scale(0.9); }
        75%  { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
    `}
  </style>
</div>


      {hover && (
        <div
          className="position-absolute end-0 mt-2 rounded shadow p-3"
          style={{
            width: "350px",
            zIndex: 100,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            border: `1px solid var(--bs-brown)`,
          }}
        >
          <h6 className="mb-3 fw-bold text-center" style={{ color: "var(--bs-brown)" }}>
            Resumen del Carrito
          </h6>

          {cartItems?.length > 0 ? (
            <>
              <ul className="list-unstyled">
                {cartItems.map((item, idx) => (
                  <li
                    key={`${item.product_id ?? item.id}-${idx}`}
                    className="d-flex mb-2 border-bottom pb-2 align-items-center"
                  >
                    <img
                      src={getImageUrl(item.images?.[0]?.image_path) ?? "/images/ITEM Home.jpg"}
                      alt={item.name}
                      style={{ width: "50px", height: "50px", objectFit: "cover" }}
                      className="me-2 rounded"
                    />
                    <div className="flex-grow-1">
                      <strong>{item.name}</strong>
                      <div className="small">
                        Cantidad: {item.quantity || 0} - €
                        {((item.promo_price ?? item.price) * (item.quantity || 0)).toFixed(2)}
                      </div>
                    </div>
                    <button
                      className="btn btn-sm btn-outline-danger ms-2"
                      onClick={() => removeCartItem(item.product_id ?? item.id)}
                    >
                      &times;
                    </button>
                  </li>
                ))}
              </ul>

              <div className="text-end mt-3">
                <strong style={{ color: "var(--bs-brown)" }}>Total: €{total.toFixed(2)}</strong>
              </div>

              <div className="d-grid mt-2">
                <button
                  className="btn btn-sm"
                  style={{ backgroundColor: "var(--bs-brown)", color: "#fff" }}
                  onClick={clearCart}
                >
                  Vaciar carrito
                </button>
              </div>
            </>
          ) : (
            <p className="text-center text-muted">Tu carrito está vacío.</p>
          )}
        </div>
      )}
    </div>
  );
}
