// src/Pages/ColchoneriaPage.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { useCart } from "../Context/Carrito/CartContext";
import { useAuth } from "../Context/AuthContext";
import {
  getFavorites,
  addToCart as apiAddToCart,
  addFavorite,
  removeFavorite,
  getImageUrl,
  getColchoneriaHighlights2,
} from "../services/api";
import { toast } from "react-hot-toast";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../css/colchoneria.css";
import AuthModal from "../Components/LoginModal";
import logoColchon from "/images/colchon10.png";

const PLACEHOLDER_IMG = "/images/placeholder.png";

const MARCA_COLORS = {
  Biolife: "#d32f2f",
  Dupen: "#000000",
  Flex: "#1976d2",
};

const MEASURE_ADJUST = {
  "90x190": -100,
  "135x190": 0,
  "150x190": 80,
};

export default function ColchoneriaPage() {
  const { user } = useAuth();
  const { fetchCart } = useCart();

  const [productos, setProductos] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedMeasures, setSelectedMeasures] = useState({});

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Inicializar AOS
  useEffect(() => {
    AOS.init({ duration: 800 });
  }, []);

  // Fetch productos
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getColchoneriaHighlights2(page);
        if (res.success) {
          setProductos(res.data?.data || []);
          setTotalPages(res.data?.last_page || 1);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchData();
  }, [page]);

  // Fetch favoritos
  useEffect(() => {
    const fetchFavs = async () => {
      if (!user?.id) return;
      try {
        const res = await getFavorites();
        if (res.success && Array.isArray(res.data)) {
          setFavoritos(res.data.map((f) => f.product_id));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchFavs();
  }, [user]);

  // Toggle favorito
  const toggleFavorito = async (productId) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    try {
      if (favoritos.includes(productId)) {
        const res = await removeFavorite(productId);
        if (res.success)
          setFavoritos((prev) => prev.filter((id) => id !== productId));
      } else {
        const res = await addFavorite(productId);
        if (res.success) setFavoritos((prev) => [...prev, productId]);
      }
    } catch {
      toast.error("Error al actualizar favoritos");
    }
  };

  // Añadir al carrito
  const handleAddToCart = async (producto) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    const type = producto.isPack ? "pack" : "product";
    const measure = selectedMeasures[producto.id] ?? "135x190";

    try {
      const res = await apiAddToCart({
        item_id: producto.id,
        quantity: 1,
        type,
        measure: producto.category?.id === 76 ? measure : null,
      });

      if (!res) {
        toast.error("No se pudo añadir al carrito (respuesta vacía)");
        return;
      }

      if (res.success) {
        await fetchCart();
        toast.success("Producto añadido al carrito");
      } else {
        toast.error(res.message || "Producto inválido");
      }
    } catch (err) {
      console.error(err);
      toast.error("No se pudo añadir al carrito");
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-success" role="status" />
      </div>
    );
  }

  return (
    <section className="cp-section">
      <div className="container-fluid px-0">
        {/* Header */}
        <div className="cp-header text-center">
          <img src={logoColchon} alt="Logo Decora10" className="cp-logo mb-3" />
          <h1 className="cp-title">Colchonerí@10</h1>
          <p className="cp-subtitle">
            Decora10 trae los mejores proveedores para darte calidad al mejor precio.
          </p>
        </div>

        {/* Productos */}
        <div className="row g-4 cp-row">
          {productos.map((producto, i) => {
            const measure = selectedMeasures[producto.id] ?? "135x190";
            const basePrice = producto.promo_price ?? producto.price ?? 0;
            const finalPrice = basePrice + (MEASURE_ADJUST[measure] ?? 0);

            return (
              <div
                key={producto.id}
                className="col-md-4"
                data-aos="fade-up"
                data-aos-delay={i * 100}
              >
                <div className="card cp-card">
                  {/* Carousel */}
                  <div className="position-relative overflow-hidden">
                    <div
                      id={`carousel-${producto.id}`}
                      className="carousel slide"
                      data-bs-ride="carousel"
                    >
                      <div className="carousel-inner">
                        {(producto.images?.length ? producto.images : [{}]).map(
                          (img, idx) => (
                            <div
                              key={idx}
                              className={`carousel-item ${idx === 0 ? "active" : ""}`}
                            >
                              <img
                                src={
                                  img.image_path ? getImageUrl(img.image_path) : PLACEHOLDER_IMG
                                }
                                className="d-block w-100 cp-img"
                                alt={producto.name}
                              />
                              <Link
                                to={`/producto/${producto.id}`}
                                className="cp-overlay-link"
                              >
                                Ver producto
                              </Link>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                    <div
                      className="cp-palette"
                      style={{ background: MARCA_COLORS[producto.brand] }}
                    />
                  </div>

                  {/* Card body */}
                  <div className="cp-card-body">
                    <h5 className="text-truncate">{producto.name}</h5>
                    <p className="cp-description">{producto.description}</p>
                    <div className="mb-2 cp-price">
                      <span className="fw-bold text-success">
                        €{finalPrice.toFixed(2)}
                      </span>
                    </div>

                    {/* Medidas */}
                    <div className="d-flex gap-2 mb-2 cp-measures">
                      {Object.keys(MEASURE_ADJUST).map((m) => (
                        <button
                          key={m}
                          className={`btn btn-sm ${
                            measure === m ? "btn-primary" : "btn-outline-primary"
                          }`}
                          onClick={() =>
                            setSelectedMeasures((prev) => ({ ...prev, [producto.id]: m }))
                          }
                        >
                          {m}
                        </button>
                      ))}
                    </div>

                    <div className="d-flex justify-content-between">
                      <button
                        className={`btn btn-sm ${
                          favoritos.includes(producto.id)
                            ? "btn-danger"
                            : "btn-outline-secondary"
                        }`}
                        onClick={() => toggleFavorito(producto.id)}
                      >
                        ❤️
                      </button>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleAddToCart(producto)}
                      >
                        Añadir al carrito
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Paginación */}
        <div className="d-flex justify-content-center mt-4">
          <button
            className="btn btn-outline-primary me-2"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Anterior
          </button>
          <span className="align-self-center mx-2">
            Página {page} de {totalPages}
          </span>
          <button
            className="btn btn-outline-primary ms-2"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Siguiente
          </button>
        </div>
      </div>

      {authModalOpen && (
        <AuthModal show={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      )}
    </section>
  );
}
