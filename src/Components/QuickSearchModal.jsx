import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Modal, Spinner } from "react-bootstrap";
import { getImageUrl } from "../services/api";

const PLACEHOLDER_IMG = "/images/placeholder.png";

export default function QuickSearchModal({ show, onClose, results, loading }) {
  const [showAll, setShowAll] = useState(false);
  if (!results) results = [];
  const displayedResults = showAll ? results : results.slice(0, 8);

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      backdrop={false}
      keyboard={true}
      dialogClassName="quick-search-modal-dialog"
    >
      <Modal.Body className="p-4" style={{ backgroundColor: "#111", borderRadius: "12px" }}>
        <h5 className="fw-bold mb-4 text-center" style={{ color: "#ff7a00", fontSize: "1.6rem" }}>
          Resultados de Búsqueda
        </h5>

        {loading && (
          <div className="d-flex justify-content-center py-4">
            <Spinner animation="border" variant="warning" />
          </div>
        )}

        {!loading && results.length === 0 && (
          <p className="text-center text-muted">No se encontraron resultados.</p>
        )}

        {!loading && results.length > 0 && (
          <>
            <div
              className="d-flex flex-column gap-3"
              style={{ maxHeight: "55vh", overflowY: "auto" }}
            >
              {displayedResults.map((product) => (
                <div
                  key={product.id}
                  className="d-flex align-items-center justify-content-between gap-3 p-3"
                  style={{
                    backgroundColor: "#1c1c1c",
                    borderRadius: "10px",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = "0 6px 25px rgba(0,0,0,0.7)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.5)";
                  }}
                >
                  <img
                    src={getImageUrl(product.image) || PLACEHOLDER_IMG}
                    alt={product.name}
                    style={{
                      width: "70px",
                      height: "70px",
                      objectFit: "cover",
                      borderRadius: "0.75rem",
                      border: "2px solid #ff7a00",
                    }}
                  />
                  <div className="flex-grow-1 ms-2">
                    <div style={{ color: "#fff", fontWeight: "600" }}>{product.name}</div>
                    <div style={{ color: "#ff7a00", fontWeight: "700", fontSize: "1.1rem" }}>
                      {product.price} €
                    </div>
                  </div>
                  <Link
                    to={`/producto/${product.id}`}
                    className="btn"
                    style={{
                      backgroundColor: "#ff7a00",
                      color: "#111",
                      fontWeight: "600",
                      padding: "6px 18px",
                      borderRadius: "6px",
                      transition: "background 0.3s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#ff9500")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ff7a00")}
                    onClick={onClose}
                  >
                    Ver Producto
                  </Link>
                </div>
              ))}
            </div>

            {results.length > 8 && !showAll && (
              <div className="text-center mt-3">
                <button
                  className="btn btn-outline-warning btn-sm"
                  onClick={() => setShowAll(true)}
                >
                  ▼ Ver más
                </button>
              </div>
            )}
            {showAll && results.length > 5 && (
              <div className="text-center mt-3">
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setShowAll(false)}
                >
                  ▲ Ver menos
                </button>
              </div>
            )}
          </>
        )}

        <div className="text-center mt-4">
          <button
            className="btn btn-outline-light btn-sm"
            onClick={onClose}
            style={{ padding: "6px 20px", borderRadius: "6px" }}
          >
            Cerrar
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
