// src/Pages/Checkout.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useCart } from "../Context/Carrito/CartContext";
import { useNavigate, Link } from "react-router-dom";
import Confetti from "react-confetti";
import { toast } from "react-hot-toast";
import { checkoutCart, validateCoupon } from "../services/api";
import { useAuth } from "../Context/AuthContext";
import { initGetnetPayment } from "../services/api";


import "../css/Checkout.css";

// -------------------------------
// GEOCODING: Código postal → coordenadas
// -------------------------------
async function geocodePostalCode(postalCode) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${postalCode}&country=spain&format=json`
    );
    const data = await res.json();
    if (data.length === 0) return null;

    return {
      latitude: Number(data[0].lat),
      longitude: Number(data[0].lon),
    };
  } catch (err) {
    console.error("Error geocoding:", err);
    return null;
  }
}

// -------------------------------
// LOGÍSTICA
// -------------------------------
const getCartLogisticType = (items) => {
  console.log("Determinando tipo logístico para items:", items);
  if (items.some(i => i.logistic_type === "heavy")) return "heavy";
  if (items.some(i => i.logistic_type === "medium")) return "medium";
  return "small";
};

const calculateTransportFee = ({ distanceKm, logisticType, subtotal }) => {
  console.log("Calculando transporte:", { distanceKm, logisticType, subtotal });

  if (!distanceKm || distanceKm <= 20) return 0; // Envío gratuito dentro de 20 km

  switch (logisticType) {
    case "heavy":
      return 50;
    case "medium":
      if (subtotal < 100) return 18.5;
      if (subtotal < 150) return 24.5;
      return 27.5;
    case "small":
      return 9.8;
    default:
      return 0;
  }
};

// -------------------------------
// DISTANCIA (HAVERSINE)
// -------------------------------
const STORE_POSITION = [37.4602, -3.92274];

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// -------------------------------
// COMPONENTE Checkout
// -------------------------------
const Checkout = () => {
  const { cartItems, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [processingOrder, setProcessingOrder] = useState(false);

  const [formData, setFormData] = useState({
    line1: "",
    line2: "",
    city: "",
    zipcode: "",
    country: "ES",
    mobile1: "",
    mobile2: "",
    additional_info: "",
    type: "domicilio", // "domicilio" | "local"
    payment_method: "card",
  });

  const [couponCode, setCouponCode] = useState("");
  const [discountData, setDiscountData] = useState({ amount: 0, type: null });
  const [userLocation, setUserLocation] = useState(null);

  // -------------------------------
  // Manejo de formulario
  // -------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "type" || name === "country") {
        const opts = computePaymentOptions(next.type, next.country, userLocation);
        next.payment_method = opts.length ? opts[0].value : next.payment_method;
      }

      return next;
    });
  };

  // -------------------------------
  // Geolocalización por código postal
  // -------------------------------
  useEffect(() => {
    const loadFromPostal = async () => {
      if (!formData.zipcode || formData.zipcode.trim().length < 4) return;

      const coords = await geocodePostalCode(formData.zipcode.trim());
      console.log("Coordenadas obtenidas:", coords);
      if (coords) setUserLocation({ latitude: coords.latitude, longitude: coords.longitude });
    };
    loadFromPostal();
  }, [formData.zipcode]);

  // -------------------------------
  // Scroll top al cargar
  // -------------------------------
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // -------------------------------
  // Opciones de pago
  // -------------------------------
  const computePaymentOptions = () => [
  { value: "card", label: "Pago con tarjeta" },
];

  const paymentOptions = useMemo(
    () => computePaymentOptions(formData.type, formData.country, userLocation),
    [formData.type, formData.country, userLocation]
  );

  useEffect(() => {
    if (!paymentOptions.some((p) => p.value === formData.payment_method) && paymentOptions[0]) {
      setFormData((prev) => ({ ...prev, payment_method: paymentOptions[0].value }));
    }
  }, [paymentOptions]);

  // -------------------------------
  // Totales y descuentos
  // -------------------------------
  const subtotal = useMemo(
    () =>
      cartItems.reduce((sum, item) => {
        const price = Number(item.promo_price ?? item.price ?? 0);
        const quantity = Number(item.quantity ?? 1);
        return sum + price * quantity;
      }, 0),
    [cartItems]
  );

  const discountAmount = useMemo(() => Number(discountData.amount || 0), [discountData]);
  const subtotalAfterDiscount = useMemo(() => Math.max(subtotal - discountAmount, 0), [
    subtotal,
    discountAmount,
  ]);

  // -------------------------------
  // Transporte según distancia
  // -------------------------------
  const { distanceKm, transportFee, cartLogisticType } = useMemo(() => {
    const logisticType = getCartLogisticType(cartItems);

    const dist = userLocation
      ? getDistanceKm(userLocation.latitude, userLocation.longitude, STORE_POSITION[0], STORE_POSITION[1])
      : null;

    const fee = calculateTransportFee({ distanceKm: dist, logisticType, subtotal: subtotalAfterDiscount });

    return { distanceKm: dist, transportFee: fee, cartLogisticType: logisticType };
  }, [userLocation, cartItems, subtotalAfterDiscount]);

  const finalTotal = useMemo(
    () => Number(subtotalAfterDiscount) + Number(transportFee || 0),
    [subtotalAfterDiscount, transportFee]
  );

  // -------------------------------
  // Aplicar cupón
  // -------------------------------
  const applyCoupon = async () => {
    if (!couponCode.trim()) return toast.error("Ingresa un código");

    const payload = {
      email: user?.email || "",
      cart_total: subtotal,
      code: couponCode.trim(),
      cart_products: cartItems.map((item) => item.product_id),
    };

    try {
      const res = await validateCoupon(payload);
      console.log("Respuesta cupón:", res);

      if (res.success && res.data.valid) {
        const amount =
          res.data.type === "percent" ? (subtotal * res.data.discount) / 100 : res.data.discount;

        if (subtotal > 99) {
          setDiscountData({ amount, type: res.data.type });
          toast.success(
            `Código aplicado: ${res.data.type === "percent" ? res.data.discount + "%" : "€" + res.data.discount}`
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
      console.error("Error al validar cupón:", err);
      toast.error("Error al validar el cupón");
    }
  };

  // -------------------------------
  // Checkout / Orden
  // -------------------------------
  const handleOrder = async () => {
  if (processingOrder) return;
  setProcessingOrder(true);

  try {
    if (!user?.id) throw new Error("Debes iniciar sesión.");
    if (!cartItems.length) throw new Error("Tu carrito está vacío.");
    if (formData.type === "domicilio" && !formData.line1?.trim())
      throw new Error("Introduce tu dirección completa.");
    if (!formData.mobile1?.trim())
      throw new Error("Debes indicar un teléfono.");

    const orderPayload = {
      payment_method: formData.payment_method,
      line1: formData.line1,
      line2: formData.line2 || null,
      city: formData.city,
      zipcode: formData.zipcode || null,
      country: formData.country,
      mobile1: formData.mobile1,
      mobile2: formData.mobile2 || null,
      additional_info: formData.additional_info || "",
      type: formData.type,
      promo_code: couponCode?.trim() || null,

      items: cartItems.map((item) => ({
        product_id: item.type === "product" ? item.entity_id : null,
        pack_id: item.type === "pack" ? item.entity_id : null,
        quantity: item.quantity,
        price: Number(item.promo_price ?? item.price),
      })),

      subtotal: subtotal,
      discount: discountAmount,
      transport_fee: transportFee,
      total: finalTotal,
      coupon_type: discountData.type,
    };

    console.log("📦 Creando pedido...", orderPayload);

    // 1️⃣ Crear pedido
    const orderRes = await checkoutCart(orderPayload);
    console.log("Respuesta crear pedido:", orderRes);

    if (!orderRes?.success) {
      throw new Error(orderRes?.error || "Error creando pedido");
    }

    const orderId = orderRes.data.order.id;

    // 2️⃣ Pedir datos Getnet
   const paymentRes = await initGetnetPayment({
  order_id: orderId,
});

if (!paymentRes.success) {
  throw new Error(paymentRes.error || "Error iniciando pago");
}
console.log("Respuesta Getnet:", paymentRes);
        // console.log("Respuesta Getnet:", paymentRes);

// ⚠️ En tu API real viene dentro de data.data
const paymentData = paymentRes.data;
     console.log("Respuesta Getnet:", paymentData);

if (!paymentData?.gatewayUrl || !paymentData?.params || !paymentData?.signature) {
  throw new Error("Respuesta inválida de Getnet");
}

console.log(atob(paymentData.params));

// 3️⃣ REDIRECT POST A GETNET
const form = document.createElement("form");
form.method = "POST";
form.action = paymentData.gatewayUrl;

const fields = {
  Ds_SignatureVersion: paymentData.version,
  Ds_MerchantParameters: paymentData.params,
  Ds_Signature: paymentData.signature,
};

Object.entries(fields).forEach(([key, value]) => {
  const input = document.createElement("input");
  input.type = "hidden";
  input.name = key;
  input.value = value;
  form.appendChild(input);
});

// 🔥 DEBUG CORRECTO (usa paymentData, no variables inexistentes)
console.log("GETNET URL:", paymentData.gatewayUrl);
console.log("PARAMS:", paymentData.params);
console.log("SIGNATURE:", paymentData.signature);

setTimeout(() => {
  document.body.appendChild(form);
  console.log("el formulario enviado...", form);
  form.submit();
}, 50);

  } catch (err) {
    console.error("❌ Error:", err);
    toast.error(err.message || "Error en el checkout");
  } finally {
    setProcessingOrder(false);
  }
};

  // -------------------------------
  // RENDER
  // -------------------------------
  return (
    <div className="checkout-container container my-5">
      {orderPlaced && <Confetti numberOfPieces={400} recycle={false} />}
      <h2 className="mb-5 text-center fs-4 text-gradient animate__animated animate__fadeInDown">🏁 Checkout</h2>

      <div className="row gap-4">
        {/* LEFT: Formulario */}
        <div className="col-md-6 shadow-lg rounded p-5 bg-gradient-form animate__animated animate__fadeInLeft">
          <h4 className="mb-4 text-light fw-bold">Información de Envío</h4>

          {/* Tipo y país */}
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
                className="form-select input-glass mb-3"
                value={formData.country}
                onChange={handleChange}
              >
                <option value="ES">España</option>
                <option value="OTRO">Otro país</option>
              </select>
            )}
          </div>

          {/* Dirección */}
          {formData.type === "domicilio" && (
            <textarea
              name="line1"
              placeholder="Dirección completa"
              className="form-control mb-3 input-glass"
              value={formData.line1}
              onChange={handleChange}
            />
          )}
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
            <button className="btn btn-primary" onClick={applyCoupon} disabled={discountData.amount > 0}>
              Aplicar
            </button>
          </div>
          {discountData.amount > 0 && (
            <div className="mb-3 text-success fw-semibold">
              Cupón aplicado: {couponCode} -{" "}
              {discountData.type === "percent"
                ? `${((discountAmount / Math.max(1, subtotal)) * 100).toFixed(0)}%`
                : `€${discountAmount.toFixed(2)}`}
            </div>
          )}

          {/* Método de pago */}
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

          {/* Integración Stripe */}
         <button
  className="btn btn-neon w-100 py-3"
  onClick={handleOrder}
  disabled={processingOrder}
>
  {processingOrder ? "Redirigiendo..." : "Pagar ahora"}
</button>
        </div>

        {/* RIGHT: Resumen */}
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
                    src={item.image ?? "/images/ITEM Home.jpg"}
                    alt={item.name}
                    className="rounded shadow-sm"
                    style={{ width: 80, height: 80, objectFit: "cover" }}
                  />
                  <div>
                    <span className="fw-semibold d-block">{item.name}</span>
                    <small className="text-muted">
                      Cantidad: {item.quantity} × €{Number(item.promo_price ?? item.price).toFixed(2)}
                    </small>
                  </div>
                </div>
                <span className="fw-bold text-primary">
                  €{(Number(item.promo_price ?? item.price) * Number(item.quantity)).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>

          {discountAmount > 0 && (
            <h6 className="text-end text-success fw-bold mb-2">
              Descuento:{" "}
              {discountData.type === "percent"
                ? `${((discountAmount / Math.max(1, subtotal)) * 100).toFixed(0)}%`
                : `€${discountAmount.toFixed(2)}`}
            </h6>
          )}

          <div className="d-flex justify-content-between align-items-center mb-1">
            <small className="text-muted">Subtotal</small>
            <small className="fw-semibold">€{subtotal.toFixed(2)}</small>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-1">
            <small className="text-muted">Descuento</small>
            <small className="fw-semibold">-€{discountAmount.toFixed(2)}</small>
          </div>

          <div className="alert alert-info d-flex align-items-start gap-2 mb-3">
            <span className="fs-4">📍</span>
            <div className="small">
              <strong>Envío gratuito</strong> para direcciones situadas a menos de <strong>20 km</strong> de nuestra
              tienda.
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-1">
            <small className="text-muted">Coste de Logística</small>
            <small className="fw-semibold">€{(transportFee || 0).toFixed(2)}</small>
          </div>

          <hr className="border-secondary my-2" />
          <h5 className="text-end fw-bold text-gradient mb-3">Total: €{finalTotal.toFixed(2)}</h5>
          <hr className="border-secondary my-3" />

          {/* Info entrega */}
          <div className="d-flex align-items-center gap-2 mb-2">
            <span role="img" aria-label="Entrega" className="fs-4">
              📦
            </span>
            <p className="mb-0 text-muted">
              Entrega estimada: <strong>6 días hábiles</strong>
            </p>
          </div>

          <div className="d-flex align-items-center gap-2 mb-2">
            <span role="img" aria-label="Transporte" className="fs-4">
              🚚
            </span>
           <div>
  <p className="text-muted small">
    Logística: <strong>{cartLogisticType}</strong>
  </p>

  <p className="text-muted small">
    Transporte: <strong>{(transportFee || 0).toFixed(2)} €</strong>
  </p>
</div>
          </div>

          <div className="d-flex align-items-center gap-2 mb-3">
            <span role="img" aria-label="Devoluciones" className="fs-4">
              🔄
            </span>
            <p className="mb-0 text-muted">
              <Link to="/politica-devoluciones" className="text-decoration-none">
                Política de devoluciones
              </Link>
            </p>
          </div>

          <div className="d-flex gap-2 flex-wrap mt-3">
            <span className="badge bg-success py-2 px-3 shadow-sm">Pago 100% seguro</span>
            <span className="badge bg-primary py-2 px-3 shadow-sm">Garantía de calidad</span>
            <span className="badge bg-warning text-dark py-2 px-3 shadow-sm">Soporte 24/7</span>
          </div>

          <div className="mt-4 text-muted small">
            <p className="mb-1">💡 Recuerda revisar tu carrito antes de finalizar.</p>
            <p className="mb-0">📌 Todos los precios incluyen IVA.</p>
          </div>
        </div>
      </div>
    </div>
  );
};


export default Checkout;
