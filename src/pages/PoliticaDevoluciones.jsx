// src/Pages/PoliticaDevoluciones.jsx
import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";


const PoliticaDevoluciones = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div className="container py-5" style={{ backgroundColor: "#111", color: "#fff", minHeight: "100vh" }}>
      <div className="p-4 p-md-5 rounded-4" style={{ backgroundColor: "#1c1c1c", boxShadow: "0 8px 20px rgba(0,0,0,0.5)" }}>
        <h1 className="mb-4" style={{ color: "#ff6600" }}>Política de Devolución y Reembolso</h1>
        <p className="text-white">Última actualización: 3 de enero de 2026</p>

        <section className="mt-4">
          <h3 style={{ color: "#ff6600" }}>1. Derecho de desistimiento</h3>
          <p>
            De acuerdo con la Directiva Europea 2011/83/UE y la Ley General para la Defensa de los Consumidores y Usuarios en España, tienes derecho a desistir de tu compra en un plazo de <strong>14 días naturales</strong> desde la recepción del producto, sin necesidad de justificar tu decisión.
          </p>
          <p>
            Para ejercer tu derecho de desistimiento, debes notificarnos mediante <strong>correo electrónico o nuestro formulario de contacto</strong> antes de que finalice el plazo de 14 días.
          </p>
          <p>
            Una vez notificada la devolución, tendrás 14 días adicionales para devolver los productos a la dirección que te indiquemos.
          </p>
        </section>

        <section className="mt-4">
          <h3 style={{ color: "#ff6600" }}>2. Productos excluidos del derecho de devolución</h3>
          <p>No se aceptarán devoluciones en los siguientes casos:</p>
          <ul>
            <li>Productos confeccionados o personalizados según tus especificaciones.</li>
            <li>Productos perecederos o con fecha de caducidad corta (alimentos, plantas, etc.).</li>
            <li>Productos precintados que no puedan devolverse por motivos de higiene o seguridad una vez abiertos (ej. colchones con precinto, ropa interior).</li>
            <li>Productos en mal estado o usados de forma que comprometa su reventa.</li>
          </ul>
        </section>

        <section className="mt-4">
          <h3 style={{ color: "#ff6600" }}>3. Condiciones de devolución</h3>
          <ul>
            <li>Los productos deben ser devueltos en su embalaje original, sin signos de uso y con todos los accesorios, etiquetas y manuales.</li>
            <li>Se recomienda usar un medio de envío que permita seguimiento del paquete.</li>
            <li>Los costes de devolución serán asumidos por el cliente, salvo que el producto llegue defectuoso o sea incorrecto.</li>
          </ul>
        </section>

        <section className="mt-4">
          <h3 style={{ color: "#ff6600" }}>4. Procedimiento de devolución</h3>
          <ol>
            <li>Contacta con nuestro equipo de atención al cliente mediante correo electrónico, teléfono o formulario web.</li>
            <li>Indica tu número de pedido, los productos a devolver y la razón de la devolución.</li>
            <li>Te proporcionaremos la dirección de devolución y, si aplica, instrucciones para la recogida.</li>
            <li>Envía el producto siguiendo las instrucciones proporcionadas.</li>
          </ol>
        </section>

        <section className="mt-4">
          <h3 style={{ color: "#ff6600" }}>5. Reembolso</h3>
          <ul>
            <li>Una vez recibido y verificado el producto, procesaremos el reembolso en un plazo de 14 días naturales.</li>
            <li>El reembolso se realizará mediante el mismo método de pago utilizado en la compra. En caso de no ser posible, se acordará un método alternativo.</li>
            <li>Los gastos de envío originales no se reembolsan si la devolución es por desistimiento (excepto en productos defectuosos o incorrectos).</li>
          </ul>
        </section>

        <section className="mt-4">
          <h3 style={{ color: "#ff6600" }}>6. Productos defectuosos o incorrectos</h3>
          <p>
            Si recibes un producto defectuoso o que no corresponde a tu pedido, notifícanos inmediatamente. 
            Nos encargaremos de la recogida y sustitución del producto sin coste adicional. También puedes optar por el reembolso total del importe pagado, incluidos los gastos de envío.
          </p>
        </section>

        <section className="mt-4">
          <h3 style={{ color: "#ff6600" }}>7. Contacto</h3>
          <p>Para cualquier duda sobre devoluciones o reembolsos, contáctanos en:</p>
          <ul>
            <li>Correo electrónico: <strong>decora10.colchon10@gmail.com</strong></li>
            <li>Teléfono: <strong>+34 953-581-802</strong></li>
            <li>Dirección: <strong>Avenida Andalucia 8, Alcala la Real, 23680, Jaen</strong></li>
          </ul>
        </section>

        <div className="mt-5 text-center">
          <Link 
            to="/" 
            className="btn" 
            style={{
              backgroundColor: "#ff6600",
              color: "#fff",
              padding: "10px 25px",
              borderRadius: "8px",
              fontWeight: "600",
              transition: "0.3s",
            }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = "#e65c00"}
            onMouseOut={e => e.currentTarget.style.backgroundColor = "#ff6600"}
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PoliticaDevoluciones;
