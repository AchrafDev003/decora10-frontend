import React, { useEffect } from "react";
import { useCart } from "../Context/Carrito/CartContext";
import { Link, useNavigate } from "react-router-dom";
import "animate.css";
import { toast } from "react-hot-toast";
import { getImageUrl } from "../services/api";

const Cart = () => {
  const {
    cartItems,
    total,
    removeCartItem,
    updateCartItem,
    loading,
  } = useCart();

  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCheckout = () => {
    if (!cartItems || cartItems.length === 0) {
      toast.error("Tu carrito está vacío");
      return;
    }
    navigate("/checkout");
  };

  const handleQuantityChange = (item, value) => {
    let quantity = parseInt(value, 10);
    if (isNaN(quantity) || quantity < 1) quantity = 1;
    if (quantity > 5) {
      toast.error("Máximo 5 unidades por producto");
      quantity = 5;
    }

    // ✅ Usar id de CartItem y mantener medida
    updateCartItem(item.id, quantity, item.measure);
  };

  if (loading) {
    return (
      <div className="container my-5 text-center">
        <h4>Cargando carrito…</h4>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <h2 className="mb-5 text-center text-primary animate__animated animate__fadeInDown">
        🛒 Tu Carrito
      </h2>

      {!cartItems || cartItems.length === 0 ? (
        <div className="text-center my-5 animate__animated animate__fadeIn">
          <p className="fs-4 fw-semibold">Tu carrito está vacío.</p>
          <Link
            to="/tienda"
            className="btn px-5 py-3 fw-bold shadow"
            style={{
              background: "linear-gradient(90deg, #ff7e5f, #feb47b)",
              color: "#fff",
            }}
          >
            Ir a la Tienda
          </Link>
        </div>
      ) : (
        <>
          <div className="table-responsive mb-5 animate__animated animate__fadeInUp">
            <table className="table table-hover align-middle text-center shadow-lg rounded overflow-hidden">
              <thead className="bg-dark text-white">
                <tr>
                  <th>Producto</th>
                  <th>Precio</th>
                  <th>Cantidad</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
             <tbody>
  {cartItems.map((item) => {
    const price = Number(item.price ?? item.promo_price ?? 0);
    const quantity = Number(item.quantity ?? 1);
    const totalItem = price * quantity; // ✅ Total dinámico por fila

    return (
      <tr key={item.id}>
        <td className="d-flex align-items-center gap-3">
          <img
            src={getImageUrl(item.images?.[0]?.image_path) || "/images/ITEM Home.jpg"}
            alt={item.name}
            className="rounded shadow-sm"
            style={{ width: "80px", height: "80px", objectFit: "cover" }}
          />
          <span className="fw-semibold">{item.name}</span>
        </td>
        <td>€{price.toFixed(2)}</td>
        <td>
          <input
            type="number"
            min="1"
            max="5"
            value={quantity}
            onChange={(e) => handleQuantityChange(item, e.target.value)}
            className="form-control text-center"
            style={{ width: "70px", borderRadius: "8px", border: "2px solid #ff7e5f", fontWeight: "bold" }}
          />
        </td>
        <td>€{totalItem.toFixed(2)}</td>
        <td>
          <button
            className="btn btn-danger btn-sm shadow"
            onClick={() => removeCartItem(item.id)}
          >
            Eliminar
          </button>
        </td>
      </tr>
    );
  })}
</tbody>

            </table>
          </div>

          <div
            className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 p-4 shadow-lg rounded"
            style={{ background: "linear-gradient(90deg, #43cea2, #185a9d)" }}
          >
            <Link to="/tienda" className="btn btn-light px-4 py-2 fw-bold shadow">
              Seguir Comprando
            </Link>

            <div className="d-flex flex-column flex-md-row align-items-center gap-3">
              <h4 className="mb-0 text-white fw-bold fs-4">
  Total: €{cartItems
    .reduce((sum, item) => {
      const price = Number(item.price ?? item.promo_price ?? 0);
      const quantity = Number(item.quantity ?? 1);
      return sum + price * quantity;
    }, 0)
    .toFixed(2)}
</h4>


              <button
                className="btn px-5 py-3 fw-bold shadow animate__animated animate__pulse animate__infinite"
                style={{
                  background: "linear-gradient(90deg, #ff512f, #dd2476)",
                  color: "#fff",
                }}
                onClick={handleCheckout}
              >
                Proceder al pago
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
