// src/pages/Shop.jsx
import React, { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  getCategories,
  removeFavorite,
  addFavorite,
  getFavorites,
  getFeaturedProductsByCategory2,
  getColchoneriaHighlights2,
  getProductsFiltrados,
  getImageUrl
} from "../services/api";
import "bootstrap/dist/css/bootstrap.min.css";
import * as bootstrap from "bootstrap";

import AOS from "aos";
import "aos/dist/aos.css";
import "../css/shop.css";
import { useCart } from "../Context/Carrito/CartContext";
import AuthModal from "../Components/LoginModal";

const PLACEHOLDER_IMG = "/images/placeholder.png";

export default function Shop() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // -------------------------------
  // Cargar categorías
  // -------------------------------
  useEffect(() => {
    window.scrollTo(0, 0); // 🔥 Fuerza a empezar arriba
    (async () => {
      try {
        const res = await getCategories();
        if (res?.success && Array.isArray(res.data)) setCategorias(res.data);
      } catch (err) {
        console.error(err);
        toast.error("No se pudieron cargar las categorías");
      }
    })();
  }, []);
  useEffect(() => {
  window.scrollTo({ top: 0, behavior: "smooth" });
}, [location.pathname, location.search]);

  // -------------------------------
  // Inicializar AOS y tooltips
  // -------------------------------
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    const tooltipTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.forEach((t) => new window.bootstrap.Tooltip(t));
  }, [productos]);

  // -------------------------------
  // Cargar favoritos
  // -------------------------------
  useEffect(() => {
    if (!user?.id) return setFavoritos([]);
    (async () => {
      try {
        const res = await getFavorites();
        setFavoritos(res?.success ? res.data.data.map((f) => f.product_id) : []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [user]);

  // -------------------------------
  // Precio en otras tiendas
  // -------------------------------
  const getStorePrice = (price) => {
    if (price < 50) return price + 10;
    if (price < 100) return price + 20;
    if (price < 150) return price + 30;
    if (price < 200) return price + 40;
    if (price < 250) return price + 50;
    return price + 60;
  };

  // -------------------------------
  // Cargar productos según categoría / búsqueda / paginación
  // -------------------------------
  const fetchProductos = async (page = 1, category = "") => {
    if (loading) return;
    setLoading(true);

    try {
      let res;
      const params = {
        page,
        search: searchTerm || "",
        sort: sortOption || "",
        ...(category && { category_id: category }),
      };

      if (!category && !searchTerm && !sortOption) {
        // Entrada desde header → productos generales
        res = await getFeaturedProductsByCategory2({ page });
      } else if (category === "76") {
        // Colchonería → endpoint especial
        res = await getColchoneriaHighlights2({ page });
      } else {
        // Búsqueda o filtro por categoría
        res = await getProductsFiltrados(params);
      }

      
      if (res?.success) {
  const productosData = Array.isArray(res.data.data)
  ? res.data.data
  : Object.values(res.data.data);

setProductos(productosData);
setCurrentPage(Number(res.data.current_page) || 1);
setLastPage(Number(res.data.last_page) || 1);

}
 else {
        setProductos([]);
        toast.error("No se pudieron cargar productos");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------
  // Detectar categoría desde URL
  // -------------------------------
 useEffect(() => {
   window.scrollTo(0, 0); // 🔥 Fuerza a empezar arriba
  const categoryFromUrl = searchParams.get("category") || "";
  setSelectedCategory(categoryFromUrl);
  fetchProductos(1, categoryFromUrl);
}, [searchParams, searchTerm, sortOption]);


  // -------------------------------
  // Ejecutar búsqueda / sort / category change
  // -------------------------------
 

  // -------------------------------
  // Favoritos
  // -------------------------------
  const toggleFavorito = async (productId) => {
    if (!user?.id) return setAuthModalOpen(true);

    try {
      if (favoritos.includes(productId)) {
        const res = await removeFavorite(productId);
        if (res.success) setFavoritos(favoritos.filter((id) => id !== productId));
      } else {
        const res = await addFavorite(productId);
        if (res.success) setFavoritos([...favoritos, productId]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al actualizar favoritos");
    }
  };

  // -------------------------------
  // Carrito
  // -------------------------------
  const handleAddToCart = async (producto) => {
    if (!user) return setAuthModalOpen(true);

    try {
      await addToCart(
        {
          id: producto.id,
          name: producto.name,
          price: producto.promo_price ?? producto.price,
          promo_price: producto.promo_price,
          image: producto.images?.[0]?.image_path || PLACEHOLDER_IMG,
        },
        1
      );
      toast.success("Producto añadido al carrito");
    } catch (err) {
      console.error(err);
      toast.error("No se pudo añadir al carrito");
    }
  };

  // -------------------------------
  // Paginación
  // -------------------------------
  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    let start = Math.max(currentPage - 2, 1);
    let end = Math.min(start + maxPagesToShow - 1, lastPage);
    start = Math.max(end - maxPagesToShow + 1, 1);
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > lastPage) return;
    fetchProductos(page, selectedCategory);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAuthClose = () => setAuthModalOpen(false);
  const handleClearFilter = () => {
    setSelectedCategory("");
    setSearchTerm("");
    setSortOption("");
    navigate("/tienda");
  };

  // -------------------------------
  // Render
  // -------------------------------
  return (
    <div className="container-fluid shop-page">
      {/* Categorías */}
      <div className="categories-wrapper mb-4">
        {categorias.map((cat) => (
          <div
            key={cat.id}
            className={`category-card ${selectedCategory === String(cat.id) ? "active" : ""}`}
            onClick={() => {
  setSelectedCategory(String(cat.id));
  if (cat.name.toLowerCase() === "colchonería") {
    navigate("/colchoneria");
  } else {
    navigate(`/tienda?category=${cat.id}`);
  }
}}

            style={{ cursor: "pointer" }}
          >   
            <img
              src={getImageUrl(cat.image_url) || PLACEHOLDER_IMG}
              alt={cat.name}
              className="category-img"
              onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMG)}
            />
            <span className="category-name p-3">{cat.name}</span>
          </div>
        ))}

        
          <button className="btn btn-outline-secondary ms-2" onClick={handleClearFilter}>
            Limpiar filtros
          </button>
        
      </div>

      {/* Filtros */}
      <div className="row mb-4 align-items-center">
        <div className="col-md-4 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-4 mb-2">
          <select
            className="form-select"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="">Ordenar por</option>
            <option value="precio_asc">Precio ↑</option>
            <option value="precio_desc">Precio ↓</option>
            <option value="nombre_asc">Nombre A-Z</option>
            <option value="nombre_desc">Nombre Z-A</option>
          </select>
        </div>
      </div>

      {/* Productos */}
      {productos.length === 0 && !loading && (
        <p className="text-center text-muted">No se encontraron productos</p>
      )}

      <div className="row g-4">
        {productos.map((producto, idx) => (
          <div
            className="col-6 col-md-4 col-lg-3"
            key={producto.id}
            data-aos="fade-up"
            data-aos-delay={idx * 50}
          >
            <div className="product-card card h-100 shadow-lg border-0 position-relative">
              {/* Favorito */}
              <div className="position-absolute top-0 end-0 m-2 z-3">
                <button
                  className={`btn btn-light btn-sm rounded-circle ${
                    favoritos.includes(producto.id) ? "text-danger" : "text-secondary"
                  }`}
                  onClick={() => toggleFavorito(producto.id)}
                >
                  ❤️
                </button>
              </div>

              {/* Oferta */}
              {producto.promo_price && (
                <div className="position-absolute top-0 start-0 m-2 z-3">
                  <span className="badge bg-danger">Oferta</span>
                </div>
              )}

              {/* Imagen */}
              <div className="img-wrapper position-relative">
                {producto.images?.length > 0 ? (
                  <div
                    id={`carousel-${producto.id}`}
                    className="carousel slide"
                    data-bs-ride="carousel"
                  >
                    <div className="carousel-inner">
                      {producto.images.map((img, idx) => (
                        <div key={img.id} className={`carousel-item ${idx === 0 ? "active" : ""}`}>
                          <img
                            src={getImageUrl(img.image_path) || PLACEHOLDER_IMG}
                            className="d-block w-100 "
                            alt={producto.name}
                            onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMG)}
                          />
                        </div>
                      ))}
                    </div>
                    <button
                      className="carousel-control-prev"
                      type="button"
                      data-bs-target={`#carousel-${producto.id}`}
                      data-bs-slide="prev"
                    >
                      <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                    </button>
                    <button
                      className="carousel-control-next"
                      type="button"
                      data-bs-target={`#carousel-${producto.id}`}
                      data-bs-slide="next"
                    >
                      <span className="carousel-control-next-icon" aria-hidden="true"></span>
                    </button>
                  </div>
                ) : (
                  <img src={PLACEHOLDER_IMG} alt={producto.name} className="d-block w-100" />
                )}
                <Link to={`/producto/${producto.id}`} className="overlay-link">
                  Ver producto
                </Link>
              </div>

              {/* Info */}
              <div className="card-body text-center bg-white d-flex flex-column justify-content-between">
                <h5 className="card-title">{producto.name}</h5>
                <div className="mb-2">
                  {producto.promo_price ? (
                    <>
                      <span className="text-muted text-decoration-line-through me-2">
                        €{producto.price?.toFixed(2)}
                      </span>
                      <span className="fw-bold text-success">
                        €{producto.promo_price?.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="fw-bold">€{producto.price?.toFixed(2)}</span>
                  )}
                  <div className="store-price mt-1 small text-muted">
                    En otras tiendas: €
                    {getStorePrice(producto.price ?? producto.promo_price ?? 0).toFixed(2)}
                  </div>
                </div>
                <div className="d-flex flex-column gap-2">
                  <Link to={`/producto/${producto.id}`} className="btn btn-outline-success">
                    Ver producto
                  </Link>
                  <button className="btn btn-success" onClick={() => handleAddToCart(producto)}>
                    Añadir al carrito
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Paginación */}
      {lastPage > 1 && (
        <nav className="d-flex justify-content-center mt-5">
          <ul className="pagination pagination-modern">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
                «
              </button>
            </li>
            {getPageNumbers().map((p) => (
              <li key={p} className={`page-item ${p === currentPage ? "active" : ""}`}>
                <button className="page-link" onClick={() => handlePageChange(p)}>
                  {p}
                </button>
              </li>
            ))}
            <li className={`page-item ${currentPage === lastPage ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
                »
              </button>
            </li>
          </ul>
        </nav>
      )}

      {loading && (
        <div className="text-center my-4">
          <div className="spinner-border text-success" role="status"></div>
        </div>
      )}

      {authModalOpen && <AuthModal show={authModalOpen} onClose={handleAuthClose} />}
    </div>
  );
}
