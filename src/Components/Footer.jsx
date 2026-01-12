// src/Components/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaEnvelope } from "react-icons/fa";

const Footer = () => {
  const socialIcons = [
    {
      icon: FaFacebookF,
      href: "https://www.facebook.com/profile.php?id=61586511925618",
      label: "Facebook",
    },
    {
      icon: FaInstagram,
      href: "https://www.instagram.com/decora10_alcala/",
      label: "Instagram",
    },
    {
      icon: FaEnvelope,
      href: "mailto:info@decora10.com",
      label: "Email",
    },
  ];

  const quickLinks = [
    { label: "Inicio", to: "/" },
    { label: "Tienda", to: "/tienda" },
    { label: "Mi Cuenta", to: "/perfil" },
    { label: "Contacto", to: "/contacto" },
  ];

  const legalLinks = [
    { label: "Política de Privacidad", to: "/politica-privacidad" },
    { label: "Política de Devoluciones", to: "/politica-devoluciones" },
  ];

  const categories = [
    { id: 76, name: "Colchonería", slug: "colchoneria" },
    { id: 77, name: "Mobiliario", slug: "mobiliario" },
    { id: 78, name: "Iluminación", slug: "iluminacion" },
    { id: 79, name: "Textil hogar", slug: "textil-hogar" },
    { id: 80, name: "Decoración", slug: "decoracion" },
    { id: 81, name: "Muebles", slug: "muebles" },
  ];

  return (
    <footer className="bg-dark text-white pt-5 pb-3 position-relative overflow-hidden">
      <div className="container">
        <div className="row">

          {/* Logo y descripción */}
          <div className="col-md-4 mb-4">
            <h2 className="text-orange fw-bold logo-footer">
              DECORA <span className="text-white">10</span>
            </h2>
            <p className="text-white-50">
              Tu tienda de muebles y decoración premium. Inspira tu hogar con estilo y calidad.
            </p>

            <div className="d-flex gap-3 mt-3">
              {socialIcons.map(({ icon: Icon, href, label }, idx) => (
                <a
                  key={idx}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white fs-5 footer-icon"
                  aria-label={label}
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div className="col-md-2 mb-4">
            <h5 className="text-orange fw-bold mb-3">Enlaces</h5>
            {quickLinks.map(({ label, to }, idx) => (
              <Link
                key={idx}
                to={to}
                className="d-block text-white text-decoration-none mb-2 footer-link"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Categorías */}
          <div className="col-md-3 mb-4">
            <h5 className="text-orange fw-bold mb-3">Categorías</h5>

            {categories.map(({ id, name, slug }) => {
              const url =
                slug === "colchoneria"
                  ? "/colchoneria"
                  : `/tienda?category=${id}`;

              return (
                <Link
                  key={id}
                  to={url}
                  className="d-block text-white text-decoration-none mb-2 footer-link"
                >
                  {name}
                </Link>
              );
            })}
          </div>

          {/* Newsletter */}
          <div className="col-md-3 mb-4">
            <h5 className="text-orange fw-bold mb-3">Newsletter</h5>
            <p className="text-white-50">
              Suscríbete para recibir ofertas y novedades
            </p>

            <form
              className="d-flex flex-column gap-2"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                className="form-control footer-input"
                placeholder="Tu correo electrónico"
                required
              />
              <button type="submit" className="btn btn-orange text-white footer-btn">
                Suscribirse
              </button>
            </form>
          </div>
        </div>

        <hr className="border-secondary" />

        {/* Enlaces legales */}
        <div className="d-flex flex-column flex-md-row justify-content-center gap-3 mb-2">
          {legalLinks.map(({ label, to }, idx) => (
            <Link
              key={idx}
              to={to}
              className="text-white-50 text-decoration-none small footer-link"
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="text-center text-white-50 small">
          © {new Date().getFullYear()} Decora10. Todos los derechos reservados.
        </div>
      </div>

      {/* Animaciones de fondo */}
      <span className="footer-bg-circle circle1"></span>
      <span className="footer-bg-circle circle2"></span>

      <style jsx="true">{`
        .footer-bg-circle {
          position: absolute;
          border-radius: 50%;
          opacity: 0.1;
        }
        .circle1 {
          width: 150px;
          height: 150px;
          background: #ff00ff;
          top: -40px;
          right: -40px;
        }
        .circle2 {
          width: 100px;
          height: 100px;
          background: #00f6ff;
          bottom: -30px;
          left: -30px;
        }
        @media (max-width: 768px) {
          .footer-bg-circle {
            display: none;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
