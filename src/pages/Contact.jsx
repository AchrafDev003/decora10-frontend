// src/pages/Contact.jsx
import React, { useEffect } from "react";
import { FaWhatsapp, FaEnvelope } from "react-icons/fa";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../css/Contact.css";

import direccionIcon from "/images/direccion.png";

const BACKEND_WHATSAPP_NUMBER = import.meta.env.VITE_BACKEND_WHATSAPP_NUMBER || "34123456789";
const BACKEND_EMAIL = import.meta.env.VITE_BACKEND_EMAIL || "tuemail@gmail.com";

const position = [37.4602, -3.922740]; // Coordenadas de la ubicación

// ✅ Recentrar mapa al cargarse o hacerse visible
function RecenterOnLoad({ position }) {
  const map = useMap();
  useEffect(() => {
  window.scrollTo({ top: 0, behavior: "smooth" });
}, []);


  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize(); // recalcula dimensiones
      map.setView(position, 17, { animate: true }); // centra con animación
      window.addEventListener("pointerdown", (e) => {
  console.log("Tipo de entrada:", e.pointerType); // mouse | touch | pen
});

    }, 500);
  }, [map, position]);

  return null;
}

// ✅ Ajuste perfecto del marcador
const markerIcon = new L.Icon({
  iconUrl: "/images/direccion.png",
  iconSize: [22, 50],
  iconAnchor: [11, 50],   // ← valores realistas (centro abajo)
  popupAnchor: [0, -50],
  className: "neon-marker",
});


const Contact = () => {
  const whatsappMessage = encodeURIComponent("Hola 👋, me gustaría obtener más información sobre Decor@10.");
  const mailBody = encodeURIComponent("Buenos días,\n\nQuisiera más información sobre Decor@10.\n\nGracias.");

  return (
    <div className="contact-page min-vh-100 d-flex flex-column align-items-center text-white bg-dark">
      <img src={logo} alt="Decor@10" className="mb-4 contact-logo" />
      <h1 className="display-4 mb-3 text-neon">Contacto</h1>
      <p className="mb-4 text-center text-white px-3">
        Conecta con nosotros a través de tus plataformas favoritas.
      </p>

      {/* Iconos de contacto */}
      <div className="d-flex gap-4 mb-5">
        <a
          href={`https://wa.me/${BACKEND_WHATSAPP_NUMBER}?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="contact-icon"
        >
          <FaWhatsapp />
        </a>
        <a
          href={`mailto:${BACKEND_EMAIL}?subject=Contacto&body=${mailBody}`}
          target="_blank"
          rel="noopener noreferrer"
          className="contact-icon"
        >
          <FaEnvelope />
        </a>
      </div>

      {/* Tarjeta empresa */}
      <div className="info-card text-center mb-5 p-4 rounded">
        <strong>Empresa</strong>
        <br />
        Decor@10
        <br />
        <a href="https://www.decora10.com" target="_blank" rel="noreferrer">
          www.decora10.com
        </a>
        <br />
        📞 953-581-802
        <br />
        Avenida Andalucía 8, Alcalá la Real
      </div>

      {/* Mapa */}
      <div className="contact-map mb-5" style={{ width: "90%", maxWidth: "900px" }}>
        <MapContainer
          center={position}
          zoom={17}
          scrollWheelZoom={false}
          style={{ height: "400px", width: "100%", borderRadius: "1rem" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
            url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
          />

          {/* ✅ Centra el mapa correctamente */}
          <RecenterOnLoad position={position} />

          <Marker position={position} icon={markerIcon}>
            <Popup>
              <div style={{ textAlign: "center" }}>
  <img
  src="/images/dec10.png"
  alt="Decor@10"
  style={{
    width: "100px",
    height: "auto",
    borderRadius: "8px",
    marginBottom: "5px",
  }}
/>

  <br />
  <strong className="fs-3">Decor@10</strong>
  <br />
  <span className="fs-3">Avenida Andalucía 8</span>
  <br />
  <a
    href="https://share.google/F70ZzlRGYNblJ7hBb"
    target="_blank"
    rel="noopener noreferrer"
    style={{
      display: "inline-block",
      marginTop: "6px",
      color: "#00eaff",
      fontWeight: "500",
      fontSize: "1.8rem",
      textDecoration: "none",
    }}
  >
    📍 Ver en Google Maps
  </a>
</div>

            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};

export default Contact;
