import { useState, useEffect, useRef } from "react";
import { getHeroItems } from "../services/api";
import principalImg from '../assets/img/galeria_04.jpg';
import "../css/Hero.css";

export default function Hero() {
  const [items, setItems] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef(null);

  // =========================
  // 🔹 Obtener Hero Items
  // =========================
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      const result = await getHeroItems();

      if (result.success && Array.isArray(result.data)) {
        const publishedItems = result.data
          .filter((item) => item.status === "published")
          .sort((a, b) => (a.order || 0) - (b.order || 0));

        setItems(publishedItems);
      } else {
        console.error("Error al cargar hero_items:", result.error);
      }

      setLoading(false);
    };

    fetchItems();
  }, []);

  // =========================
  // 🔹 Carousel automático
  // =========================
  useEffect(() => {
    if (!items || items.length === 0) return;

    let timeout;
    const setNextSlide = () => setCurrent((prev) => (prev + 1) % items.length);
    const item = items[current];
    const isVideo =
      item.media_url?.endsWith(".mp4") || item.media_type?.includes("video");

    if (isVideo) {
      const video = videoRef.current;
      if (video) {
        const onLoadedMetadata = () => {
          timeout = setTimeout(setNextSlide, video.duration * 1000);
        };
        video.addEventListener("loadedmetadata", onLoadedMetadata, { once: true });
        return () => {
          clearTimeout(timeout);
          video.removeEventListener("loadedmetadata", onLoadedMetadata);
        };
      }
    } else {
      timeout = setTimeout(setNextSlide, 10000);
    }

    return () => clearTimeout(timeout);
  }, [items, current]);

  // =========================
  // 🔹 Estados visuales
  // =========================
  if (loading) {
    return (
      <div className="hero-loading">
        <p className="fs-3">Cargando...</p>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="hero-loading">
        <p className="fs-3">No hay items para mostrar</p>
      </div>
    );
  }

  // =========================
  // 🔹 Render del Slide Actual
  // =========================
  const item = items[current];
  const mediaUrl = item.media_url || principalImg;
  const isVideo =
    item.media_url?.endsWith(".mp4") || item.media_type?.includes("video");

  const prevSlide = () =>
    setCurrent((prev) => (prev - 1 + items.length) % items.length);
  const nextSlide = () => setCurrent((prev) => (prev + 1) % items.length);

  return (
    <section className="hero-section">
      {/* 🖼 Imagen Layout (por defecto) */}
      {!isVideo ? (
        <div
          className="hero-image image-fluid"
          style={{ backgroundImage: `url(${mediaUrl})` }}
        >
          <div className="image-overlay"></div>
          <div className="image-content fade-up">
            <h2 className="hero-title">{item.title}</h2>
            <p className="hero-subtitle">{item.subtitle}</p>
            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="hero-btn"
              >
                Descubrir más
              </a>
            )}
          </div>
        </div>
      ) : (
        // 🎬 Video Layout
        <div className="hero-video-layout container">
          <div className="video-container">
            <video
              ref={videoRef}
              src={mediaUrl}
              autoPlay
              muted
              loop
              playsInline
              className="video-element"
            />
          </div>

          <div className="vertical-divider"></div>

          <div className="video-content">
            <h2 className="hero-title">{item.title}</h2>
            <p className="hero-subtitle">{item.subtitle}</p>
            {item.descripcion && (
              <p className="hero-description">{item.descripcion}</p>
            )}
            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="hero-btn"
              >
                Descubrir más
              </a>
            )}
          </div>
        </div>
      )}

      {/* 🔹 Botones de navegación */}
      <button onClick={prevSlide} className="hero-nav left">
        &#10094;
      </button>
      <button onClick={nextSlide} className="hero-nav right">
        &#10095;
      </button>
    </section>
  );
}
