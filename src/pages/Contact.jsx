import React, { useEffect } from "react";
import { FaWhatsapp, FaEnvelope } from "react-icons/fa";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../css/Contact.css";

import direccionIcon from "/images/direccion.png";
import logo from "/images/dec10.png";

const BACKEND_WHATSAPP_NUMBER = import.meta.env.VITE_BACKEND_WHATSAPP_NUMBER || "34123456789";
const BACKEND_EMAIL = import.meta.env.VITE_BACKEND_EMAIL || "tuemail@gmail.com";

const position = [37.4602, -3.922740];

function RecenterOnLoad({ position }) {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
      map.setView(position, 17, { animate: true });
    }, 500);
  }, [map, position]);
  return null;
}

const markerIcon = new L.Icon({
  iconUrl: direccionIcon,
  iconSize: [28, 55],
  iconAnchor: [14, 55],
  popupAnchor: [0, -55],
  className: "neon-marker",
});

const Contact = () => {
  const whatsappMessage = encodeURIComponent("Hola 👋, me gustaría obtener más información sobre Decor@10.");
  const mailBody = encodeURIComponent("Buenos días,\n\nQuisiera más información sobre Decor@10.\n\nGracias.");

  return (
    <div className="contact-page d-flex flex-column align-items-center min-vh-100">
      <img src={logo} alt="Decor@10" className="contact-logo mb-3" />
      <h1 className="contact-title mb-2">Contacto</h1>
      <p className="contact-subtitle text-center px-3 mb-4">
        Conecta con nosotros a través de tus plataformas favoritas.
      </p>

      {/* Iconos contacto */}
      <div className="d-flex gap-4 mb-5">
        <a
          href={`https://wa.me/${BACKEND_WHATSAPP_NUMBER}?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="contact-icon whatsapp"
        >
          <FaWhatsapp />
        </a>
        <a
          href={`mailto:${BACKEND_EMAIL}?subject=Contacto&body=${mailBody}`}
          target="_blank"
          rel="noopener noreferrer"
          className="contact-icon mail"
        >
          <FaEnvelope />
        </a>
      </div>

      {/* Tarjeta empresa */}
      <div className="info-card text-center mb-5 p-4">
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
      <div className="contact-map mb-5">
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
          <RecenterOnLoad position={position} />
          <Marker position={position} icon={markerIcon}>
            <Popup>
              <div className="popup-content text-center">
                <img src="/images/dec10.png" alt="Decor@10" className="popup-logo" />
                <br />
                <strong className="fs-4">Decor@10</strong>
                <br />
                <span className="fs-5">Avenida Andalucía 8</span>
                <br />
                <a
                  href="https://share.google/F70ZzlRGYNblJ7hBb"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="popup-link"
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
