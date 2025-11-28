// src/Pages/ProductDetail.jsx
import { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getProductById,
  getReviews,
  createReview,
  addToCart,
  addFavorite,
  removeFavorite,
  getProductsFiltrados,
  getRelatedByFirstWord,
  getImageUrl,
} from "../services/api";
import { useCart } from "../Context/Carrito/CartContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ImageZoom from "../Components/ImageMagnifier";
import LoginModal from "../Components/LoginModal";
import "../css/ProductDetail.css";
import { get } from "react-hook-form";

export default function ProductDetail() {
  const { id } = useParams();
  const { fetchCart } = useCart();
  const scrollRef = useRef(null);

  const [shadow, setShadow] = useState({ left: false, right: true });
  const [producto, setProducto] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedProductsByWord, setRelatedProductsByWord] = useState([]);

  // Medidas de Colchonería
  const MEASURE_ADJUST = { "90x190": -100, "135x190": 0, "150x190": 80 };
  const [selectedMeasure, setSelectedMeasure] = useState("135x190");

  // Fetch producto y reviews
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const prodRes = await getProductById(id);
        if (prodRes.success) setProducto(prodRes.data.data);

        const revRes = await getReviews(id);
        if (revRes.success) setReviews(revRes.data.data || []);
      } catch (error) {
        console.error("Error al cargar producto o reseñas:", error);
        toast.error("Error al cargar la información del producto");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Fetch productos relacionados
  useEffect(() => {
    if (!producto?.category?.id) return;

    const fetchRelated = async () => {
      const res = await getProductsFiltrados({
        category_id: producto.category.id,
        exclude_id: producto.id,
        limit: 6
      });
      if (res.success) setRelatedProducts(res.data.data || []);
    };
    fetchRelated();

    const fetchRelatedByWord = async () => {
      const res = await getRelatedByFirstWord(producto.id);
      if (res.success) setRelatedProductsByWord(res.data.data || []);
    };
    fetchRelatedByWord();
  }, [producto]);

  // Scroll sombra
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const atStart = el.scrollLeft <= 5;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 5;
      setShadow({ left: !atStart, right: !atEnd });
    };

    el.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  // Favoritos
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("favoritos") || "[]");
    setFavoritos(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
  }, [favoritos]);

  const toggleFavorito = async (pid) => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const token = localStorage.getItem("token");
    if (!user || !token) { setShowLoginModal(true); return; }

    if (favoritos.includes(pid)) {
      const res = await removeFavorite(pid);
      if (res.success) setFavoritos((prev) => prev.filter((f) => f !== pid));
    } else {
      const res = await addFavorite(pid);
      if (res.success) setFavoritos((prev) => [...prev, pid]);
    }
  };

  const handleAddToCart = async (producto) => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const token = localStorage.getItem("token");

    if (!user && !token) { setShowLoginModal(true); return; }

    const basePrice = producto.promo_price ?? producto.price ?? 0;
    const finalPrice = producto.category?.id === 76 ? basePrice + (MEASURE_ADJUST[selectedMeasure] ?? 0) : basePrice;

    if (user) {
      const res = await addToCart(producto.id, 1, selectedMeasure, finalPrice);
      if (res.success) {
        await fetchCart();
        toast.success("Producto añadido al carrito");
      } else toast.error(res.error);
      return;
    }

    let localCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const exists = localCart.find((p) => p.product_id === producto.id && p.measure === selectedMeasure);

    if (exists) {
      if (exists.quantity >= 3) { toast.error("Máximo 3 unidades por producto"); return; }
      exists.quantity++;
    } else {
      const firstImage = producto.images?.[0]?.image_path
        ? producto.images[0].image_path.startsWith("http")
          ? producto.images[0].image_path
          : `${import.meta.env.VITE_API_URL}/${producto.images[0].image_path}`
        : "/images/placeholder.png";

      localCart.push({
        product_id: producto.id,
        name: producto.name,
        price: finalPrice,
        quantity: 1,
        image: firstImage,
        measure: selectedMeasure
      });
    }

    localStorage.setItem("cart", JSON.stringify(localCart));
    await fetchCart();
    toast.success("Producto añadido al carrito (guest)");
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1) return toast.error("Selecciona al menos 1 estrella");
    if (comment.trim().length < 5) return toast.error("El comentario debe tener al menos 5 caracteres");

    const user = JSON.parse(localStorage.getItem("user") || "null");
    const token = localStorage.getItem("token");
    if (!user || !token) { setShowLoginModal(true); return; }

    const res = await createReview(id, { rating, comment });
    if (res.success) {
      toast.success("Reseña publicada con éxito");
      setComment(""); setRating(0);
      const revRes = await getReviews(id);
      if (revRes.success) setReviews(revRes.data.data || []);
    }
  };

  if (loading) return <div className="container text-center py-5"><p>Cargando producto...</p></div>;
  if (!producto) return <div className="container text-center py-5"><p>No se encontró el producto.</p></div>;

  // Precio dinámico
  const basePrice = producto.promo_price ?? producto.price ?? 0;
  const finalPrice = producto.category?.id === 76 ? basePrice + (MEASURE_ADJUST[selectedMeasure] ?? 0) : basePrice;

  return (
    <section className="py-5" style={{ background: "linear-gradient(135deg, #d6d31bff, #eef3ee)", minHeight: "100vh" }}>
      <ToastContainer />
      <div className="container-md">
        {/* Imagen + Info */}
        <div className="row g-4 align-items-start flex-column flex-md-row">
          {/* Imagen */}
          <div className="col-12 col-md-7 col-lg-6 text-center">
            <div className="p-3 rounded shadow-lg bg-white">
              {producto.images?.length ? (
                <div id={`carousel-product-${producto.id}`} className="carousel slide" data-bs-ride="carousel" data-bs-interval="3000">
                  <div className="carousel-inner">
                    {producto.images.map((img, idx) => {
                      const url = getImageUrl(img.image_path) || "/images/placeholder.png";
                      return (
                        <div key={idx} className={`carousel-item ${idx === 0 ? "active" : ""}`}>
                          <ImageZoom src={url} alt={producto.name} zoom={2.5} size={250} />
                        </div>
                      );
                    })}
                  </div>

                  {producto.images.length > 1 && (
                    <>
                       {/* Botones prev/next */}
  <button
    className="carousel-control-prev"
    type="button"
    data-bs-target={`#carousel-product-${producto.id}`}
    data-bs-slide="prev"
  >
    <span
      className="carousel-control-prev-icon"
      aria-hidden="true"
      style={{
        filter: "invert(0%)", // negro
        width: "40px",
        height: "40px",
        borderRadius: "75%",
        backgroundColor: "Orange",
        padding: "5px",
      }}
    ></span>
    <span className="visually-hidden">Previous</span>
  </button>

  <button
    className="carousel-control-next"
    type="button"
    data-bs-target={`#carousel-product-${producto.id}`}
    data-bs-slide="next"
  >
    <span
      className="carousel-control-next-icon"
      aria-hidden="true"
      style={{
        filter: "invert(0%)",
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        backgroundColor: "Orange",
        padding: "10px",
      }}
    ></span>
    <span className="visually-hidden">Next</span>
  </button>
                    </>
                  )}
                </div>
              ) : (
                <ImageZoom src={producto.image || "/images/placeholder.png"} alt={producto.name} zoom={2.5} size={250} />
              )}
            </div>
          </div>

          {/* Info */}
          <div className="col-12 col-md-5 col-lg-6 text-center text-md-start">
            <h2 className="fw-bold mb-3 text-dark">{producto.name}</h2>

            {/* Precio */}
            <div className="mb-3">
              {producto.promo_price ? (
                <>
                  <span className="text-muted text-decoration-line-through me-2">€{(producto.price ?? 0).toFixed(2)}</span>
                  <span className="fw-bold text-success fs-4">€{finalPrice.toFixed(2)}</span>
                </>
              ) : (
                <span className="fw-bold fs-4">€{finalPrice.toFixed(2)}</span>
              )}
            </div>

            <p className={`product-description ${showFullDesc ? "expanded" : ""} text-muted mb-2`}>
              {producto.description || "Sin descripción."}
            </p>
            {producto.description && producto.description.length > 200 && (
              <button className="btn btn-link p-0 text-decoration-none text-success fw-bold"
                onClick={() => setShowFullDesc(!showFullDesc)}>
                {showFullDesc ? "Leer menos" : "Leer más"}
              </button>
            )}

            <p className="mb-2"><strong>Categoría:</strong> {producto.category?.name || "N/A"}</p>

            {/* Colchonería medidas */}
            {producto.category?.id === 76 && (
              <div className="mb-3">
                <h6 className="fw-bold">Opciones de medida</h6>
                <div className="d-flex gap-2 flex-wrap">
                  {Object.keys(MEASURE_ADJUST).map((m) => {
                    const priceAdjusted = (producto.promo_price ?? producto.price ?? 0) + MEASURE_ADJUST[m];
                    return (
                      <button
                        key={m}
                        className={`btn btn-sm ${selectedMeasure === m ? "btn-primary" : "btn-outline-primary"}`}
                        onClick={() => setSelectedMeasure(m)}
                      >
                        {m} (€{priceAdjusted.toFixed(2)})
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="d-flex flex-column flex-sm-row gap-3 mt-3 justify-content-center justify-content-md-start">
              <button
                className="btn btn-success px-4 py-2 fw-bold"
                style={{ borderRadius: "10px" }}
                onClick={() => handleAddToCart(producto)}
              >
                🛒 Añadir al carrito
              </button>
              <button
                className={`btn ${favoritos.includes(producto.id) ? "btn-danger" : "btn-outline-danger"} fw-bold`}
                onClick={() => toggleFavorito(producto.id)}
              >
                ❤️ {favoritos.includes(producto.id) ? "Quitar" : "Favorito"}
              </button>
            </div>
          </div>
        </div>

        {/* Reseñas */}
        <div className="mt-5">
          <h4 className="fw-bold mb-3">Reseñas</h4>
          {reviews.length > 0 ? (
            <ul className="list-group mb-4" style={{ maxHeight: "300px", overflowY: "auto", paddingRight: "5px" }}>
              {reviews.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map((rev) => (
                <li key={rev.id} className="list-group-item border-0 shadow-sm mb-2 rounded">
                  <div className="d-flex justify-content-between align-items-center">
                    <strong>{rev.user?.name || "Anónimo"}:</strong>
                    <small className="text-warning">⭐ {rev.rating}/5</small>
                  </div>
                  <p className="mb-0">{rev.comment}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted mb-4">Este producto aún no tiene reseñas.</p>
          )}

          {/* Formulario de reseña */}
          <div className="p-4 mb-5 rounded-4" style={{ backdropFilter: "blur(15px)", background: "rgba(255, 255, 255, 0.2)", boxShadow: "0 8px 32px rgba(0,0,0,0.1)", border: "1px solid rgba(255, 255, 255, 0.3)" }}>
            <h5 className="fw-bold mb-4 text-dark">Deja tu reseña</h5>
            <form onSubmit={handleReviewSubmit}>
              <div className="mb-3 d-flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    style={{ cursor: "pointer", fontSize: "2rem", color: star <= rating ? "gold" : "rgba(0,0,0,0.2)" }}
                    onMouseEnter={() => setRating(star)}
                    onClick={() => setRating(star)}
                    onMouseLeave={() => setRating(rating)}
                  >
                    ★
                  </span>
                ))}
              </div>
              <textarea
                className="form-control mb-3"
                rows={4}
                placeholder="Escribe tu comentario..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                style={{ borderRadius: "12px", padding: "12px", resize: "none", boxShadow: "inset 0 2px 6px rgba(0,0,0,0.2)" }}
              />
              <button
                type="submit"
                className="btn fw-bold"
                style={{ borderRadius: "12px", padding: "10px 25px", background: "linear-gradient(135deg, #ff6f61, #ff8e53)", color: "#fff" }}
              >
                Publicar reseña
              </button>
            </form>
          </div>
        </div>
        {/* Productos relacionados por primera palabra */}
{relatedProductsByWord.length > 0 && (
  <div className="mt-5 position-relative">
    <h4 className="fw-bold mb-3">Productos relacionados</h4>

    <div
      className="d-flex overflow-auto gap-3 related-scrollbar pb-2"
      style={{
        backgroundColor: "#fff",
        borderRadius: "12px",
        scrollBehavior: "smooth",
        WebkitOverflowScrolling: "touch",
        cursor: "grab",
      }}
    >
      {relatedProductsByWord.map((p) => {
        const firstImage = p.images?.[0]
  ? getImageUrl(p.images[0])
  : "/images/placeholder.png";


        return (
          <div
            key={p.id}
            className="related-card position-relative overflow-hidden rounded-4 shadow-sm"
            style={{ minWidth: "200px", cursor: "pointer", scrollSnapAlign: "start", transition: "transform 0.3s ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div className="related-img-wrapper position-relative">
              <img src={firstImage} alt={p.name} className="w-100 rounded-4" style={{ objectFit: "cover", height: "200px" }} />
              <div className="related-overlay d-flex justify-content-center align-items-center">
                <Link
                  to={`/producto/${p.id}`}
                  className="btn btn-outline-success fw-bold px-3 py-2 shadow"
                  style={{ borderRadius: "8px" }}
                >
                  👁️ Ver producto
                </Link>
              </div>
            </div>
            <div className="p-3 text-center">
              <h6 className="fw-semibold text-truncate">{p.name}</h6>
              <p className="fw-bold text-success mb-0">
                €{(p.promo_price ?? p.price ?? 0).toFixed(2)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  </div>
)}


        {/* Productos relacionados */}
{/* Productos relacionados */}
<div className="mt-5 position-relative">
  {/* Sombras dinámicas */}
  {shadow.left && (
    <div
      className="position-absolute top-0 start-0 h-100"
      style={{
        width: "50px",
        background: "linear-gradient(to right, rgba(255,255,255,1), rgba(255,255,255,0))",
        zIndex: 3,
        pointerEvents: "none",
      }}
    />
  )}
  {shadow.right && (
    <div
      className="position-absolute top-0 end-0 h-100"
      style={{
        width: "50px",
        background: "linear-gradient(to left, rgba(255,255,255,1), rgba(255,255,255,0))",
        zIndex: 3,
        pointerEvents: "none",
      }}
    />
  )}

  <h4 className="fw-bold mb-3">Productos de la misma categoría</h4>

  <div
    ref={scrollRef}
    className="d-flex overflow-auto gap-3 related-scrollbar pb-2"
    style={{
      backgroundColor: "#fff",
      borderRadius: "12px",
      scrollBehavior: "smooth",
      WebkitOverflowScrolling: "touch",
      cursor: "grab",
    }}
    onMouseDown={(e) => {
      const el = scrollRef.current;
      el.isDown = true;
      el.startX = e.pageX - el.offsetLeft;
      el.scrollLeftStart = el.scrollLeft;
      el.style.cursor = "grabbing";
    }}
    onMouseLeave={() => {
      const el = scrollRef.current;
      el.isDown = false;
      el.style.cursor = "grab";
    }}
    onMouseUp={() => {
      const el = scrollRef.current;
      el.isDown = false;
      el.style.cursor = "grab";
    }}
    onMouseMove={(e) => {
      const el = scrollRef.current;
      if (!el.isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - el.startX) * 1.5; // velocidad
      el.scrollLeft = el.scrollLeftStart - walk;
    }}
  >
    {relatedProducts.map((p) => {
      const firstImage = p.images?.[0]
  ? getImageUrl(p.images[0])
  : "/images/placeholder.png";


      return (
        <div
          key={p.id}
          className="related-card position-relative overflow-hidden rounded-4 shadow-sm"
          style={{
            minWidth: "200px",
            cursor: "pointer",
            scrollSnapAlign: "start",
            transition: "transform 0.3s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <div className="related-img-wrapper position-relative">
            <img
              src={firstImage}
              alt={p.name}
              className="w-100 rounded-4"
              style={{ objectFit: "cover", height: "200px" }}
            />
            <div className="related-overlay d-flex justify-content-center align-items-center">
  <Link
    to={`/producto/${p.id}`}
    className="btn btn-outline-success fw-bold px-3 py-2 shadow"
    style={{ borderRadius: "8px" }}
  >
    👁️ Ver producto
  </Link>
</div>
          </div>
          <div className="p-3 text-center">
            <h6 className="fw-semibold text-truncate">{p.name}</h6>
            <p className="fw-bold text-success mb-0">
              €{(p.promo_price ?? p.price ?? 0).toFixed(2)}
            </p>
          </div>
        </div>
      );
    })}
  </div>
</div>


      </div>

      {/* Modal de login */}
      {showLoginModal && <LoginModal show={showLoginModal} onClose={() => setShowLoginModal(false)} />}
    </section>
  );
}
