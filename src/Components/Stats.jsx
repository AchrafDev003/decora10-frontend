import { useEffect } from "react";
import 'bootstrap-icons/font/bootstrap-icons.css';
import NewsletterPromo from './NewsletterPromo';
import 'animate.css';
import decorativaImg from '/img/decorativa1.png';


export default function StatsSection() {
  useEffect(() => {
    const counters = document.querySelectorAll(".counter");
    let started = false;

    const animateCount = (el, target) => {
      let count = parseInt(el.innerText);
      const step = Math.ceil((target - count) / 100);
      const update = () => {
        count += step;
        if (count >= target) {
          el.innerText = target;
        } else {
          el.innerText = count;
          requestAnimationFrame(update);
        }
      };
      update();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started) {
            counters.forEach((el) => {
              const target = parseInt(el.getAttribute("data-target"));
              animateCount(el, target);
            });
            started = true;
            observer.disconnect();
          }
        });
      },
      { threshold: 0.7 }
    );

    const target = document.querySelector("#stats-section");
    if (target) observer.observe(target);

    return () => observer.disconnect();
  }, []);

  const statsData = [
    { icon: 'bi-eye-fill', label: 'Visitas a la página', color: 'text-primary', initial: 670, target: 3478 },
    { icon: 'bi-people-fill', label: 'Clientes fieles', color: 'text-success', initial: 120, target: 812 },
    { icon: 'bi-stars', label: 'Estrellas en confianza', color: 'text-warning', initial: 2, target: 89 }
  ];

  return (
    <section id="stats-section" className="position-relative container-fluid py-5" style={{ background: "linear-gradient(135deg, #2e7d32, #81c784)" }}>
      <div className="row text-center justify-content-center">
        {statsData.map((stat, idx) => (
          <div className="col-12 col-md-3 mb-4" key={idx}>
            <div className="stat-card p-4 border rounded-4 shadow-lg">
              <i className={`bi ${stat.icon} fs-1 ${stat.color} mb-3`}></i>
              <h2 className="counter" data-target={stat.target}>{stat.initial}</h2>
              <p className="fw-bold">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Imagen flotante entre secciones */}
       <img
        src={decorativaImg}
        alt="Decorativa"
        className="floating-image img-fluid py-5"
      />


      {/* Componente animado al 70% visible */}
      <NewsletterPromo />

      <style jsx>{`
        .stat-card {
          background-color: #1a1a1a;
          color: #fff;
          box-shadow: 0 8px 20px rgba(255, 255, 255, 0.2);
          transition: all 0.4s ease;
        }

        .stat-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 15px 40px rgba(255, 255, 255, 0.35);
        }

        .stat-card i {
          transition: transform 0.4s ease;
        }

        .stat-card:hover i {
          transform: scale(1.2);
        }

        /* Imagen flotante */
       /* Imagen flotante */
.floating-image {
  position: absolute;
  bottom: -130px; /* mitad fuera de esta sección */
  left: 200px;
  width: auto;
  height: 30rem;
  padding-top: 150px;
  object-fit: contain;
  margin-top: 60px;
  opacity: 2;
  z-index: 10;
  animation: float 6s ease-in-out infinite;
  pointer-events: none;
}

/* Reflejo */


/* Animación de reflejo tipo agua */
@keyframes ripple {
  0%, 100% {
    transform: scaleY(-1) translateY(0);
  }
  50% {
    transform: scaleY(-1) translateY(5px);
  }
}

      `}</style>
    </section>
  );
}
