// src/Components/PaymentForm.jsx
import React, { useEffect, useState, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { toast } from "react-hot-toast";
import { createPaymentIntent } from "../services/api";
import { useAuth } from "../Context/AuthContext";

/* Stripe promise (fuera del render) */
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

/* ============================
   FORMULARIO INTERNO
============================ */
function PaymentFormInner({ clientSecret, totalAmount, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error("Stripe no está listo todavía.");
      return;
    }

    setLoading(true);

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-processing`,
        },
        redirect: "if_required",
      });

      if (result.error) {
        toast.error(result.error.message || "Error al procesar el pago.");
        return;
      }

      if (result.paymentIntent?.status === "succeeded") {
        toast.success("✅ Pago confirmado");
        onSuccess?.(result.paymentIntent);
      } else {
        toast("⏳ Pago en proceso. Te avisaremos en breve.");
      }

    } catch (err) {
      console.error("Stripe error:", err);
      toast.error("❌ Error inesperado durante el pago.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-dark rounded shadow-lg">
      <PaymentElement className="mb-4" />

      <button
        type="submit"
        disabled={loading || !stripe}
        className="btn btn-primary w-100 py-3 fw-semibold"
      >
        {loading ? "Procesando..." : `Pagar €${totalAmount.toFixed(2)}`}
      </button>
    </form>
  );
}

/* ============================
   COMPONENTE PRINCIPAL
============================ */
export default function PaymentForm({
  totalAmount = 0,
  paymentMethod = "card",
  onSuccess,
}) {
  const { user } = useAuth();
  const [clientSecret, setClientSecret] = useState(null);
  const intentCreatedRef = useRef(false);

  useEffect(() => {
    if (!totalAmount || totalAmount <= 0) return;
    if (!user?.id) return;
    if (intentCreatedRef.current) return;

    intentCreatedRef.current = true;

    const initPayment = async () => {
      try {
        const method = paymentMethod === "bizum" ? "sofort" : paymentMethod;

        const { data } = await createPaymentIntent({
          amount: totalAmount,
          payment_method: method,
          user_id: user.id,
        });

        if (!data?.clientSecret) {
          throw new Error("Stripe no devolvió clientSecret");
        }

        setClientSecret(data.clientSecret);

      } catch (err) {
        console.error("Error creando PaymentIntent:", err);
        toast.error("No se pudo iniciar el pago.");
      }
    };

    initPayment();
  }, [totalAmount, paymentMethod, user?.id]);

  if (!clientSecret) {
    return <p className="text-white">Inicializando pago...</p>;
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "night",
          labels: "floating",
        },
      }}
    >
      <PaymentFormInner
        clientSecret={clientSecret}
        totalAmount={totalAmount}
        onSuccess={onSuccess}
      />
    </Elements>
  );
}
