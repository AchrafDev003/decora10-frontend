// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import AuthModal from "../components/LoginModal";
import {
  getProfile,
  updateUser,
  getOrders,
  getFavorites,
  addToCart,
  removeFavorite,
  deleteOrder,
  getImageUrl,
  getUserImageUrl,
} from "../services/api";

const statusColors = {
  pendiente: "text-warning fw-semibold",
  procesando: "text-primary fw-semibold",
  enviado: "text-info fw-semibold",
  en_ruta: "text-info fw-semibold",
  entregado: "text-success fw-semibold",
  cancelado: "text-danger fw-semibold",
};

const Profile = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [expandedOrders, setExpandedOrders] = useState({});
  const [expandedFavorites, setExpandedFavorites] = useState({});

  // ===============================
  // 🔹 FETCH PROFILE, ORDERS & FAVORITES
  // ===============================
  const fetchProfileData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setAuthModalOpen(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Perfil
      // Al obtener el perfil
const profileRes = await getProfile();
if (profileRes.success && profileRes.data) {
  const userData = profileRes.data;
  setUser(userData);
  setForm({
    name: userData.name || "",
    email: userData.email || "",
    password: "",
  });
  setPhotoPreview(getUserImageUrl(userData));
}

      // Órdenes
      const ordersRes = await getOrders();
      setOrders(
        ordersRes.success && Array.isArray(ordersRes.data?.data)
          ? ordersRes.data.data
          : []
      );

      // Favoritos
      const favRes = await getFavorites();
      
      setFavorites(
        favRes.success && Array.isArray(favRes.data?.data)
          ? favRes.data.data
          : []
      );
    } catch (err) {
      toast.error("Error cargando perfil");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  // ===============================
  // 🔹 HANDLERS FORM & PHOTO
  // ===============================
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Debes seleccionar una imagen válida");
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) return;

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("email", form.email);
    if (form.password?.trim()) formData.append("password", form.password);
    if (photoFile) formData.append("photo", photoFile);

    try {
      const res = await updateUser(user.id, formData);
      if (res.success) {
        toast.success("Perfil actualizado correctamente");
        setPhotoFile(null);
        fetchProfileData();
      } else {
        toast.error(res.error || "Error actualizando perfil");
      }
    } catch (err) {
      toast.error(err.message || "Error actualizando usuario");
    }
  };

  // ===============================
  // 🔹 FAVORITOS HANDLERS
  // ===============================
  const handleAddToCart = async (productId) => {
    const res = await addToCart(productId);
    if (res.success) toast.success("Producto añadido al carrito");
  };

  const handleRemoveFavorite = async (productId) => {
    const res = await removeFavorite(productId);
    if (res.success) {
      toast.success("Producto eliminado de favoritos");
      setFavorites(favorites.filter((f) => f.product_id !== productId));
    }
  };

  // ===============================
  // 🔹 ÓRDENES HANDLER
  // ===============================
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta orden?")) return;
    const res = await deleteOrder(orderId);
    if (res.success) {
      toast.success("Orden eliminada");
      setOrders(orders.filter((o) => o.id !== orderId));
    } else {
      toast.error(res.error || "No se pudo eliminar la orden");
    }
  };

  const toggleOrder = (id) =>
    setExpandedOrders((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleFavorite = (id) =>
    setExpandedFavorites((prev) => ({ ...prev, [id]: !prev[id] }));

  if (loading)
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );

  return (
    <div className="container my-5">
      <h2 className="text-primary mb-4">Mi Perfil</h2>
      <div className="row g-4">
        {/* ====================== PROFILE ====================== */}
        <div className="col-md-6">
          <div className="card shadow-sm p-4">
            {user && (
              <div className="text-center mb-4">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="rounded-circle"
                    style={{ width: 100, height: 100, objectFit: "cover" }}
                  />
                ) : (
                  <div
                    className="bg-gray-200 rounded-circle d-inline-flex align-items-center justify-content-center"
                    style={{
                      width: 100,
                      height: 100,
                      fontSize: "2rem",
                      color: "#555",
                    }}
                  >
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
                <h5 className="mt-2">{user.name}</h5>
                <small className="text-muted">{user.role || "Cliente"}</small>
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Nombre</label>
                <input
                  className="form-control"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  className="form-control"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Contraseña (opcional)</label>
                <input
                  className="form-control"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Dejar vacío si no quieres cambiarla"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Foto de perfil</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={handlePhotoChange}
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">
                Actualizar Perfil
              </button>
            </form>
          </div>
        </div>

        {/* ====================== ORDERS ====================== */}
        <div className="col-md-6">
          <div className="card shadow-sm p-4 mb-4">
            <h5 className="mb-3">Mis Órdenes</h5>
            {orders.length > 0 ? (
              <div className="accordion" id="ordersAccordion">
                {orders.map((order) => {
                  const lastStatus = order.statusHistory?.length
                    ? order.statusHistory[order.statusHistory.length - 1]
                    : { status: order.last_status || order.status || "pendiente" };
                  const canDelete = lastStatus.status === "pendiente";

                  return (
                    <div className="accordion-item" key={order.id}>
                      <h2 className="accordion-header" id={`orderHeading${order.id}`}>
                        <button
                          className="accordion-button d-flex justify-content-between align-items-center collapsed"
                          type="button"
                          onClick={() => toggleOrder(order.id)}
                        >
                          <span>
                            Orden #{order.id} -{" "}
                            <span className={statusColors[lastStatus.status]}>
                              {lastStatus.status}
                            </span>{" "}
                            - {new Date(order.created_at).toLocaleDateString()}
                          </span>
                          <span>{expandedOrders[order.id] ? "▲" : "▼"}</span>
                        </button>
                      </h2>
                      {expandedOrders[order.id] && (
                        <div className="accordion-collapse show">
                          <div className="accordion-body">
                            <p><strong>Código:</strong> {order.order_code}</p>
                            <p><strong>Total:</strong> {Number(order.total || 0).toFixed(2)}€</p>
                            <p><strong>Último estado:</strong> {lastStatus.status} - {lastStatus.updated_at ? new Date(lastStatus.updated_at).toLocaleDateString() : ""}</p>
                            {canDelete && (
                              <button
                                className="btn btn-sm btn-danger mt-2"
                                onClick={() => handleDeleteOrder(order.id)}
                              >
                                Eliminar Orden
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted">No tienes órdenes realizadas.</p>
            )}
          </div>

          {/* ====================== FAVORITES ====================== */}
          <div className="card shadow-sm p-4">
            <h5 className="mb-3">Mis Favoritos</h5>
            {favorites.length > 0 ? (
              <div className="accordion" id="favoritesAccordion">
                {favorites.map((fav) => (
                  <div className="accordion-item" key={fav.id}>
                    <h2 className="accordion-header" id={`favHeading${fav.id}`}>
                      <button
                        className="accordion-button d-flex justify-content-between align-items-center collapsed"
                        type="button"
                        onClick={() => toggleFavorite(fav.id)}
                      >
                        Producto #{fav.product_id} - {fav.product?.name || "Sin nombre"}
                        <span>{expandedFavorites[fav.id] ? "▲" : "▼"}</span>
                      </button>
                    </h2>
                    {expandedFavorites[fav.id] && (
                      <div className="accordion-collapse show">
                       <div className="accordion-body d-flex align-items-center gap-3">
  <img
    src={getImageUrl(fav.product)}
    alt={fav.product?.name || "Producto"}
    style={{ width: 80, height: 80, objectFit: "cover" }}
  />
  <div>

                            <p className="mb-2">{fav.product?.name || "Sin nombre"}</p>
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => handleAddToCart(fav.product_id)}
                              >
                                Añadir al carrito
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleRemoveFavorite(fav.product_id)}
                              >
                                Eliminar
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">No tienes productos favoritos.</p>
            )}
          </div>
        </div>
      </div>

      <AuthModal show={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};

export default Profile;
