import React, { useState } from 'react';
import '../css/NewsletterModal.css';
import newsletterImg from '/images/newsletter.jpg';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import * as bootstrap from 'bootstrap'; // FIX AQUI 🔥
import { subscribeNewsletter } from '../services/api';  

const NewsletterModal = () => {
  const [step, setStep] = useState(1); // 1: email, 2: mostrar código
  const [email, setEmail] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [loading, setLoading] = useState(false);

 const handleSubscribe = async () => {
  if (!email) return toast.error('Introduce tu email');
  if (!accepted) return toast.error('Debes aceptar la política de privacidad');

  setLoading(true);
  try {
    const res = await subscribeNewsletter(email);
    const data = res.data;

    if (data.success) {
      setPromoCode(data.promo_code);
      toast.success('¡Suscripción exitosa! Tu código está listo.');
      setStep(2);
    } else {
      toast.error(data.message || 'Error al enviar el email');
    }
  } catch (err) {
    toast.error(err.response?.data?.message || 'Error de conexión con el servidor');
  } finally {
    setLoading(false);
  }
};


  const handleClose = () => {
    // Reset modal
    setStep(1);
    setEmail('');
    setAccepted(false);
    setPromoCode('');
    const modalEl = document.getElementById('customNewsletterModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal?.hide();
  };

  return (
    <>
      {/* Botón abrir modal */}
      <div className="promo-trigger" data-bs-toggle="modal" data-bs-target="#customNewsletterModal">
        <p className="fw-semibold fs-6 bg-primary p-4 mb-3 d-flex align-items-center justify-content-center gap-2 rounded">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-stars animate-icon" viewBox="0 0 16 16">
            <path d="M7.5 0L6 3l-3 1.5 3 1.5 1.5 3L10.5 6l3-1.5-3-1.5L7.5 0zm6 6l-.5 1.5L12 9l1.5-.5L15 9l-.5-1.5L15 6l-1.5.5L13.5 6zM3 9.5l-.5 1L2 12l1-.5L4 12l-.5-1.5.5-1-1 .5-1-.5z" />
          </svg>
          10% DESCUENTO POR SUSCRIPCIÓN A LA NEWSLETTER
        </p>
      </div>

      {/* Modal */}
      <div className="modal fade" id="customNewsletterModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content custom-modal">
            <div className="row g-0">
              <div className="col-md-6 d-none d-md-block">
                <img src={newsletterImg} alt="Descuento 10%" className="img-fluid h-100 w-100 object-fit-cover rounded-start" />
              </div>

              <div className="col-md-6 p-4 d-flex flex-column justify-content-between">
                <div>
                  <h3 className="mb-4">
                    {step === 1
                      ? '¡Suscríbete ahora y recibe un 10% descuento en tu primer pedido!'
                      : '¡Tu código de descuento está listo!'}
                  </h3>

                  {step === 1 ? (
                    <>
                      <label className="form-label fw-bold">Email</label>
                      <input
                        type="email"
                        className="form-control mb-3"
                        placeholder="Introduce tu email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />

                      <div className="form-check mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="privacyCheck"
                          checked={accepted}
                          onChange={(e) => setAccepted(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="privacyCheck">
                          He leído y acepto la{' '}
                          <a href="/politica-privacidad" target="_blank">política de privacidad</a>
                        </label>
                      </div>

                      <button
                        className="btn btn-dark w-100 fw-bold"
                        onClick={handleSubscribe}
                        disabled={loading}
                      >
                        {loading ? 'Enviando...' : 'QUIERO SUSCRIBIRME'}
                      </button>
                    </>
                  ) : (
                    <div className="text-center mb-3">
                      <p className="display-6 fw-bold text-primary">{promoCode}</p>
                      <p>Usa este código en tu primer pedido para obtener un 10% de descuento.</p>
                      <button className="btn btn-dark w-100 fw-bold" onClick={handleClose}>Cerrar</button>
                    </div>
                  )}
                </div>

                <div className="small text-muted mt-3">
                  Responsable del fichero: Decora 10, S.L. <br />
                  Finalidad: enviar newsletters periódicos, promociones y novedades sobre nuestros productos y servicios. <br />
                  Legitimación: gracias a tu consentimiento al suscribirte. <br />
                  Derechos: acceso, rectificación, limitación y supresión de tus datos enviando un correo a info@decora10.com. Más información en nuestra <a href="/politica-privacidad" target="_blank">política de privacidad</a>.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewsletterModal;
