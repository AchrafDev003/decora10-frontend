// src/Pages/Products.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFeaturedProductsByCategory2, getCategories,getImageUrl } from "../services/api";
import { useCart } from "../Context/Carrito/CartContext";
import { toast } from "react-hot-toast";
import { FaStar, FaRegStar } from "react-icons/fa";
import confetti from "canvas-confetti";

const Products = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cartItems, addToCart } = useCart();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 12; // productos por página

  // Traer categorías desde la API
  const fetchCategories = async () => {
    const res = await getCategories();
    if (res.success) setCategories(res.data);
  };

  // Traer productos paginados (excepto Colchonería)
  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Colchonería se maneja en otra página
      const category = categories.find(c => c.id == id);
      if (category?.name.toLowerCase() === "colchonería") {
        navigate("/colchoneria");
        return;
      }

      const res = await getFeaturedProductsByCategory2();
      if (res.success) {
        // Aquí implementamos paginación manual
        const allProducts = res.data;
        const start = (page - 1) * limit;
        const paginatedProducts = allProducts.slice(start, start + limit);
        setProducts(paginatedProducts);
        setTotalPages(Math.ceil(allProducts.length / limit));
      } else {
        toast.error(res.error || "Error cargando productos");
      }
    } catch (err) {
      toast.error(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0) fetchProducts();
  }, [id, page, categories]);

  const handleAddToCart = (product) => {
    const existingItem = cartItems.find(item => item.product_id === product.id);
    if (existingItem && existingItem.quantity >= 3) {
      toast.info("Máximo 3 unidades por producto");
      return;
    }
    const quantityToAdd = existingItem ? Math.min(3 - existingItem.quantity, 1) : 1;
    addToCart(product.id, quantityToAdd);
    toast.success(`${product.name} agregado al carrito`);

    const card = document.getElementById(`product-card-${product.id}`);
    const cartIcon = document.getElementById("cart-icon");

    if (card && cartIcon) {
      const clone = card.cloneNode(true);
      clone.style.position = "fixed";
      const rect = card.getBoundingClientRect();
      clone.style.top = `${rect.top}px`;
      clone.style.left = `${rect.left}px`;
      clone.style.width = `${rect.width}px`;
      clone.style.height = `${rect.height}px`;
      clone.style.transition = "all 0.8s ease-in-out";
      clone.style.zIndex = 9999;
      document.body.appendChild(clone);

      setTimeout(() => {
        const cartRect = cartIcon.getBoundingClientRect();
        clone.style.top = `${cartRect.top}px`;
        clone.style.left = `${cartRect.left}px`;
        clone.style.width = `40px`;
        clone.style.height = `40px`;
        clone.style.opacity = 0.5;
      }, 10);

      setTimeout(() => {
        document.body.removeChild(clone);
        cartIcon.classList.add("pulse");
        setTimeout(() => cartIcon.classList.remove("pulse"), 300);
      }, 820);
    }

    if (product.is_promo) {
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleCategoryClick = (cat) => {
    if (cat.name.toLowerCase() === "colchonería") {
      navigate("/colchoneria");
    } else {
      navigate(`/productos/${cat.id}`);
      setPage(1);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const renderStars = (rating = 0) =>
    Array.from({ length: 5 }, (_, i) =>
      i < rating ? <FaStar key={i} className="text-warning" /> : <FaRegStar key={i} className="text-muted" />
    );

  return (
    <div className="container my-5">
      <h2 className="mb-4 text-primary text-center">Productos</h2>

      <div className="row">
        <div className="col-md-3 mb-4">
          <div className="list-group">
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`list-group-item list-group-item-action ${id == cat.id ? "active" : ""}`}
                onClick={() => handleCategoryClick(cat)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="col-md-9">
          <input
            type="text"
            className="form-control mb-4"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {loading ? (
            <div className="text-center my-5">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <p className="text-center">No se encontraron productos.</p>
          ) : (
            <>
              <div className="row g-4">
                {filteredProducts.map(product => (
                  <div className="col-sm-6 col-md-4" key={product.id}>
                    <div id={`product-card-${product.id}`} className="card h-100 shadow-sm border-0 product-card">
                      <div className="position-relative overflow-hidden">
                        <img
                          src={product.image || "/placeholder.png"}
                          className="card-img-top product-img"
                          alt={product.name}
                          style={{ height: "220px", objectFit: "center", transition: "transform 0.3s" }}
                        />
                        {product.is_promo && (
                          <span className="badge bg-warning text-dark position-absolute top-0 start-0 m-2">
                            -{Math.round((1 - product.promo_price / product.price) * 100)}%
                          </span>
                        )}
                      </div>
                      <div className="card-body d-flex flex-column">
                        <h5 className="card-title">{product.name}</h5>
                        <div className="mb-2">{renderStars(product.rating)}</div>
                        <p className="card-text flex-grow-1 text-truncate" style={{ maxHeight: "3rem" }}>
                          {product.description}
                        </p>
                        <div className="d-flex justify-content-between align-items-center mt-3">
                          {product.is_promo ? (
                            <div>
                              <span className="fw-bold text-danger me-2">{product.promo_price}€</span>
                              <span className="text-muted text-decoration-line-through">{product.price}€</span>
                            </div>
                          ) : (
                            <span className="fw-bold">{product.price}€</span>
                          )}
                          <button className="btn btn-sm btn-primary" onClick={() => handleAddToCart(product)}>
                            Añadir al carrito
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginación */}
              <nav className="mt-4">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => setPage(prev => prev - 1)}>Anterior</button>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <li key={i} className={`page-item ${page === i + 1 ? "active" : ""}`}>
                      <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
                    </li>
                  ))}
                  <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => setPage(prev => prev + 1)}>Siguiente</button>
                  </li>
                </ul>
              </nav>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .product-card:hover .product-img { transform: scale(1.05); }
        .product-card { transition: transform 0.2s; }
        .product-card:hover { transform: translateY(-5px); }
        #cart-icon.pulse { animation: pulse 0.3s ease-in-out; }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.3); } 100% { transform: scale(1); } }
      `}</style>
    </div>
  );
};

export default Products;
