// src/Components/TopBanner.jsx
import React, { useEffect, useState } from "react";
import { getActiveCoupons } from "../services/api";
import { toast } from "react-hot-toast";
import "../css/topBanner.css";

export default function TopBanner() {
  const [coupons, setCoupons] = useState([]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem("topBannerDismissed");
    if (dismissed === "true") {
      setVisible(false);
      return;
    }

    const fetchCoupons = async () => {
      try {
        const res = await getActiveCoupons();
        if (res.success && res.data.length > 0) {
          setCoupons(res.data);
        }
      } catch (err) {
        console.error("Error cargando cupones:", err);
      }
    };

    fetchCoupons();
  }, []);

  const handleClose = () => {
    localStorage.setItem("topBannerDismissed", "true");
    setVisible(false);
  };

  const handleCopy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(`Código "${code}" copiado al portapapeles`);
    } catch (err) {
      toast.error("No se pudo copiar el código");
    }
  };

  if (!visible || coupons.length === 0) return null;

  const renderCouponText = (c) => {
    let discountText = "";
    if (c.type === "percent") discountText = `${c.discount}% OFF`;
    else if (c.type === "fixed") discountText = `${c.discount} € OFF`;

    const remaining =
      c.max_uses && c.used_count !== undefined
        ? c.max_uses - c.used_count
        : null;

    const remainingTextES =
      remaining !== null
        ? `Solo <span class="coupon-remaining">${remaining}</span> clientes pueden beneficiarse todavía.`
        : "";

    const remainingTextEN =
      remaining !== null
        ? `Only <span class="coupon-remaining">${remaining}</span> customers can still redeem it.`
        : "";

    return `
      Usa el código <span class="coupon-code">${c.code}</span> y obtén 
      <span class="coupon-discount">${discountText}</span>. 
      ${remainingTextES} 
      <span class="coupon-cta">Aprovecha antes de que se agote.</span>

      • Use code <span class="coupon-code">${c.code}</span> to get 
      <span class="coupon-discount">${discountText}</span>. 
      ${remainingTextEN} 
      <span class="coupon-cta">Hurry before it's gone.</span>
    `;
  };

  return (
    <div className="top-banner">
      <div className="top-banner-content">
        {coupons.map((c) => (
          <div
            key={c.id}
            className="coupon-message"
            onClick={() => handleCopy(c.code)}
            dangerouslySetInnerHTML={{ __html: renderCouponText(c) }}
            style={{ cursor: "pointer" }} // indica que es clicable
          ></div>
        ))}
      </div>

      <button className="top-banner-close" onClick={handleClose}>
        ×
      </button>
    </div>
  );
}
