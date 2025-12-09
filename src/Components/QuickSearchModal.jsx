import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Modal, Spinner } from "react-bootstrap";
import { getImageUrl } from "../services/api";

const PLACEHOLDER_IMG = "/images/placeholder.png"; // Ajusta si tienes placeholder

export default function QuickSearchModal({ show, onClose, results, loading }) {
  const [showAll, setShowAll] = useState(false);

  if (!results) results = []; // prevenir errores si es null

  const displayedResults = showAll ? results : results.slice(0, 5);

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      backdrop={false}
      keyboard={true}
      dialogClassName="quick-search-modal-dialog"
    >
      <Modal.Body className="p-3">
        <h5 className="fw-bold mb-3 text-center">Resultados</h5>

        {loading && (
          <div className="d-flex justify-content-center py-4">
            <Spinner animation="border" />
          </div>
        )}

        {!loading && results.length === 0 && (
          <p className="text-center text-muted">No se encontraron resultados.</p>
        )}

        {!loading && results.length > 0 && (
          <>
            <div className="d-flex flex-column gap-3" style={{ maxHeight: "50vh", overflowY: "auto" }}>
              {displayedResults.map((product) => (
                <div
                  key={product.id}
                  className="d-flex align-items-center gap-3 border rounded p-2"
                >
                  <img
                    src={getImageUrl(product.image) || PLACEHOLDER_IMG}
                    alt={product.name}
                    style={{
                      width: "65px",
                      height: "65px",
                      objectFit: "cover",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <div className="flex-grow-1">
                    <div className="fw-semibold">{product.name}</div>
                    <div className="text-success fw-bold">{product.price} €</div>
                  </div>
                  <Link
                    to={`/producto/${product.id}`}
                    className="btn btn-sm btn-dark fs-5"
                    onClick={onClose} // cerrar modal al ver producto
                  >
                    Ver producto
                  </Link>
                </div>
              ))}
            </div>

            {results.length > 5 && !showAll && (
              <div className="text-center mt-2">
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setShowAll(true)}
                >
                  ▼ Ver más
                </button>
              </div>
            )}
            {showAll && results.length > 5 && (
              <div className="text-center mt-2">
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

        <div className="text-center mt-3">
          <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
