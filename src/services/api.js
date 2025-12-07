import axios from "axios";
import { toast } from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


// ===============================
// 🔹 INTERCEPTOR DE REQUEST
// ===============================
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

 const publicRoutes = [
  "register",
  "login",
  "login/google", // ✅ ahora coincide // 👈 añadir esta línea
  "verify-email",
  "password/forgot",
  "password/reset",
  "newsletter/subscribe",
  "newsletter/validate",
  "newsletter/use",
  "products",          // productos list/search
  "products/", 
  "products/search",
  "categories",
];

  let relativeUrl = config.url.startsWith("http")
    ? config.url.replace(config.baseURL, "")
    : config.url;
  relativeUrl = relativeUrl.replace(/^\/+/, "");

  if (token && !publicRoutes.some(route => relativeUrl.startsWith(route))) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ===============================
// 🔹 INTERCEPTOR DE RESPONSE
// ===============================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) {
        return Promise.reject({ success: false, data: null, error: "Unauthorized" });
      }
      const message = data?.message || data?.error || error.message ;
      toast.error(message);
      return Promise.reject({ success: false, data: null, error: message });
    }     
    toast.error("No se pudo conectar con el servidor.");
    return Promise.reject({ success: false, data: null, error: "Error de conexión" });
  }
);

// ===============================
// 🔹 HELPER
// ===============================
// ✅ Ejemplo robusto de handleRequest actualizado
const handleRequest = async (promise) => {
  try {
    const response = await promise;
    return { success: true, data: response.data, error: null };
  } catch (error) {
    console.log("handleRequest error:", error);
    const status = error?.response?.status;
    const backendError =
      error?.response?.data?.message ||
      error?.response?.data?.error;

    // 🚨 Si es 401 o el backend devuelve "Unauthorized"
    if (status === 401 || error.error === "Unauthorized") {
  toast.error("Necesitas verificar tu email antes de iniciar sesión y disfrutar de Decora10.");
  return { success: false, data: null, error: "Unauthorized" };
}


    // Para otros errores, respetamos la estructura
    if (backendError) {
  toast.error(backendError);
}
    return { success: false, data: null, error: backendError };
  }
};




const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ===============================
// 🔹 AUTH
// ===============================
export const registerUser = (data) => handleRequest(api.post("/register", data));

export const loginUser = async (data) => {
  const result = await handleRequest(api.post("/login", data));
  if (result.success) {
    localStorage.setItem("token", result.data?.token || "");
    localStorage.setItem("user", JSON.stringify(result.data?.user || {}));
  }
  return result;
};

export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  return { success: true };
};

export const getProfile = () => handleRequest(api.get("/me"));
export const updateProfile = (id, data) => 
  handleRequest(
    api.put(`/users/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data", ...getAuthHeader() }
    })
  );
export const updateUser = (id, data) => {
  if (data instanceof FormData) data.append("_method", "PUT");
  return handleRequest(
    api.post(`/users/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data", ...getAuthHeader() },
    })
  );
};








export const validateToken = async (setUser, setLoading) => {
  setLoading(true);
  try {
    const profileRes = await getProfile();
    setUser(profileRes.success ? profileRes.data : null);
  } catch {
    setUser(null);
  } finally {
    setLoading(false);
  }
};

// ===============================
// 🔹 USER PHOTO
// ===============================
export const updateUserPhoto = (userId, file) => {
  const formData = new FormData();
  formData.append("photo", file);
  return handleRequest(
    api.patch(`/users/${userId}/photo`, formData, {
      headers: { "Content-Type": "multipart/form-data", ...getAuthHeader() },
    })
  );
};



// ===============================
// 🔹 AUTH GOOGLE
// ===============================
// ===============================
// 🔹 AUTH GOOGLE
// ===============================
export const loginGoogle = (idToken) => {
  return handleRequest(api.post("/login/google", { token: idToken }));
};



// ===============================
// 🔹 NEWSLETTER
// ===============================
export const subscribeNewsletter = (email) => handleRequest(api.post("/newsletter/subscribe", { email }));
export const validateNewsletter = (email, code) => handleRequest(api.post("/newsletter/validate", { email, code }));
export const markNewsletterAsUsed = (email, code) => handleRequest(api.post("/newsletter/use", { email, code }));

// ===============================
// 🔹 PRODUCTS & CATEGORIES
// ===============================
export const getProducts = (params = {}) => handleRequest(api.get("/products", { params }));
export const getProductsFiltrados = (params = {}) => handleRequest(api.get("/products/search", { params }));
export const getProductById = (id) => handleRequest(api.get(`/products/${id}`));
export const searchProducts = (searchTerm) => handleRequest(api.get(`/products?search=${encodeURIComponent(searchTerm)}`));
// 🟢 NUEVO: productos relacionados por primera palabra
export const getRelatedByFirstWord = (productId) => 
  handleRequest(api.get(`/products/related-by-first-word/${productId}`));
export const getCategories = () => handleRequest(api.get("/categories"));
export const getCategoryById = (id) => handleRequest(api.get(`/categories/${id}`));
// ===============================
// 🔹 PRODUCTS DESTACADOS Y COLCHONERÍA
// ===============================

// 🟢 4 productos por categoría (excepto Colchonería) 
export const getFeaturedProductsByCategory = () =>
  handleRequest(api.get("/products/featured"));

// 🟢 Productos de Colchonería (Flex, Dupen, Biolife) para el home
export const getColchoneriaHighlights = () =>
  handleRequest(api.get("/products/colchoneria"));
// 🟢 
// ✅ Soporte para paginación y búsqueda
export const getFeaturedProductsByCategory2 = (params = {}) =>
  handleRequest(api.get("/products/general", { params }));



// 🟢 Productos de Colchonería (Flex, Dupen, Biolife) para la tienda con paginacion
export const getColchoneriaHighlights2 = () =>
  handleRequest(api.get("/products/colchoneria2"));



// ===============================
// 🔹 FAVORITES
// ===============================
export const getFavorites = () => handleRequest(api.get("/favorites"));
export const addFavorite = (productId) => handleRequest(api.post("/favorites", { product_id: productId }));
export const removeFavorite = (productId) => handleRequest(api.delete(`/favorites/${productId}`));

// ===============================
// 🔹 CART
// ===============================
// Ver carrito
export const getCart = async () => {
  try {
    const res = await api.get("/cart", { headers: getAuthHeader() });
    return res.data;
  } catch (err) {
    console.error("getCart error:", err);
    return { success: false, error: err.message };
  }
};

// Total del carrito
export const getCartTotal = async () => {
  try {
    const res = await api.get("/cart/total", { headers: getAuthHeader() });
    return res.data;
  } catch (err) {
    console.error("getCartTotal error:", err);
    return { success: false, error: err.message };
  }
};

// Añadir producto
export const addToCart = async (productId, quantity = 1) => {
  try {
    const res = await api.post(
      `/cart/items/${productId}`,
      { quantity },
      { headers: getAuthHeader() }
    );
    return res.data;
  } catch (err) {
    console.error("addToCart error:", err.response?.data || err.message);
    return { success: false, error: err.response?.data?.message || err.message };
  }
};


// Actualizar cantidad
export const updateCart = async (productId, quantity) => {
  try {
    const res = await api.put(`/cart/items/${productId}`, { quantity }, { headers: getAuthHeader() });
    return res.data;
  } catch (err) {
    console.error("updateCart error:", err.response?.data || err.message);
    return { success: false, error: err.response?.data?.message || err.message };
  }
};

// Eliminar producto
export const removeFromCart = async (productId) => {
  try {
    const res = await api.delete(`/cart/items/${productId}`, { headers: getAuthHeader() });
    return res.data;
  } catch (err) {
    console.error("removeFromCart error:", err.response?.data || err.message);
    return { success: false, error: err.response?.data?.message || err.message };
  }
};

// Vaciar carrito
export const emptyCart = async () => {
  try {
    const res = await api.delete("/cart", { headers: getAuthHeader() });
    return res.data;
  } catch (err) {
    console.error("emptyCart error:", err.response?.data || err.message);
    return { success: false, error: err.response?.data?.message || err.message };
  }
};

// Checkout (si quieres un endpoint separado)
// ✅ checkoutCart.js
export const checkoutCart = async (data) => {
  try {
    const res = await api.post("/orders", data, {
      headers: getAuthHeader(),
    });

    return {
      success: true,
      data: res.data,
      error: null,
    };
  } catch (err) {
    console.error("checkoutCart error:", err.response?.data || err.message);

    return {
  success: false,
  error: err.response?.data?.message || err.response?.data?.error || err.message,
};

  }
};
// ===============================
// 🔹 STRIPE PAYMENT INTENT
// ===============================
export const createPaymentIntent = (payload) => {
  console.log("Payload recibido:", payload); // ✅ dentro de la función
  return handleRequest(
    api.post("/payments/stripe-intent", payload, {
      headers: { ...getAuthHeader() },
    })
  );
};





// ===============================
// 🔹 ORDERS
// ===============================
export const createOrder = (data) => handleRequest(api.post("/orders", data));
export const getOrder = (id) => handleRequest(api.get(`/orders/${id}`));
export const getOrders = () => handleRequest(api.get("/orders", { headers: getAuthHeader() }));
// ===============================
// 🔹 ORDERS DELETE (solo pendientes)
// ===============================
export const deleteOrder = (orderId) =>
  handleRequest(
    api.delete(`/orders/${orderId}`, {
      headers: getAuthHeader(),
    })
  );

// ===============================
// 🔹 ORDERS (seguimiento y estados)
// ===============================

// Obtener timeline / seguimiento del pedido
export const followOrder = (tracking_number) =>
  handleRequest(api.get(`/orders/track/${tracking_number}`, { headers: getAuthHeader() }));


// Actualizar estado del pedido (solo Admin / Dueño)
export const updateOrderStatus = (orderId, status, nota = "") =>
  handleRequest(api.patch(`/orders/${orderId}/status`, { status, nota }, { headers: getAuthHeader() }));


// ===============================
// 🔹 REVIEWS
// ===============================
export const getReviews = (productId) => handleRequest(api.get(`/products/${productId}/reviews`));
export const createReview = (productId, data) =>
  handleRequest(
    api.post(`/products/${productId}/reviews`, data, {
      headers: getAuthHeader()
    })
  );

export const updateReview = (id, data) => handleRequest(api.put(`/reviews/${id}`, data));
export const deleteReview = (id) => handleRequest(api.delete(`/reviews/${id}`));

// ===============================
// 🔹 HERO ITEMS
// ===============================
export const getHeroItems = () => handleRequest(api.get("/hero_items"));
export const getHeroItemById = (id) => handleRequest(api.get(`/hero_items/${id}`));
export const createHeroItem = (data) => handleRequest(api.post("/hero_items", data));
export const updateHeroItem = (id, data) => handleRequest(api.put(`/hero_items/${id}`, data));
export const deleteHeroItem = (id) => handleRequest(api.delete(`/hero_items/${id}`));


// ===============================
// 🔹 COUPONS & PROMOS
// ===============================
// export const validateCoupon = async (code, email) => {
//   try {
//     const res = await api.post("/coupons/validate", { code, email });
//     return res.data; // { valid: true/false, type: 'percent'|'fixed', discount: 10 }
//   } catch (err) {
//     console.error("validateCoupon error:", err.response?.data || err.message);
//     return { valid: false, error: err.response?.data?.message || err.message };
//   }
// };
export const validateCoupon = (payload) => handleRequest(api.post("/coupons/validate", payload));


export const listCoupons = () => handleRequest(api.get("/coupons"));
export const createCoupon = (data) => handleRequest(api.post("/coupons", data));
export const getCoupon = (id) => handleRequest(api.get(`/coupons/${id}`));
export const updateCoupon = (id, data) => handleRequest(api.put(`/coupons/${id}`, data));
export const deleteCoupon = (id) => handleRequest(api.delete(`/coupons/${id}`));

// ===============================
// 🔹 TESTIMONIOS
// ===============================
// ===============================
// 🔹 TESTIMONIOS
// ===============================
export const getTestimonios = () => handleRequest(api.get("/testimonios"));

// Para crear testimonio con foto
// export const createTestimonio = (data) => {
//   return handleRequest(
//     api.post("/testimonios", data, {
//       headers: { "Content-Type": "multipart/form-data" },
//     })
//   );
// };   no añada Content-Type: application/json, porque axios detecta automáticamente multipart/form-data:
export const createTestimonio = (data) =>
  handleRequest(api.post("/testimonios", data)); // FormData

export const updateTestimonio = (id, data) => handleRequest(api.put(`/testimonios/${id}`, data));
export const deleteTestimonio = (id) => handleRequest(api.delete(`/testimonios/${id}`));

// =======================
//  GET PRODUCT IMAGE
// =======================
const API = import.meta.env.VITE_API_URL;

export function getImageUrl(image) {
  if (!image) return "/images/default-product.jpg";

  let url = image;

  // Si viene como objeto (images[x])
  if (typeof image === "object") {
    url = image.image_path;
  }

  if (!url) return "/images/default-product.jpg";

  // Si viene con doble URL, extraer solo la parte Cloudinary
  if (url.includes("https://res.cloudinary.com")) {
    const cloudUrl = url.split("https://res.cloudinary.com")[1];
    return "https://res.cloudinary.com" + cloudUrl;
  }

  // Si ya es URL válida
  if (url.startsWith("http")) return url;

  // Fallback
  return "/images/default-product.jpg";
}




 


// =======================
//  GET USER PROFILE IMAGE
// =======================
export function getUserImageUrl(user) {
  let image = user?.photo;
  if (!user?.photo) return "/images/default-profile.jpg";

  // Normalizar: si ya es URL completa, devolver tal cual
  if (image.startsWith("http://") || image.startsWith("https://")) {
    // Evitar doble 'storage/' en Cloudinary
    if (image.includes("res.cloudinary.com")) return image;
    return image;
  }

  return `${API.replace(/\/$/, "")}/storage/${user.photo.replace(/^\/?/, "")}`;
}


// =======================
//  GET MEDIA FILE (video | audio | image)
// =======================
export function getMediaUrl(item) {
  const media = item?.media_filename;

  if (!media) return "/images/default-product.jpg";

  if (media.startsWith("https://") || media.startsWith("http://")) return media;

  return `${API.replace(/\/$/, "")}/storage/${media.replace(/^\/?/, "")}`;
}


// =======================
//  IS VIDEO?
// =======================
export function isVideo(item) {
  return item?.media_type?.startsWith("video");
}





export default api;
