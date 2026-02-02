// src/pages/LimitedPacks.jsx
import React, { useEffect, useState } from "react";
import { getLimitedPacks } from "../services/api";
import { useCart } from "../Context/Carrito/CartContext";
import { useAuth } from "../Context/AuthContext";
import AuthModal from "../Components/LoginModal";
import { toast } from "react-hot-toast";
import "../css/LimitedPacks.css";
import { FaEye } from "react-icons/fa";

const MEASURE_ADJUST = {
  "90x190": -100,
  "135x190": 0,
  "150x190": 80,
};

export default function LimitedPacks() {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const [selectedMeasures, setSelectedMeasures] = useState({});
  const { addToCart } = useCart();
  const { user } = useAuth();

  /* -------------------------------
     SIDE EFFECT: BLOQUEAR SCROLL
  --------------------------------*/
  useEffect(() => {
    document.body.style.overflow = itemModalOpen ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [itemModalOpen]);

  /* -------------------------------
     FETCH
  --------------------------------*/
  const fetchPacks = async () => {
    setLoading(true);
    try {
      const res = await getLimitedPacks();
      setPacks(res.data?.data ?? []);
    } catch (err) {
      console.error(err);
      toast.error("Error cargando packs limitados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPacks();
  }, []);

  /* -------------------------------
     NORMALIZADOR
  --------------------------------*/
  const packToItem = (pack) => ({
    name: pack.title,
    image_url: pack.image_url,
    description: pack.description,
    price: pack.promo_price ?? pack.original_price,
  });

  /* -------------------------------
     HELPERS
  --------------------------------*/
  const getPriceWithMeasure = (pack) => {
    const measure = selectedMeasures[pack.id];
    const adjust = measure ? MEASURE_ADJUST[measure] ?? 0 : 0;
    return (pack.promo_price ?? pack.original_price) + adjust;
  };

  const getOriginalPriceWithMeasure = (pack) => {
    const measure = selectedMeasures[pack.id];
    const adjust = measure ? MEASURE_ADJUST[measure] ?? 0 : 0;
    return pack.original_price + adjust;
  };

  /* -------------------------------
     ACTIONS
  --------------------------------*/
  const openItemModal = (item) => {
    setSelectedItem(item);
    setItemModalOpen(true);
  };

  const closeItemModal = () => {
    setSelectedItem(null);
    setItemModalOpen(false);
  };

  const handleAddToCart = (pack) => {
    if (!user) return setAuthModalOpen(true);
    if (pack.requires_measure && !selectedMeasures[pack.id])
      return toast.error("Debes seleccionar una medida");

    addToCart({
      id: pack.id,
      type: "pack",
      quantity: 1,
      measure: selectedMeasures[pack.id] || null,
    });

    toast.success("Pack añadido al carrito");
  };

  /* -------------------------------
     RENDER
  --------------------------------*/
  return (
    <div className="limited-packs-page">
      <div
        className="container-fluid py-4"
        style={{
          background: "linear-gradient(135deg, #1c1c1c 0%, #42275a 100%)",
          minHeight: "100vh",
        }}
      >
        {/* HEADER */}
        <div className="limited-packs-header text-center mb-5">
          <h1 className="h3 fw-bold gradient-text mb-3">
            Packs Limitados
          </h1>
          <p className="text-white subheading">
            Promociones exclusivas por tiempo limitado
          </p>
        </div>

        {loading ? (
          <div className="text-center py-5 text-white">
            Cargando packs…
          </div>
        ) : packs.length === 0 ? (
          <div className="text-center py-5 text-white">
            No hay packs limitados disponibles
          </div>
        ) : (
          <div className="row g-4">
            {packs.map((pack) => (
              <div className="col-12" key={pack.id}>
                <div className="card pack-card shadow-lg border-0 overflow-hidden">

                  {/* IMAGEN PRINCIPAL */}
                  {pack.image_url && (
                    <div className="position-relative">
                      <img
                        src={pack.image_url}
                        alt={pack.title}
                        className="pack-main-img"
                        onClick={() =>
                          openItemModal(packToItem(pack))
                        }
                        style={{ cursor: "pointer" }}
                      />
                    </div>
                  )}

                  {/* MOSAICO ITEMS */}
                  {pack.items?.length > 0 && (
                    <div
                      className={`pack-items-mosaic items-count-${pack.items.length}`}
                    >
                      {pack.items.map((item) => (
                        <div
                          key={item.id}
                          className="pack-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            openItemModal(item);
                          }}
                        >
                          <img
                            src={item.image_url}
                            alt={item.name}
                          />
                          <div className="overlay-eye">
                            <FaEye color="#fff" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* BODY */}
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title text-white">
                      {pack.title}
                    </h5>
                    <p className="card-text text-white">
                      {pack.description || "—"}
                    </p>

                    {/* Selector de medida */}
                    {pack.requires_measure && (
                      <div className="mb-2">
                        <label className="form-label text-white fw-bold">
                          Selecciona medida:
                        </label>
                        <select
                          className="form-select"
                          value={selectedMeasures[pack.id] || ""}
                          onChange={(e) =>
                            setSelectedMeasures((prev) => ({
                              ...prev,
                              [pack.id]: e.target.value,
                            }))
                          }
                        >
                          <option value="" disabled>
                            Elige una medida
                          </option>
                          {Object.keys(MEASURE_ADJUST).map(
                            (measure) => (
                              <option
                                key={measure}
                                value={measure}
                              >
                                {measure}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    )}

                    {/* Precio */}
                    <div className="mb-2">
                      <span className="fw-bold fs-5 text-warning">
                        {getPriceWithMeasure(pack)} €
                      </span>{" "}
                      <span className="text-success text-decoration-line-through">
                        {getOriginalPriceWithMeasure(pack)} €
                      </span>
                    </div>

                    {/* Fechas */}
                    <div className="small mb-2 text-white">
                      <div>
                        <strong>Desde:</strong>{" "}
                        {new Date(pack.start_date).toLocaleDateString()}
                      </div>
                      <div>
                        <strong>Fin del pack:</strong>{" "}
                        {new Date(pack.end_date).toLocaleDateString()}
                      </div>
                    </div>

                    {/* CTA */}
                    <button
                      className="btn btn-warning mt-auto shadow-sm"
                      onClick={() => handleAddToCart(pack)}
                    >
                      Añadir al carrito
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL ITEM */}
        {itemModalOpen && selectedItem && (
          <div
            className="modal-overlay"
            onClick={closeItemModal}
          >
            <div
              className="modal-content p-3"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: 600, textAlign: "center" }}
            >
              <img
                src={selectedItem.image_url}
                alt={selectedItem.name}
                style={{
                  width: "100%",
                  borderRadius: 12,
                  marginBottom: 12,
                  objectFit: "contain",
                }}
              />
              <h5>{selectedItem.name}</h5>
              <p
                style={{
                  maxHeight: 180,
                  overflowY: "auto",
                  textAlign: "justify",
                  padding: "0 8px",
                }}
              >
                {selectedItem.description || "—"}
              </p>

              {selectedItem.price && (
                <p className="fw-bold text-warning">
                  {selectedItem.price} €
                </p>
              )}

              <button
                className="modal-close btn btn-light"
                onClick={closeItemModal}
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* MODAL AUTH */}
        {authModalOpen && (
          <AuthModal
            show={authModalOpen}
            onClose={() => setAuthModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
