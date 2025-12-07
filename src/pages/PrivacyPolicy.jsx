// src/pages/PrivacyPolicy.jsx
import React from 'react';
import '../css/PrivacyPolicy.css'; // CSS aparte para estilos locos

const PrivacyPolicy = () => {
  return (
    <div className="privacy-container">
      <div className="privacy-card">
        <h1 className="privacy-title">Política de Privacidad — Decora10</h1>
        <p className="privacy-subtitle">Última actualización: 7 de diciembre de 2025</p>

        <div className="privacy-content">
          <section>
            <h2>1. Identidad del responsable</h2>
            <p>
              <strong>Decora10, S.L.</strong> (en adelante, <em>“Decora10”</em>)<br />
              CIF: <strong>[Rellenar CIF]</strong><br />
              Dirección: <strong>[Rellenar dirección completa]</strong><br />
              Correo: <a href="mailto:info@decora10.com">info@decora10.com</a>
            </p>
          </section>

          <section>
            <h2>2. Datos que recogemos</h2>
            <ul>
              <li><strong>Contacto:</strong> nombre, email, teléfono.</li>
              <li><strong>Navegación:</strong> cookies, IP, sesión.</li>
              <li><strong>Compras:</strong> historial de pedidos y facturación.</li>
            </ul>
          </section>

          <section>
            <h2>3. Finalidades y base jurídica</h2>
            <ul>
              <li>Gestión de pedidos: ejecución de contrato.</li>
              <li>Newsletters: consentimiento.</li>
              <li>Mejora de la web: interés legítimo / cookies.</li>
            </ul>
          </section>

          <section>
            <h2>4. Cookies</h2>
            <p>Usamos cookies para mejorar tu experiencia y ofrecer publicidad personalizada. Puedes gestionar tus preferencias en el banner.</p>
          </section>

          <section>
            <h2>5. Conservación de datos</h2>
            <ul>
              <li>Pedidos: 6 años.</li>
              <li>Newsletters: hasta que retires consentimiento.</li>
            </ul>
          </section>

          <section>
            <h2>6. Destinatarios y cesiones</h2>
            <p>Compartimos datos solo con proveedores necesarios (hosting, envío, analítica) bajo garantías legales.</p>
          </section>

          <section>
            <h2>7. Derechos</h2>
            <p>Puedes solicitar acceso, rectificación, supresión, limitación, oposición y portabilidad enviando un correo a <a href="mailto:info@decora10.com">info@decora10.com</a></p>
          </section>

          <section>
            <h2>8. Reclamaciones</h2>
            <p>Si consideras que tus derechos no se respetan, puedes reclamar a la <strong>AEPD</strong>: <a href="https://www.aepd.es" target="_blank" rel="noreferrer">www.aepd.es</a></p>
          </section>

          <section>
            <h2>9. Seguridad</h2>
            <p>Implementamos medidas técnicas y organizativas para proteger tus datos frente a accesos no autorizados.</p>
          </section>

          <section>
            <h2>10. Cambios en la política</h2>
            <p>La política puede actualizarse. La versión vigente siempre estará disponible en esta página.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
