// src/Components/PaymentForm.jsx
import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  useStripe,
  useElements,
  CardElement,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { toast } from "react-hot-toast";
import { createPaymentIntent } from "../services/api";
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

function PaymentFormInner({ totalAmount, paymentMethod, clientSecret, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return toast.error("Stripe no está listo.");
    if (!clientSecret) return toast.error("Error: clientSecret no disponible.");

    setLoading(true);

    try {
      let result;

      if (paymentMethod === "card") {
        const card = elements.getElement(CardElement);
        if (!card) throw new Error("CardElement no montado.");
        result = await stripe.confirmCardPayment(clientSecret, { payment_method: { card } });
      } else {
        const paymentEl = elements.getElement(PaymentElement);
        if (!paymentEl) throw new Error("PaymentElement no montado.");
        result = await stripe.confirmPayment({
          elements,
          clientSecret,
          confirmParams: { return_url: window.location.origin + "/gracias" },
        });
      }

      if (result.error) {
        toast.error(result.error.message || "Error procesando el pago.");
      } else if (result.paymentIntent?.status === "succeeded") {
        toast.success("✅ Pago completado correctamente");
        if (onSuccess) onSuccess(result.paymentIntent);
      } else if (result.paymentIntent?.status === "requires_payment_method") {
        toast.error("El pago fue rechazado, prueba otro método.");
      } else {
        toast("Pago en proceso, espera...");
      }
    } catch (err) {
      console.error("Error Stripe:", err);
      toast.error("Error inesperado al procesar el pago.");
    } finally {
      setLoading(false);
    }
  };

  if (!clientSecret) return <p className="text-white">Cargando formulario de pago...</p>;

  return (
    <form onSubmit={handleSubmit} className="p-3 bg-dark rounded shadow-lg">
      {paymentMethod === "card" && <CardElement options={CARD_ELEMENT_OPTIONS} />}
      {paymentMethod !== "card" && <PaymentElement />}
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

export default function PaymentForm({ totalAmount = 0, paymentMethod = "card", onSuccess }) {
  const [clientSecret, setClientSecret] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    setClientSecret(null); // 🔹 limpiar clientSecret anterior
    if (!totalAmount || totalAmount <= 0) return;

    const initializePayment = async () => {
      try {
        const stripeMode = import.meta.env.VITE_STRIPE_MODE || "live";
        let method = paymentMethod;
        if (stripeMode === "test" && paymentMethod === "bizum") method = "sofort";

        const { data } = await createPaymentIntent({
          amount: totalAmount,
          payment_method: method,
          user_id: user?.id || 0,
        });

        if (!data?.clientSecret) throw new Error("No se recibió clientSecret del servidor.");
        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error("Error creando PaymentIntent:", err);
        toast.error("No se pudo iniciar el pago. Inténtalo de nuevo.");
      }
    };

    initializePayment();
  }, [totalAmount, paymentMethod, user?.id]);

  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

  return (
    <Elements stripe={stripePromise} options={clientSecret ? { clientSecret } : {}}>
      <PaymentFormInner
        totalAmount={totalAmount}
        paymentMethod={paymentMethod}
        clientSecret={clientSecret}
        onSuccess={onSuccess}
      />
    </Elements>
  );
}
