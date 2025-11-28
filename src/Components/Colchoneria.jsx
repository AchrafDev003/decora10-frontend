// src/components/Colchoneria.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { useCart } from "../Context/Carrito/CartContext";
import { useAuth } from "../Context/AuthContext";
import {
  getColchoneriaHighlights,
  getFavorites,
  addFavorite,
  removeFavorite,
} from "../services/api";
import { toast } from "react-hot-toast";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../css/colchoneria.css";
import AuthModal from "./LoginModal";
import logoColchon from "/images/colchon10.png";

// Colores por marca
const MARCA_COLORS = {
  Biolife: "#d32f2f",
  Dupen: "#000000",
  Flex: "#1976d2",
};

// Ajuste de precio según medida
const MEASURE_ADJUST = {
  "90x190": -100,
  "135x190": 0,
  "150x190": 80,
};

export default function Colchoneria() {
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [productos, setProductos] = useState({});
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedMeasure, setSelectedMeasure] = useState("135x190");

  // Inicializa AOS
  useEffect(() => { AOS.init({ duration: 800 }); }, []);

  // Carga productos destacados por marca
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getColchoneriaHighlights();
        if (res.success) {
          const marcas = {};
          res.data?.data?.forEach((brand) => {
            marcas[brand.brand] = brand.products;
          });
          setProductos(marcas);
        }
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Carga favoritos del usuario
  useEffect(() => {
    const fetchFavs = async () => {
      const token = localStorage.getItem("token");
      const userStored = JSON.parse(localStorage.getItem("user") || "null");
      if (!token || !userStored?.id) return;
      try {
        const res = await getFavorites();
        if (res.success && Array.isArray(res.data))
          setFavoritos(res.data.map((f) => f.product_id));
      } catch (err) { console.error(err); }
    };
    fetchFavs();
  }, []);

  // Toggle favoritos
  const toggleFavorito = async (productId) => {
    const token = localStorage.getItem("token");
    const userStored = JSON.parse(localStorage.getItem("user") || "null");
    if (!token || !userStored?.id) {
      setAuthModalOpen(true);
      return;
    }
    try {
      if (favoritos.includes(productId)) {
        const res = await removeFavorite(productId);
        if (res.success) setFavoritos(favoritos.filter((id) => id !== productId));
      } else {
        const res = await addFavorite(productId);
        if (res.success) setFavoritos([...favoritos, productId]);
      }
    } catch (err) { toast.error("Error al actualizar favoritos"); }
  };

  // Añadir al carrito
  const handleAddToCart = async (producto, measure) => {
    if (!user) { setAuthModalOpen(true); return; }
    const basePrice = producto.price ?? 0;
    const finalPrice = basePrice + (MEASURE_ADJUST[measure] ?? 0);
    try {
      await addToCart({
        id: producto.id,
        name: producto.name,
        price: finalPrice,
        promo_price: finalPrice,
        image: producto.images?.[0]?.image_path ?? "/images/ITEM Home.jpg",
        measure,
      }, 1);
      toast.success("Añadido al carrito");
    } catch (err) { toast.error("No se pudo añadir al carrito"); }
  };

  return (
    <section className="colchoneria-section">
      <div className="container-fluid px-0">
        <div className="colchoneria-header text-center">
          <img src={logoColchon} alt="Logo Decora10" className="colchoneria-logo mb-3" />
          <h1 className="colchoneria-title">Colchonerí@10</h1>
          <p className="colchoneria-subtitle">
            Decora10 te trae los mejores colchones de los proveedores más confiables al mejor precio.
          </p>
        </div>

        {loading && <p className="text-center">Cargando productos...</p>}

        {Object.entries(productos).map(([brand, items]) => (
          <div key={brand} className="colchoneria-rincon mb-5 position-relative">
            <h3 className={`colchoneria-brand-title ${brand.toLowerCase()}`}>{brand}</h3>

            <div className="row g-4 colchoneria-row">
              {items.map((producto, i) => (
                <div key={producto.id} className="col-12 col-md-6 col-lg-4" data-aos="fade-up" data-aos-delay={i * 100}>
                  <div className="card colchoneria-card">

                    {/* Carousel */}
                    <div className="col-12 p-0">
                      <div id={`carousel-${producto.id}`} className="carousel slide" data-bs-ride="carousel">
                        <div className="carousel-indicators">
                          {producto.images?.map((img, idxImg) => (
                            <button
                              key={idxImg}
                              type="button"
                              data-bs-target={`#carousel-${producto.id}`}
                              data-bs-slide-to={idxImg}
                              className={idxImg === 0 ? "active" : ""}
                              aria-current={idxImg === 0 ? "true" : "false"}
                              aria-label={`Slide ${idxImg + 1}`}
                            />
                          ))}
                        </div>
                        <div className="carousel-inner">
                          {producto.images?.length > 0 ? producto.images.map((img, idxImg) => {
                            const url = getImageUrl(img.image_path);

                            return (
                              <div className={`carousel-item ${idxImg === 0 ? "active" : ""}`} key={idxImg}>
                                <div className="position-relative">
                                  <img
  src={url}
  className="d-block w-100 colchoneria-img"
  alt={producto.name}
  onError={(e) => e.target.src = "/images/ITEM Home.jpg"}
/>

                                  <Link to={`/producto/${producto.id}`} className="overlay-hover-link">Ver producto</Link>
                                </div>
                              </div>
                            );
                          }) : (
                            <div className="carousel-item active">
                              <img src="/images/ITEM Home.jpg" className="d-block w-100 colchoneria-img" alt={producto.name} />
                              <Link to={`/producto/${producto.id}`} className="overlay-hover-link">Ver producto</Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Paleta de color */}
                    <div className="colchoneria-palette" style={{ background: MARCA_COLORS[brand] }} />

                    {/* Contenido */}
                    <div className="col-12 p-3 d-flex flex-column justify-content-between colchoneria-card-body">
                      <h5>{producto.name}</h5>
                      <p className="colchoneria-description">{producto.description}</p>

                      <div className="mb-2 colchoneria-price">
                        {producto.promo_price
                          ? <>
                              <span className="text-muted text-decoration-line-through me-2">
                                €{(producto.price + (MEASURE_ADJUST[selectedMeasure] ?? 0)).toFixed(2)}
                              </span>
                              <span className="fw-bold text-success">
                                €{(producto.promo_price + (MEASURE_ADJUST[selectedMeasure] ?? 0)).toFixed(2)}
                              </span>
                            </>
                          : <span className="fw-bold">
                              €{(producto.price + (MEASURE_ADJUST[selectedMeasure] ?? 0)).toFixed(2)}
                            </span>
                        }
                      </div>

                      {/* Selección de medidas */}
                      <div className="d-flex gap-2 mb-2">
                        {Object.keys(MEASURE_ADJUST).map((m) => (
                          <button
                            key={m}
                            className={`btn btn-sm ${selectedMeasure === m ? "btn-primary" : "btn-outline-primary"}`}
                            onClick={() => setSelectedMeasure(m)}
                          >
                            {m}
                          </button>
                        ))}
                      </div>

                      {/* Acciones */}
                      <div className="d-flex justify-content-between">
                        <div className="d-flex gap-2">
                          <button
                            className={`btn btn-sm ${favoritos.includes(producto.id) ? "btn-danger" : "btn-outline-secondary"}`}
                            onClick={() => toggleFavorito(producto.id)}
                          >
                            ❤️
                          </button>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleAddToCart(producto, selectedMeasure)}
                          >
                            Añadir al carrito
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

      </div>

      {/* Modal de autenticación */}
      {authModalOpen && <AuthModal show={authModalOpen} onClose={() => setAuthModalOpen(false)} />}
    </section>
  );
}
