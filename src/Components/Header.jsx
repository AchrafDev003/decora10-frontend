// src/Components/Header.jsx
import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../Context/Carrito/CartContext";
import { useAuth } from "../Context/AuthContext";
import logo from "/img/dec10.png";
import CartIcon from "./CartIcon";
import { getCategories } from "../services/api";
import { FaUser, FaSearch, FaHome, FaStore, FaThList, FaPenNib, FaEnvelope } from "react-icons/fa";
import LoginModal from "./LoginModal";
import { toast } from "react-toastify";
import FollowOrderModal from "./FollowOrderModal";

import "../css/app.css";

export default function Header() {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showFollow, setShowFollow] = useState(false);

  const { cart = {}, addToCart } = useCart();
  const cartItems = cart?.items || [];
  const totalItems = cartItems.reduce((acc, item) => acc + (item.quantity || 0), 0);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const catRef = useRef();
  const accountRef = useRef();

  // Cargar categorías
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { success, data } = await getCategories();
        if (success && Array.isArray(data)) setCategories(data);
        else setCategories([]);
      } catch (err) {
        console.error("Error cargando categorías:", err);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (catRef.current && !catRef.current.contains(e.target)) setCatOpen(false);
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) navigate(`/tienda?search=${encodeURIComponent(searchTerm.trim())}`);
  };

  const handleAccountClick = () => {
    if (!user) setShowLogin(true);
    else setAccountOpen((prev) => !prev);
  };

  const toggleMobile = () => setMobileOpen((prev) => !prev);

  return (
    <>
      <header className="shadow-sm sticky-top">
        {/* Logo */}
        <div className="text-center py-2 bg-black logo-container">
          <Link to="/" className="d-inline-flex align-items-center text-decoration-none">
            <img
              src={logo}
              alt="Decora10"
              height="50"
              className="me-2"
              style={{ borderRadius: "40%", border: "3px solid orange", objectFit: "cover" }}
            />
            <h1 className="fw-bold m-0 fs-3 text-white">
              Decor@ <span style={{ color: "orange" }}>10</span>
            </h1>
          </Link>
        </div>

        {/* Navbar */}
        <nav className="navbar navbar-expand-lg" style={{ backgroundColor: "var(--bs-brown)" }}>
          <div className="container py-2">
            <button
              className={`navbar-toggler border-0 ${mobileOpen ? "open" : ""}`}
              type="button"
              onClick={toggleMobile}
            >
              <span className="navbar-toggler-icon-custom"></span>
            </button>

            <div className={`collapse navbar-collapse justify-content-center ${mobileOpen ? "show" : ""}`} id="mainNavbar">
              <ul className="navbar-nav mb-2 mb-lg-0 align-items-center">

                <li className="nav-item">
                  <NavLink to="/" className="nav-link nav-link-custom"><FaHome /> Home</NavLink>
                </li>

                <li className="nav-item">
                  <NavLink to="/tienda" className="nav-link nav-link-custom"><FaStore /> Tienda</NavLink>
                </li>

                {/* Dropdown Categorías */}
                <li className="nav-item dropdown" ref={catRef}>
                  <button
                    id="categoriesDropdown"
                    className="nav-link nav-link-custom dropdown-toggle btn btn-link"
                    onClick={() => setCatOpen((prev) => !prev)}
                  >
                    <FaThList /> Categorías
                  </button>
                  <ul className={`dropdown-menu categories-dropdown ${catOpen ? "show" : ""}`}>
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <li key={cat.id}>
                          <button
                            className="dropdown-item"
                           onClick={() => {
  setCatOpen(false);

  if (cat.id === 76) {
    navigate("/colchoneria");
  } else {
    navigate(`/tienda?category=${cat.id}`);
  }
}}


                          >
                            {cat.name}
                          </button>
                        </li>
                      ))
                    ) : (
                      <li><span className="dropdown-item text-muted">No hay categorías</span></li>
                    )}
                  </ul>
                </li>

                <li className="nav-item">
  <button
    className="nav-link nav-link-custom btn btn-link"
    onClick={() => setShowFollow(true)}
  >
    <FaPenNib /> Seguir pedido
  </button>
</li>

                <li className="nav-item">
                  <NavLink to="/contacto" className="nav-link nav-link-custom"><FaEnvelope /> Contacto</NavLink>
                </li>

                {/* Mi cuenta */}
                <li className="nav-item dropdown" ref={accountRef}>
                  {user ? (
                    <>
                      <button
                        className="nav-link nav-link-custom dropdown-toggle btn btn-link"
                        onClick={handleAccountClick}
                      >
                        <FaUser /> {user.name || user.fullname || "Mi cuenta"}
                      </button>
                      <ul className={`dropdown-menu categories-dropdown ${accountOpen ? "show" : ""}`}>
                        <li>
                          <Link to="/perfil" className="dropdown-item" onClick={() => setAccountOpen(false)}>Mi perfil</Link>
                        </li>
                        <li>
                          <button className="dropdown-item" onClick={logout}>Cerrar sesión</button>
                        </li>
                      </ul>
                    </>
                  ) : (
                    <button className="btn btn-outline-light btn-sm nav-link-custom" onClick={handleAccountClick}>
                      <FaUser /> Mi cuenta
                    </button>
                  )}
                </li>
              </ul>

              {/* Buscador + Carrito */}
              <div className="d-flex align-items-center ms-lg-3 mt-2 mt-lg-0">
                <form className="input-group search-wrapper" onSubmit={handleSearch}>
                  <input
                    type="text"
                    className="form-control form-control-sm rounded-start"
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button
                    className="btn btn-sm btn-light rounded-end d-flex align-items-center justify-content-center"
                    type="submit"
                  >
                    <FaSearch />
                  </button>
                </form>

                <Link
                  to="/carrito"
                  className="btn btn-light position-relative ms-3 d-flex align-items-center justify-content-center"
                  title="Ver carrito"
                >
                  <CartIcon />
                  {totalItems > 0 && (
                    <span className="badge bg-danger position-absolute top-0 start-100 translate-middle">
                      {totalItems}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Login Modal */}

      <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />
        {/* Follow Order Modal */}
<FollowOrderModal show={showFollow} onClose={() => setShowFollow(false)} />

    </>
  );
}
