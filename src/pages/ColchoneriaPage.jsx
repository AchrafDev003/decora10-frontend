    // src/Pages/ColchoneriaPage.jsx
    import { useEffect, useState } from "react";
    import { Link } from "react-router-dom";
    import AOS from "aos";
    import "aos/dist/aos.css";
    import { useCart } from "../Context/Carrito/CartContext";
    import { useAuth } from "../Context/AuthContext";
    import { getFavorites, addFavorite, removeFavorite } from "../services/api";
    import { getColchoneriaHighlights2 } from "../services/api"; // 🔹 nueva función
    import { toast } from "react-hot-toast";
    import 'bootstrap/dist/css/bootstrap.min.css';
    import 'bootstrap/dist/js/bootstrap.bundle.min.js';
    import "../css/colchoneria.css";
    import AuthModal from "../components/LoginModal";
    import logoColchon from "../assets/img/colchon10.png";

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
    const { addToCart } = useCart();

    const [productos, setProductos] = useState([]);
    const [favoritos, setFavoritos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [selectedMeasure, setSelectedMeasure] = useState("135x190");

    // Paginación
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => { AOS.init({ duration: 800 }); }, []);

    // 🔹 Fetch productos con paginación
    useEffect(() => {
        const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getColchoneriaHighlights2();
            if (res.success) {
            setProductos(res.data?.data || []);
            setTotalPages(res.data?.last_page || 1);
            }
        } catch (err) { console.error(err); }
        setLoading(false);
        };
        fetchData();
    }, [page]);

    // 🔹 Favoritos
    useEffect(() => {
        const fetchFavs = async () => {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user") || "null");
        if (!token || !user?.id) return;
        try {
            const res = await getFavorites();
            if (res.success && Array.isArray(res.data)) setFavoritos(res.data.map(f => f.product_id));
        } catch (err) { console.error(err); }
        };
        fetchFavs();
    }, []);

    const toggleFavorito = async (productId) => {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user") || "null");
        if (!token || !user?.id) { setAuthModalOpen(true); return; }
        try {
        if (favoritos.includes(productId)) {
            const res = await removeFavorite(productId);
            if (res.success) setFavoritos(favoritos.filter(id => id !== productId));
        } else {
            const res = await addFavorite(productId);
            if (res.success) setFavoritos([...favoritos, productId]);
        }
        } catch (err) { toast.error("Error al actualizar favoritos"); }
    };

    const handleAddToCart = async (producto, measure) => {
  if (!user) { 
    setAuthModalOpen(true); // 🔹 Abrir modal si no hay usuario
    return; 
  }

  const basePrice = producto.price ?? 0;
  const finalPrice = basePrice + (MEASURE_ADJUST[measure] ?? 0);
  try {
    await addToCart({
      id: producto.id,
      name: producto.name,
      price: finalPrice,
      promo_price: finalPrice,
      image: producto.images?.[0]?.image_path ?? "/assets/img/placeholder.jpg",
      measure,
    }, 1);
    toast.success("Añadido al carrito");
  } catch (err) {
    toast.error("No se pudo añadir al carrito");
  }
};

    if (loading) {
        return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Cargando...</span>
            </div>
        </div>
        );
    }

   return (
  <section className="cp-section">
    <div className="container-fluid px-0">
      {/* Header */}
      <div className="cp-header text-center">
        <img src={logoColchon} alt="Logo Decora10" className="cp-logo mb-3"/>
        <h1 className="cp-title">Colchonerí@10</h1>
        <p className="cp-subtitle">
          Decora10 ha hecho el mejor negocio a tu lugar con los mejores proveedores para darte la calidad al mejor precio.
        </p>
      </div>

      {/* Productos */}
      <div className="row g-4 cp-row">
        {productos.map((producto, i) => (
          <div key={producto.id} className="col-md-4" data-aos="fade-up" data-aos-delay={i * 100}>
            <div className="card cp-card">

              {/* Carousel */}
              <div className="position-relative overflow-hidden">
                <div id={`carousel-${producto.id}`} className="carousel slide" data-bs-ride="carousel">

                  {/* Indicators */}
                  {producto.images?.length > 1 && (
                    <div className="carousel-indicators">
                      {producto.images.map((_, idxImg) => (
                        <button
                          key={idxImg}
                          type="button"
                          data-bs-target={`#carousel-${producto.id}`}
                          data-bs-slide-to={idxImg}
                          className={idxImg === 0 ? "active" : ""}
                          aria-current={idxImg === 0 ? "true" : undefined}
                          aria-label={`Slide ${idxImg + 1}`}
                        ></button>
                      ))}
                    </div>
                  )}

                  <div className="carousel-inner">
                    {producto.images?.length > 0 ? producto.images.map((img, idxImg) => {
                      const url = img.image_path.startsWith("http") 
                        ? img.image_path 
                        : `${import.meta.env.VITE_API_URL}/${img.image_path}`;
                      return (
                        <div className={`carousel-item ${idxImg === 0 ? "active" : ""}`} key={idxImg}>
                          <div className="position-relative">
                            <img src={url} className="d-block w-100 cp-img" alt={producto.name} />
                            <Link to={`/producto/${producto.id}`} className="cp-overlay-link">Ver producto</Link>
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="carousel-item active">
                        <div className="position-relative">
                          <img src="/assets/img/placeholder.jpg" className="d-block w-100 cp-img" alt={producto.name} />
                          <Link to={`/producto/${producto.id}`} className="cp-overlay-link">Ver producto</Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Paleta de color */}
                <div className="cp-palette" style={{ background: MARCA_COLORS[producto.brand] }} />
              </div>

              {/* Contenido de la tarjeta */}
              <div className="cp-card-body">
                <h5 className="text-truncate">{producto.name}</h5>
                <p className="cp-description">{producto.description}</p>

                <div className="mb-2 cp-price">
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

                <div className="d-flex gap-2 mb-2 cp-measures">
                  {Object.keys(MEASURE_ADJUST).map(m => (
                    <button
                      key={m}
                      className={`btn btn-sm ${selectedMeasure === m ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => setSelectedMeasure(m)}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                <div className="d-flex justify-content-between">
                  <button
                    className={`btn btn-sm ${favoritos.includes(producto.id) ? "btn-danger" : "btn-outline-secondary"}`}
                    onClick={() => toggleFavorito(producto.id)}
                  >
                    ❤️
                  </button>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => {
                      if (!user) return setAuthModalOpen(true);
                      handleAddToCart(producto, selectedMeasure);
                    }}
                  >
                    Añadir al carrito
                  </button>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Paginación */}
      <div className="d-flex justify-content-center mt-4">
        <button className="btn btn-outline-primary me-2" disabled={page <= 1} onClick={() => setPage(page - 1)}>Anterior</button>
        <span className="align-self-center mx-2">Página {page} de {totalPages}</span>
        <button className="btn btn-outline-primary ms-2" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Siguiente</button>
      </div>

    </div>

    {/* Modal de login */}
    {authModalOpen && <AuthModal show={authModalOpen} onClose={() => setAuthModalOpen(false)} />}
  </section>
);
}