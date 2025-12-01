// src/Pages/Checkout.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useCart } from "../Context/Carrito/CartContext";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import { checkoutCart, validateCoupon } from "../services/api";
import { toast } from "react-hot-toast";
import { useAuth } from "../Context/AuthContext";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PaymentForm from "../Components/PaymentForm";
import getImageUrl from "../services/api";
import "../css/Checkout.css";

// Reemplaza con tu clave pública de Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const Checkout = () => {
  const { cartItems, total, clearCart } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orderPlaced, setOrderPlaced] = useState(false);

  // ------------------- Formulario -------------------
  const [formData, setFormData] = useState({
    line1: "",
    line2: "",
    city: "",
    zipcode: "",
    country: "ES",
    mobile1: "",
    mobile2: "",
    additional_info: "",
    type: "domicilio",
    payment_method: "card",
  });

  const [couponCode, setCouponCode] = useState("");
  const [discountData, setDiscountData] = useState({ amount: 0, type: null });
  const [userLocation, setUserLocation] = useState(null);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // ------------------- Geolocalización -------------------
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation(pos.coords),
        () => setUserLocation(null)
      );
    }
  }, []);

  // ------------------- Total con descuento -------------------
  const totalWithDiscount = useMemo(() => {
    const discounted = total - discountData.amount;
    return discounted > 0 ? discounted : 0;
  }, [total, discountData]);

  // ------------------- Aplicar cupón -------------------
  const applyCoupon = async () => {
    if (!couponCode.trim()) return toast.error("Ingresa un código");

    const payload = {
      email: user?.email || "",
      cart_total: total,
      code: couponCode.trim(),
      cart_products: cartItems.map((item) => item.product_id),
    };

    try {
      const res = await validateCoupon(payload);

      if (res.success && res.data.valid) {
        const amount =
          res.data.type === "percent"
            ? (total * res.data.discount) / 100
            : res.data.discount;

        if (total > 99) {
          setDiscountData({ amount, type: res.data.type });
          toast.success(
            `Código aplicado: ${
              res.data.type === "percent"
                ? res.data.discount + "%"
                : "€" + res.data.discount
            }`
          );
        } else {
          toast.error("El descuento solo aplica en compras mayores a 99€");
          setDiscountData({ amount: 0, type: null });
        }
      } else {
        setDiscountData({ amount: 0, type: null });
        toast.error(res.data?.message || "Código inválido o expirado");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al validar el cupón");
    }
  };

  // ------------------- Checkout -------------------
  const handleOrder = async (paymentIntent = null) => {
    if (!formData.line1.trim())
      return toast.error("Por favor, introduce tu dirección completa.");
    if (!formData.mobile1.trim())
      return toast.error("Debes indicar al menos un número de teléfono.");
    if (!formData.payment_method)
      return toast.error("Selecciona un método de pago.");
    if (!user?.id) return toast.error("Debes iniciar sesión.");
    if (!cartItems.length) return toast.error("Tu carrito está vacío.");

    const payload = {
      payment_method: formData.payment_method,
      promo_code: couponCode?.trim() || null,
      line1: formData.line1,
      line2: formData.line2 || null,
      city: formData.city || null,
      zipcode: formData.zipcode || null,
      country: formData.country || "España",
      mobile1: formData.mobile1,
      mobile2: formData.mobile2 || null,
      type: formData.type,
      address_type: formData.address_type || "default",
      additional_info: formData.additional_info || "",
      total: totalWithDiscount,
      discount: discountData.amount || 0,
      items: cartItems.map((item) => ({
        product_id: item.product?.id || item.product_id,
        quantity: item.quantity,
        price: item.product?.promo_price || item.product?.price || item.price,
      })),
      payment_intent: paymentIntent?.id || null,
    };

    try {
      const res = await checkoutCart(payload);

      if (res?.success || res?.status === 201) {
        toast.success("¡Pedido realizado con éxito! 🛍️");
        await clearCart();
        setOrderPlaced(true);

        setTimeout(() => {
          navigate("/gracias", {
            state: { orderCode: res.data?.tracking_number },
          });
        }, 2500);
      } else {
        console.error("Respuesta checkoutCart:", res);
        toast.error(res?.error || "Error al procesar el pedido");
      }
    } catch (err) {
      console.error("❌ Error al procesar la orden:", err);
      toast.error("Error inesperado. Inténtalo de nuevo más tarde.");
    }
  };

  // ------------------- Métodos de pago -------------------
  const paymentOptions = useMemo(() => {
    const options = [
      { value: "card", label: "Tarjeta de crédito" },
      { value: "paypal", label: "PayPal" },
    ];

    if (formData.type === "local" && userLocation) {
      options.push({ value: "cash", label: "Efectivo (solo local)" });
      options.push({ value: "bizum", label: "Bizum (solo local)" });
    }

    if (formData.type === "domicilio" && formData.country === "ES") {
      options.push({ value: "bizum", label: "Bizum (solo España)" });
    }

    return options;
  }, [formData.type, formData.country, userLocation]);

  // ------------------- Imagen del producto -------------------
  

  return (
    <div className="checkout-container container my-5">
      {orderPlaced && <Confetti numberOfPieces={400} recycle={false} />}
      <h2 className="mb-5 text-center text-gradient animate__animated animate__fadeInDown">
        🏁 Checkout
      </h2>

      <div className="row gap-4">
        {/* Formulario */}
        <div className="col-md-6 shadow-lg rounded p-5 bg-gradient-form animate__animated animate__fadeInLeft">
          <h4 className="mb-4 text-light fw-bold">Información de Envío</h4>

          <textarea
            name="line1"
            placeholder="Dirección completa"
            className="form-control mb-3 input-glass"
            value={formData.line1}
            onChange={handleChange}
          />

          <input
            type="text"
            name="line2"
            placeholder="Dirección 2 (opcional)"
            className="form-control mb-3 input-glass"
            value={formData.line2}
            onChange={handleChange}
          />

          <input
            type="text"
            name="city"
            placeholder="Ciudad"
            className="form-control mb-3 input-glass"
            value={formData.city}
            onChange={handleChange}
          />

          <input
            type="text"
            name="zipcode"
            placeholder="Código postal (opcional)"
            className="form-control mb-3 input-glass"
            value={formData.zipcode}
            onChange={handleChange}
          />

          <input
            type="text"
            name="mobile1"
            placeholder="Teléfono principal"
            className="form-control mb-3 input-glass"
            value={formData.mobile1}
            onChange={handleChange}
          />

          <input
            type="text"
            name="mobile2"
            placeholder="Teléfono secundario (opcional)"
            className="form-control mb-3 input-glass"
            value={formData.mobile2}
            onChange={handleChange}
          />

          <textarea
            name="additional_info"
            placeholder="Información adicional (opcional)"
            className="form-control mb-3 input-glass"
            value={formData.additional_info}
            onChange={handleChange}
          />

          <div className="mb-3">
            <label className="text-light fw-semibold">Tipo de entrega</label>
            <select
              name="type"
              className="form-select input-glass mb-3"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="domicilio">Entrega a domicilio</option>
              <option value="local">Recogida en local</option>
            </select>

            {formData.type === "domicilio" && (
              <select
                name="country"
                className="form-select input-glass"
                value={formData.country}
                onChange={handleChange}
              >
                <option value="ES">España</option>
                <option value="OTRO">Otro país</option>
              </select>
            )}
          </div>

          {/* Cupón */}
          <div className="input-group mb-3">
            <input
              type="text"
              className="form-control input-glass"
              placeholder="Código de descuento"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              disabled={discountData.amount > 0}
            />
            <button
              className="btn btn-primary"
              onClick={applyCoupon}
              disabled={discountData.amount > 0}
            >
              Aplicar
            </button>
          </div>

          {discountData.amount > 0 && (
            <div className="mb-3 text-success fw-semibold">
              Cupón aplicado: {couponCode} -{" "}
              {discountData.type === "percent"
                ? `${((discountData.amount / total) * 100).toFixed(0)}%`
                : `€${discountData.amount.toFixed(2)}`}
            </div>
          )}

          <h4 className="mb-3 text-light fw-bold">Método de Pago</h4>
          <select
            name="payment_method"
            className="form-select mb-4 input-glass"
            value={formData.payment_method}
            onChange={handleChange}
          >
            {paymentOptions.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

          {/* Integración de Stripe */}
          {["card", "bizum"].includes(formData.payment_method) ? (
            <Elements stripe={stripePromise}>
              <PaymentForm
                totalAmount={totalWithDiscount}
                paymentMethod={formData.payment_method}
                onSuccess={handleOrder}
              />
            </Elements>
          ) : (
            <button
              className="btn btn-neon w-100 py-3 animate__animated animate__pulse animate__infinite"
              onClick={handleOrder}
            >
              Finalizar Pedido
            </button>
          )}
        </div>

        {/* Resumen */}
        <div className="col-md-5 shadow-lg rounded p-5 bg-white animate__animated animate__fadeInRight">
          <h4 className="mb-4 text-dark fw-bold">Resumen de tu Orden</h4>
          <ul className="list-group mb-3">
            {cartItems.map((item) => (
              <li
                key={item.product_id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <div className="d-flex align-items-center gap-3">
                  <img
                    src={item.images?.[0]?.image_path ?? "/images/ITEM Home.jpg"}
                    alt={item.name}
                    className="rounded shadow-sm"
                    style={{ width: 80, height: 80, objectFit: "cover" }}
                  />
                  <span className="fw-semibold">{item.name}</span>
                </div>
                <span className="fw-bold text-primary">
                  €{((item.promo_price ?? item.price) * item.quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>

          {discountData.amount > 0 && (
            <h6 className="text-end text-success fw-bold">
              Descuento aplicado:{" "}
              {discountData.type === "percent"
                ? `${((discountData.amount / total) * 100).toFixed(0)}%`
                : `€${discountData.amount.toFixed(2)}`}
            </h6>
          )}

          <h5 className="text-end fw-bold text-gradient">
            Total: €{totalWithDiscount.toFixed(2)}
          </h5>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
