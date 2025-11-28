import { useEffect } from "react";
import "vanilla-cookieconsent/dist/cookieconsent.css";
import "../css/cookieconsent.css";
import * as CookieConsent from "vanilla-cookieconsent";

export default function CookieConsentBanner() {
  useEffect(() => {
    CookieConsent.run({
      disableStyles: true,
      debug: import.meta.env.DEV,
      guiOptions: {
        consentModal: {
          layout: "box",
          position: "bottom center", // Más centrado para móviles
          equalWeightButtons: true,
          flipButtons: false,
        },
        preferencesModal: {
          layout: "box",
          position: "center",
          equalWeightButtons: true,
          flipButtons: false,
        },
      },
      categories: {
        necessary: { readOnly: true, enabled: true },
        analytics: {},
        marketing: {},
      },
      language: {
        default: "es",
        translations: {
          es: {
            consentModal: {
              title: "Usamos cookies",
              description:
                "Este sitio utiliza cookies para mejorar tu experiencia.",
              acceptAllBtn: "Aceptar todas",
              acceptNecessaryBtn: "Solo necesarias",
              showPreferencesBtn: "Personalizar",
              closeIconLabel: "Cerrar",
            },
            preferencesModal: {
              title: "Preferencias de cookies",
              acceptAllBtn: "Aceptar todas",
              acceptNecessaryBtn: "Solo necesarias",
              savePreferencesBtn: "Guardar preferencias",
              closeIconLabel: "Cerrar",
              sections: [
                {
                  title: "Uso de cookies",
                  description:
                    "Usamos cookies para funciones esenciales y analíticas.",
                },
                {
                  title: "Cookies necesarias",
                  linkedCategory: "necessary",
                },
                {
                  title: "Cookies analíticas",
                  linkedCategory: "analytics",
                },
                {
                  title: "Cookies marketing",
                  linkedCategory: "marketing",
                },
              ],
            },
          },
        },
      },
    });
  }, []);

  const handleResetConsent = () => {
    CookieConsent.reset(true);
  };

  return (
    <>
      {import.meta.env.DEV && (
        <button
          onClick={handleResetConsent}
          style={{
            position: "fixed",
            bottom: "10px",
            right: "10px",
            zIndex: 9999,
            background: "#222",
            color: "white",
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "0.9rem",
          }}
        >
          Resetear Cookies
        </button>
      )}
    </>
  );
}
