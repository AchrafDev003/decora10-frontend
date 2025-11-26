// src/components/Colchoneria.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { useCart } from "../Context/Carrito/CartContext";
import { useAuth } from "../Context/AuthContext";
import { getColchoneriaHighlights, getFavorites, addFavorite, removeFavorite } from "../services/api";
import { toast } from "react-hot-toast";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "../css/colchoneria.css";
import AuthModal from "./LoginModal";
import logoColchon from "/img/colchon10.png"; // importa el logo

// ...

<img 
  src={logoColchon} 
  alt="Logo Decora10" 
  className="colchoneria-logo mb-3"
/>


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

export default function Colchoneria() {
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [productos, setProductos] = useState({});
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedMeasure, setSelectedMeasure] = useState("135x190");

  useEffect(() => { AOS.init({ duration: 800 }); }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getColchoneriaHighlights();
        if (res.success) {
          const marcas = {};
          res.data?.data?.forEach(brand => { marcas[brand.brand] = brand.products; });
          setProductos(marcas);
        }
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchData();
  }, []);

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
    if (!user) { toast.error("Debes iniciar sesión"); return; }
    const basePrice = producto.price ?? 0;
    const finalPrice = basePrice + (MEASURE_ADJUST[measure] ?? 0);
    try {
      await addToCart({
        id: producto.id,
        name: producto.name,
        price: finalPrice,
        promo_price: finalPrice,
        image: producto.images?.[0]?.image_path ?? "/img/ITEM Home.jpg",
        measure,
      }, 1);
      toast.success("Añadido al carrito");
    } catch (err) { toast.error("No se pudo añadir al carrito"); }
  };

  return (
    <section className="colchoneria-section ">
      <div className="container-fluid px-0">
        <div className="colchoneria-header text-center">
  {/* Logo encima del título */}
  <img 
  src={logoColchon} 
  alt="Logo Decora10" 
  className="colchoneria-logo mb-3"
/>
  <h1 className="colchoneria-title">Colchonerí@10</h1>
  <p className="colchoneria-subtitle">
    Decora10 ha hecho el mejor negocio a tu lugar con los mejores Provedores para darte la calidad con lo más barato precio que hay.
  </p>
</div>


        {loading && <p className="text-center">Cargando productos...</p>}

        {Object.entries(productos).map(([brand, items], idx) => (
          <div key={brand} className="colchoneria-rincon mb-5 position-relative">

            {/* Título lateral */}
            <h3 className={`colchoneria-brand-title ${brand.toLowerCase()}`}>
              {brand}
            </h3>

            {/* Productos */}
            <div className="row g-4 colchoneria-row">
              {items.map((producto, i) => (
                <div key={producto.id}  data-aos="fade-up" data-aos-delay={i*100}>
                  <div className="card colchoneria-card">

                    {/* Carousel */}
                    <div className="col-6 p-0">
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
                            const url = img.image_path.startsWith("http") ? img.image_path : `${import.meta.env.VITE_API_URL}/${img.image_path}`;
                            return (
                              <div className={`carousel-item ${idxImg === 0 ? "active" : ""}`} key={idxImg}>
                                <div className="position-relative">
                                  <img src={url} className="d-block w-100 colchoneria-img" alt={producto.name} />
                                  <Link to={`/producto/${producto.id}`} className="overlay-hover-link">Ver producto</Link>
                                </div>
                              </div>
                            );
                          }) : (
                            <div className="carousel-item active">
                              <img src="/img/ITEM Home.jpg" className="d-block w-100 colchoneria-img" alt={producto.name} />
                              <Link to={`/producto/${producto.id}`} className="overlay-hover-link">Ver producto</Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Paleta */}
                    <div className="colchoneria-palette" style={{ background: MARCA_COLORS[brand] }} />

                    {/* Contenido */}
                    <div className="col-5 p-3 d-flex flex-column justify-content-between colchoneria-card-body">
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


                      <div className="d-flex gap-2 mb-2">
                        {Object.keys(MEASURE_ADJUST).map(m => (
                          <button key={m} className={`btn btn-sm ${selectedMeasure === m ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setSelectedMeasure(m)}>
                            {m}
                          </button>
                        ))}
                      </div>

                      <div className="d-flex justify-content-between">
                        <div className="d-flex gap-2">
                          <button className={`btn btn-sm ${favoritos.includes(producto.id) ? "btn-danger" : "btn-outline-secondary"}`} onClick={() => toggleFavorito(producto.id)}>❤️</button>
                          <button className="btn btn-success btn-sm" onClick={() => handleAddToCart(producto, selectedMeasure)}>Añadir al carrito</button>
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

      {authModalOpen && <AuthModal show={authModalOpen} onClose={() => setAuthModalOpen(false)} />}
    </section>
  );
}
