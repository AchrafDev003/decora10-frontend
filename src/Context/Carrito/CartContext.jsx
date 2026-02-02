import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "../AuthContext";
import {
  getCart as apiGetCart,
  addToCart as apiAddToCart,
  updateCartItem as apiUpdateCartItem,
  removeFromCart as apiRemoveFromCart,
  emptyCart as apiEmptyCart,
} from "../../services/api";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], total: 0 });

  // Calcular total
  const calcCartTotal = (items) =>
    items?.reduce((sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 1), 0) || 0;

  // Obtener carrito
  const fetchCart = useCallback(async () => {
    try {
      const res = await apiGetCart();
      if (res.success && res.data) {
        const items = res.data.items || [];
        console.log("Carrito cargado:", items);
        setCart({ items, total: calcCartTotal(items) });
      } else {
        setCart({ items: [], total: 0 });
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
      setCart({ items: [], total: 0 });
    }
  }, []);

  // Añadir al carrito
  const addToCart = async ({ id, quantity = 1, type = "product", measure = null }) => {
    if (!id) {
      toast.error("Elemento inválido");
      return;
    }

    try {
      const payload = { id, quantity, type, measure };
      const res = await apiAddToCart(payload);

      if (res.success) {
        toast.success(type === "pack" ? "Pack añadido al carrito" : "Producto añadido al carrito");
        await fetchCart();
      } else {
        toast.error(res.message || "No se pudo añadir al carrito");
      }
    } catch (err) {
      console.error("addToCart error:", err);
      toast.error("No se pudo añadir al carrito");
    }
  };
 // ------------------- Sincronizar carrito invitado al login -------------------
  const syncCartWithUser = useCallback(
    async (guestCart = []) => {
      if (!user || !guestCart.length) return;
      try {
        await Promise.all(
          guestCart.map((item) => apiAddToCart({
            item_id: item.id,
            quantity: item.quantity,
            type: item.type || "product",
            measure: item.measure || null,
          }))
        );
        localStorage.removeItem("guestCart");
        await fetchCart();
        toast.success("Carrito sincronizado con tu cuenta!");
      } catch (err) {
        console.error("Error sincronizando carrito:", err);
        toast.error("No se pudo sincronizar el carrito");
      }
    },
    [user]
  );

  // Actualizar item
  const updateCartItem = async (itemId, quantity, measure = null) => {
    if (!itemId || quantity < 1) return;
    try {
      const res = await apiUpdateCartItem(itemId, { quantity, measure });
      if (res.success) await fetchCart();
      else toast.error(res.message || "No se pudo actualizar el carrito");
    } catch (err) {
      console.error(err);
      toast.error("No se pudo actualizar el carrito");
    }
  };

  // Eliminar item
  const removeCartItem = async (itemId) => {
    if (!itemId) return;
    try {
      const res = await apiRemoveFromCart(itemId);
      if (res.success) {
        toast.success("Producto eliminado del carrito");
        await fetchCart();
      } else {
        toast.error(res.message || "No se pudo eliminar el producto");
      }
    } catch (err) {
      console.error(err);
      toast.error("No se pudo eliminar el producto");
    }
  };

  // Vaciar carrito
  const clearCart = async () => {
    try {
      const res = await apiEmptyCart();
      if (res.success) {
        toast.success("Carrito vaciado");
        setCart({ items: [], total: 0 });
      } else {
        toast.error(res.message || "No se pudo vaciar el carrito");
      }
    } catch (err) {
      console.error(err);
      toast.error("No se pudo vaciar el carrito");
    }
  };

  // Inicialización: carrito invitado o usuario logueado
  useEffect(() => {
    const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
    if (user) {
      if (guestCart.length) {
        // Sincroniza carrito invitado al login
        Promise.all(
          guestCart.map((item) =>
            addToCart({
              id: item.id,
              quantity: item.quantity,
              type: item.type || "product",
              measure: item.measure || null,
            })
          )
        ).then(() => localStorage.removeItem("guestCart"));
      } else fetchCart();
    } else if (guestCart.length) {
      setCart({ items: guestCart, total: calcCartTotal(guestCart) });
    }
  }, [user]);

  return (
    <CartContext.Provider
      value={{
        cartItems: cart.items,
        total: cart.total,
        addToCart,
        updateCartItem,
        removeCartItem,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe usarse dentro de CartProvider");
  return context;
};
