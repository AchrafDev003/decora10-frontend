// src/Components/PaymentForm.jsx
import React, { useState, useEffect } from "react";
import { useStripe, useElements, CardElement, PaymentElement } from "@stripe/react-stripe-js";
import { toast } from "react-hot-toast";
import { createPaymentIntent } from "../services/api"; // Endpoint Laravel
import { useAuth } from "../Context/AuthContext";

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#fff",
      fontFamily: "Segoe UI, Roboto, sans-serif",
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": { color: "#a0aec0" },
    },
    invalid: { color: "#fa755a", iconColor: "#fa755a" },
  },
};

// Componente interno que maneja el formulario
function PaymentFormInner({ totalAmount, paymentMethod, clientSecret, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return toast.error("Stripe no está listo todavía.");
    if (!clientSecret) return toast.error("Error: clientSecret no disponible.");

    setLoading(true);
    try {
      let result;

      if (paymentMethod === "card") {
        const card = elements.getElement(CardElement);
        if (!card) throw new Error("CardElement no está montado.");
        result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: { card },
        });
      } else {
        const paymentElement = elements.getElement(PaymentElement);
        if (!paymentElement) throw new Error("PaymentElement no está montado.");
        result = await stripe.confirmPayment({
          elements,
          clientSecret,
          confirmParams: { return_url: window.location.origin + "/gracias" },
        });
      }

      if (result.error) {
        console.error("Error Stripe:", result.error);
        toast.error(result.error.message || "Error al procesar el pago.");
      } else if (result.paymentIntent?.status === "succeeded") {
        toast.success("✅ Pago completado correctamente");
        if (onSuccess) onSuccess(result.paymentIntent);
      } else {
        toast("El pago está en proceso, por favor espera.");
      }
    } catch (err) {
      console.error("Stripe payment error:", err);
      toast.error("❌ Error al procesar el pago. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (!clientSecret)
    return <p className="text-white">Cargando formulario de pago...</p>;

  return (
    <form onSubmit={handleSubmit} className="p-3 bg-dark rounded shadow-lg">
      {paymentMethod === "card" && (
        <div className="mb-3">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      )}
      {paymentMethod !== "card" && (
        <div className="mb-3">
          <PaymentElement />
        </div>
      )}
      <button
        type="submit"
        disabled={loading || !stripe || !clientSecret}
        className="btn btn-primary w-100 py-3 fw-semibold"
      >
        {loading ? "Procesando..." : `Pagar €${totalAmount.toFixed(2)}`}
      </button>
    </form>
  );
}

// Componente principal
export default function PaymentForm({ totalAmount, paymentMethod, clientSecret, onSuccess }) {
  return (
    <PaymentFormInner
      totalAmount={totalAmount}
      paymentMethod={paymentMethod}
      clientSecret={clientSecret}
      onSuccess={onSuccess}
    />
  );
}
