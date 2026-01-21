import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  addToCart as apiAddToCart,
  removeFromCart as apiRemoveFromCart,
  getCart,
} from "../../services/api";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =============================
     🔹 Cargar carrito desde backend
  ============================== */
  const fetchCart = async () => {
    try {
      const res = await getCart();
      if (res.success) {
        setCartItems(res.data.items || []);
      }
    } catch {
      console.error("Error cargando carrito");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  /* =============================
     🔹 Añadir al carrito (BACKEND)
  ============================== */
  const addToCart = async (
    itemId,
    quantity = 1,
    type = "product",
    measure = null
  ) => {
    try {
      const res = await apiAddToCart(itemId, quantity, type, measure);

      if (!res.success) {
        toast.error(res.message || "No se pudo añadir al carrito");
        return;
      }

      await fetchCart();
      toast.success("Producto añadido al carrito");
    } catch (err) {
      toast.error("Error al añadir al carrito");
      console.error(err);
    }
  };

  /* =============================
     🔹 Eliminar item
  ============================== */
  const removeFromCart = async (itemId, type = "product") => {
    try {
      const res = await apiRemoveFromCart(itemId, type);

      if (!res.success) {
        toast.error("No se pudo eliminar el producto");
        return;
      }

      await fetchCart();
      toast.success("Producto eliminado del carrito");
    } catch {
      toast.error("Error al eliminar del carrito");
    }
  };

  /* =============================
     🔹 Vaciar carrito
  ============================== */
  const clearCart = async () => {
    try {
      await fetchCart();
      toast.success("Carrito vaciado");
    } catch {
      toast.error("Error al vaciar carrito");
    }
  };

  /* =============================
     🔹 Totales
  ============================== */
  const totalItems = cartItems.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.total_price,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        totalItems,
        totalPrice,
        loading,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
