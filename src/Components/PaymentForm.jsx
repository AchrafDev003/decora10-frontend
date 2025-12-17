import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  useStripe,
  useElements,
  CardElement,
} from "@stripe/react-stripe-js";
import { toast } from "react-hot-toast";
import { createPaymentIntent } from "../services/api";
import { useAuth } from "../Context/AuthContext";

/* =====================================================
   Stripe Promise (FUERA del componente)
===================================================== */
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLIC_KEY
);

/* =====================================================
   CardElement styles
===================================================== */
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#ffffff",
      fontFamily: "Segoe UI, Roboto, sans-serif",
      fontSize: "16px",
      "::placeholder": { color: "#a0aec0" },
    },
    invalid: { color: "#fa755a" },
  },
};

/* =====================================================
   Inner Form
===================================================== */
function PaymentFormInner({ orderId, totalAmount, paymentMethod, clientSecret, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error("Stripe todavía no está listo");
      return;
    }

    setLoading(true);

    try {
      let result;

      if (paymentMethod === "card") {
        const card = elements.getElement(CardElement);

        if (!card) {
          throw new Error("CardElement no montado");
        }

        result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: { card },
        });
      } else {
        throw new Error("Método de pago no soportado en frontend");
      }

      if (result.error) {
        toast.error(result.error.message);
        return;
      }

      if (result.paymentIntent?.status === "succeeded") {
        toast.success("Pago realizado correctamente");
        onSuccess?.(result.paymentIntent);
      } else {
        toast("Pago en proceso…");
      }

    } catch (err) {
      console.error(err);
      toast.error("Error procesando el pago");
    } finally {
      setLoading(false);
    }
  };

  if (!clientSecret) {
    return <p className="text-white">Inicializando pago…</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="bg-dark p-4 rounded shadow">
      <div className="mb-3">
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>

      <button
        type="submit"
        disabled={loading || !stripe}
        className="btn btn-primary w-100 py-3 fw-semibold"
      >
        {loading ? "Procesando…" : `Pagar €${totalAmount.toFixed(2)}`}
      </button>
    </form>
  );
}

/* =====================================================
   Main Component
===================================================== */
export default function PaymentForm({
  orderId,
  totalAmount,
  paymentMethod = "card",
  onSuccess,
}) {
  const { user } = useAuth();
  const [clientSecret, setClientSecret] = useState(null);

  useEffect(() => {
    if (!orderId || !user?.id) return;

    const initPayment = async () => {
      try {
        const { data } = await createPaymentIntent({
          order_id: orderId,
          payment_method: paymentMethod,
          user_id: user.id,
        });

        if (!data?.clientSecret) {
          throw new Error("clientSecret no recibido");
        }

        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error(err);
        toast.error("No se pudo iniciar el pago");
      }
    };

    initPayment();
  }, [orderId, paymentMethod, user?.id]);

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentFormInner
        orderId={orderId}
        totalAmount={totalAmount}
        paymentMethod={paymentMethod}
        clientSecret={clientSecret}
        onSuccess={onSuccess}
      />
    </Elements>
  );
}
