import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { useCart } from "../Context/Carrito/CartContext";
import { useAuth } from "../Context/AuthContext";
import { getImageUrl } from "../services/api";

import {
  getFeaturedProductsByCategory,
  getCategories,
  getFavorites,
  addFavorite,
  removeFavorite,
} from "../services/api";

import { toast } from "react-hot-toast";
import "bootstrap/dist/css/bootstrap.min.css";
import * as bootstrap from "bootstrap";

import "../css/main.css";
import AuthModal from "./LoginModal";

// 🔹 Calcula precio aproximado en otras tiendas
const getStorePrice = (price) => {
  if (price < 50) return price + 10;
  if (price < 100) return price + 20;
  if (price < 150) return price + 30;
  if (price < 200) return price + 40;
  if (price < 250) return price + 50;
  return price + 60;
};

export default function Main() {
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // 🔹 Inicialización AOS + tooltips
  useEffect(() => {
    AOS.init({ duration: 800 });
    const tooltipEls = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipEls.forEach((el) => new bootstrap.Tooltip(el));
  }, [productos]);

  // 🔹 Carga categorías + productos destacados
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const catRes = await getCategories();
        if (!catRes.success) return;
        setCategorias(catRes.data);

        const prodRes = await getFeaturedProductsByCategory();
        if (!prodRes.success) return;

        let productosTemp = [];
        prodRes.data.data.forEach((cat) => {
          productosTemp.push(...cat.products.slice(0, 2));
        });

        if (productosTemp.length < 16) {
          const restantes = prodRes.data.data
            .flatMap((c) => c.products)
            .filter((p) => !productosTemp.some((pt) => pt.id === p.id));

          productosTemp.push(...restantes.slice(0, 16 - productosTemp.length));
        }
  
        setProductos(productosTemp.slice(0, 16));
        console.log("Productos destacados cargados:", productosTemp);
      } catch (err) {
        console.error("Error cargando productos:", err);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  // 🔹 Carga favoritos
  useEffect(() => {
    const fetchFavs = async () => {
      const token = localStorage.getItem("token");
      const userStored = JSON.parse(localStorage.getItem("user") || "null");

      if (!token || !userStored?.id) {
        setFavoritos([]);
        return;
      }

      try {
        const res = await getFavorites();
        if (res.success && Array.isArray(res.data)) {
          setFavoritos(res.data.map((f) => f.product_id));
        } else {
          setFavoritos([]);
        }
      } catch (err) {
        console.error("Error cargando favoritos:", err);
        setFavoritos([]);
      }
    };

    fetchFavs();
  }, []);

  // 🔹 Toggle favorito
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
        if (res.success) {
          setFavoritos(favoritos.filter((id) => id !== productId));
        } else {
          toast.error(res.error || "Error al eliminar favorito");
        }
      } else {
        const res = await addFavorite(productId);
        if (res.success) {
          setFavoritos([...favoritos, productId]);
        } else {
          toast.error(res.error || "Error al añadir favorito");
        }
      }
    } catch (err) {
      console.error("Error al actualizar favoritos:", err);
      toast.error("Error al actualizar favoritos");
    }
  };

  // 🔹 Añadir al carrito
  const handleAddToCart = async (producto) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    try {
      await addToCart(
        {
          id: producto.id,
          name: producto.name,
          price: producto.promo_price ?? producto.price,
          promo_price: producto.promo_price,
          image: producto.image,
        },
        1
      );
    } catch (err) {
      console.error("Error al añadir al carrito:", err);
      toast.error("No se pudo añadir al carrito");
    }
  };

  return (
    <section
      className="productos-destacados py-5"
      style={{ background: "linear-gradient(135deg, #0a3d0dff, #eef3eeff)" }}
    >
      <div className="container-md">
        <h2
          className="text-center my-5 py-4 fw-bold"
          style={{ color: "#ffd900ff" }}
        >
          Productos Destacados
        </h2>

        {loading && (
          <p className="text-white text-center py-5">Cargando productos...</p>
        )}

        <div className="row g-4">
          {!loading && productos.length === 0 && (
            <p className="text-center text-white mt-5">
              No se encontraron productos.
            </p>
          )}

          {productos.map((producto, idx) => (
            <div
              className="col-6 col-md-4 col-lg-3"
              key={producto.id}
              data-aos="fade-up"
              data-aos-delay={idx * 100}
            >
              <div
                className="card h-100 shadow-lg border-0 position-relative"
                style={{ borderRadius: "16px", overflow: "hidden" }}
              >
                {/* ❤️ Favoritos */}
                <div className="position-absolute top-0 end-0 m-2 z-3">
                  <button
                    className={`btn btn-light btn-sm rounded-circle ${
                      favoritos.includes(producto.id)
                        ? "text-danger"
                        : "text-secondary"
                    }`}
                    onClick={() => toggleFavorito(producto.id)}
                  >
                    ❤️
                  </button>
                </div>

                {/* 🏷 Badge Oferta */}
                {producto.promo_price && (
                  <div className="position-absolute top-0 start-0 m-2 z-3">
                    <span className="badge bg-danger">Oferta</span>
                  </div>
                )}

                {/* 🖼 Carousel */}
                <div
                  id={`carousel-${producto.id}`}
                  className="carousel slide position-relative"
                  data-bs-ride="carousel"
                  data-bs-interval="3000"
                >
                  <div className="carousel-inner">
                    {producto.images?.length > 0 ? (
  producto.images.map((img, idxImg) => {
    const url = getImageUrl(img);

    return (
      <div
        className={`carousel-item ${idxImg === 0 ? "active" : ""}`}
        key={idxImg}
      >
        <div className="position-relative">
          <img
            src={url}
            onError={(e) => (e.target.src = "/images/default-product.jpg")}
            className="d-block w-100"
            alt={producto.name}
            style={{
              height: "233px",
              objectFit: "cover",
              width: "110%",
              objectPosition: "center 70%",
            }}
          />

          <Link
            to={`/producto/${producto.id}`}
            className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center text-white text-decoration-none overlay-hover"
          >
            Ver producto
          </Link>
        </div>
      </div>
    );
  })
) : (
  <div className="carousel-item active">
    <img
      src="/images/default-product.jpg"
      className="d-block w-100"
      alt={producto.name}
      style={{
        height: "300px",
        objectFit: "cover",
      }}
    />
  </div>
)}

                  </div>

                  {/* Controles solo si más de 1 imagen */}
                  {producto.images?.length > 1 && (
                    <>
                      <button
                        className="carousel-control-prev"
                        type="button"
                        data-bs-target={`#carousel-${producto.id}`}
                        data-bs-slide="prev"
                      >
                        <span
                          className="carousel-control-prev-icon"
                          aria-hidden="true"
                        ></span>
                      </button>
                      <button
                        className="carousel-control-next"
                        type="button"
                        data-bs-target={`#carousel-${producto.id}`}
                        data-bs-slide="next"
                      >
                        <span
                          className="carousel-control-next-icon"
                          aria-hidden="true"
                        ></span>
                      </button>
                    </>
                  )}
                </div>

                {/* 📦 Info producto */}
                <div className="card-body text-center bg-white d-flex flex-column justify-content-between">
                  <h5 className="card-title">{producto.name}</h5>

                  <div className="mb-2">
                    {producto.promo_price ? (
                      <>
                        <span className="text-muted text-decoration-line-through me-2">
                          €{producto.price?.toFixed(2) ?? "0.00"}
                        </span>
                        <span className="fw-bold text-success">
                          €{producto.promo_price?.toFixed(2) ?? "0.00"}
                        </span>
                      </>
                    ) : (
                      <span className="fw-bold">
                        €{producto.price?.toFixed(2) ?? "0.00"}
                      </span>
                    )}

                    <div className="store-price">
                      Precio en otras tiendas:{" "}
                      <span className="store-price-value">
                        €
                        {getStorePrice(
                          producto.price ?? producto.promo_price ?? 0
                        ).toFixed(2)}
                      </span>
                      <span
                        data-bs-toggle="tooltip"
                        title="En Decora10 siempre más barato"
                        style={{ cursor: "pointer", marginLeft: "4px" }}
                      >
                        ℹ️
                      </span>
                    </div>
                  </div>

                  <div className="d-flex flex-column gap-2">
                    <Link
                      to={`/producto/${producto.id}`}
                      className="btn btn-outline-success"
                    >
                      Ver producto
                    </Link>
                    <button
                      className="btn btn-success"
                      onClick={() => handleAddToCart(producto)}
                    >
                      Añadir al carrito
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-5">
          <Link
            to="/tienda"
            className="btn fw-bold px-4 py-2"
            style={{
              background: "linear-gradient(135deg, #2e7d32, #81c784)",
              color: "#fff",
              borderRadius: "8px",
              border: "none",
            }}
          >
            Ver todos los productos
          </Link>
        </div>
      </div>

      {/* Modal Auth */}
      {authModalOpen && (
        <AuthModal
          show={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
        />
      )}
    </section>
  );
}
