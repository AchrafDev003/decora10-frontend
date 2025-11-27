import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCategories } from "../services/api";


export default function Categoria() {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await getCategories();
      if (res.success) {
        setCategories(res.data);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryClick = (id) => {
    navigate(`/tienda?category=${id}`);
  };

  return (
    <section className="container my-5">
      <h2 className="text-center fw-bold mb-4">Top Categorías</h2>

      <div id="carouselCategorias" className="carousel slide" data-bs-ride="carousel" data-bs-wrap="true">
        <div className="carousel-inner">
          {categories.length === 0 && <p className="text-center">Cargando categorías...</p>}

          {/* Crear slides dinámicamente de 4 en 4 */}
          {Array.from({ length: Math.ceil(categories.length / 4) }).map((_, slideIndex) => (
            <div
              key={slideIndex}
              className={`carousel-item ${slideIndex === 0 ? "active" : ""}`}
            >
              <div className="row g-3 justify-content-center text-white text-center">
                {categories
                  .slice(slideIndex * 4, slideIndex * 4 + 4)
                  .map((cat) => (
                    <div key={cat.id} className="col-6 col-md-3">
                      <div className="card bg-dark text-white border-0">
                        <img
  src={cat.image_url || "/images/ITEM Home.jpg"}
  className="card-img"
  alt={cat.name}
/>

                        <div className="card-img-overlay d-flex align-items-end justify-content-center bg-grey bg-opacity-50">
                          <button
                            onClick={() => handleCategoryClick(cat.id)}
                            className="category fs-2 text-decoration-none text-center d-block py-3 btn btn-link text-white"
                          >
                            {cat.name}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <button className="carousel-control-prev" type="button" data-bs-target="#carouselCategorias" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#carouselCategorias" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
        </button>
      </div>
    </section>
  );
}
