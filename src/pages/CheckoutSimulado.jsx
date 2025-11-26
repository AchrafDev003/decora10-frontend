import { useState } from "react";
import { useCart } from "../Context/Carrito/CartContext";
import { useAuth } from "../Context/AuthContext";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function CheckoutSimulado() {
  const { cartItems, total, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión para realizar el checkout");
      return;
    }
    if (!cartItems.length) {
      toast.error("Tu carrito está vacío");
      return;
    }
    if (!address) {
      toast.error("Ingresa tu dirección de envío");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/v1/checkout/fake",
        { shipping_address: address },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      if (res.data.success) {
        toast.success("Compra realizada con éxito (simulada)!");
        fetchCart(); // refresca carrito
        navigate("/order-confirmation");
      } else toast.error(res.data.error);
    } catch (err) {
      toast.error("Error en checkout simulado");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-5">
      <h2>Checkout Simulado</h2>
      <div className="mb-3">
        <label>Dirección de envío</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="form-control"
          placeholder="Calle, Ciudad, CP"
        />
      </div>

      <h4>Total: €{total.toFixed(2)}</h4>

      <button
        className="btn btn-success"
        onClick={handleCheckout}
        disabled={loading}
      >
        {loading ? "Procesando..." : "Simular pago"}
      </button>
    </div>
  );
}
