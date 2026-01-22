import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import {
  getCart,
  getCartTotal,
  addToCart as apiAddToCart,
  updateCartItem as apiUpdateCartItem,
  removeFromCart as apiRemoveFromCart,
  emptyCart as apiEmptyCart,
} from "../../services/api";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);

  /* =============================
     🔹 Cargar carrito
  ============================== */
  const fetchCart = async () => {
    try {
      const res = await getCart();
      if (res.success) setCartItems(res.data?.items ?? []);
      else setCartItems([]);
    } catch (err) {
      console.error("fetchCart error:", err);
      setCartItems([]);
    }
  };

  /* =============================
     🔹 Cargar total del carrito
  ============================== */
  const fetchTotal = async () => {
    try {
      const res = await getCartTotal();
      if (res.success) setTotalPrice(Number(res.data?.total ?? 0));
      else setTotalPrice(0);
    } catch (err) {
      console.error("fetchTotal error:", err);
      setTotalPrice(0);
    }
  };

  /* =============================
     🔹 Inicialización
  ============================== */
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchCart();
      await fetchTotal();
      setLoading(false);
    };
    init();
  }, []);

  /* =============================
     🔹 Añadir item (producto o pack)
     POST /cart/items
  ============================== */
  const addToCart = async (id, quantity = 1, type = "product", measure = null) => {
    try {
      const payload = { id, quantity, type, measure }; // ✅ backend espera "id"
      const res = await apiAddToCart(payload);

      if (!res.success) {
        toast.error(res.message || "No se pudo añadir al carrito");
        return;
      }

      await fetchCart();
      await fetchTotal();
      toast.success(`${type === "pack" ? "Pack" : "Producto"} añadido al carrito`);
    } catch (err) {
      console.error("addToCart error:", err);
      toast.error("Error al añadir al carrito");
    }
  };

  /* =============================
     🔹 Actualizar cantidad de un item
     PUT /cart/items/{item}
  ============================== */
  const updateCartItem = async (itemId, quantity, measure = null) => {
    if (quantity < 1) return;

    try {
      const payload = { quantity, measure };
      const res = await apiUpdateCartItem(itemId, payload);

      if (!res.success) {
        toast.error(res.message || "No se pudo actualizar la cantidad");
        return;
      }

      // Refrescar carrito completo para actualizar totales y subtotales
      await fetchCart();
      await fetchTotal();
      toast.success("Cantidad actualizada correctamente");
    } catch (err) {
      console.error("updateCartItem error:", err);
      toast.error("Error al actualizar el carrito");
    }
  };

  /* =============================
     🔹 Eliminar item
     DELETE /cart/items/{item}
  ============================== */
  const removeCartItem = async (itemId) => {
    try {
      const res = await apiRemoveFromCart(itemId);

      if (!res.success) {
        toast.error(res.message || "No se pudo eliminar el producto");
        return;
      }

      await fetchCart();
      await fetchTotal();
      toast.success("Producto eliminado del carrito");
    } catch (err) {
      console.error("removeCartItem error:", err);
      toast.error("Error al eliminar del carrito");
    }
  };

  /* =============================
     🔹 Vaciar carrito
     DELETE /cart
  ============================== */
  const clearCart = async () => {
    try {
      const res = await apiEmptyCart();

      if (!res.success) {
        toast.error(res.message || "No se pudo vaciar el carrito");
        return;
      }

      setCartItems([]);
      setTotalPrice(0);
      toast.success("Carrito vaciado");
    } catch (err) {
      console.error("clearCart error:", err);
      toast.error("Error al vaciar el carrito");
    }
  };

  /* =============================
     🔹 Totales locales
  ============================== */
  const totalItems = cartItems.reduce(
    (acc, item) => acc + Number(item.quantity || 0),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItems,
        totalPrice,
        loading,
        fetchCart,
        addToCart,
        updateCartItem,
        removeCartItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de CartProvider");
  }
  return context;
};
