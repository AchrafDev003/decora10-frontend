// src/context/CartContext.jsx
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "../AuthContext";
import {
  getCart as apiGetCart,
  addToCart as apiAddToCart,
  updateCart as apiUpdateCart,
  removeFromCart as apiRemoveFromCart,
  emptyCart as apiEmptyCart,
  getCartTotal as apiGetCartTotal,
} from "../../services/api";


const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], total: 0 });

  // ------------------- Helper para calcular total en frontend -------------------
  const calcCartTotal = (items) =>
    items?.reduce(
      (sum, item) =>
        sum + (item.price || item.product?.promo_price || item.product?.price || 0) * item.quantity,
      0
    ) || 0;

  // ------------------- Sincronizar carrito invitado al login -------------------
  const syncCartWithUser = useCallback(
    async (guestCart = []) => {
      if (!user || !guestCart.length) return;
      try {
        await Promise.all(
          guestCart.map((item) => apiAddToCart(item.product_id, item.quantity))
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

  // ------------------- Obtener carrito -------------------
  const fetchCart = useCallback(async () => {
    try {

      const res = await apiGetCart();
      if (res.success && res.data) {
        const totalRes = await apiGetCartTotal();
        const total = totalRes.success ? totalRes.data.total : calcCartTotal(res.data.items);
        setCart({ items: res.data.items || [], total });
      } else {
        setCart({ items: [], total: 0 });
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
      setCart({ items: [], total: 0 });
    }
  }, [user]);

  // ------------------- Añadir al carrito -------------------
 const addToCart = async (product, quantity = 1) => {
  if (!product?.id) {
    toast.error("Producto inválido");
    return;
  }

  try {
    

    // Usuario autenticado: llamar a la API
    const res = await apiAddToCart(product.id, quantity); // POST /cart/items/{id} {quantity}

    if (res.success) {
      //toast.success("Producto añadido al carrito");
      await fetchCart(); // refresca el carrito del backend
    } else {
      toast.error(res.error || "No se pudo añadir al carrito");
    }
  } catch (err) {
    console.error("Error al añadir al carrito:", err);
    toast.error("No se pudo añadir al carrito");
  }
};

  // ------------------- Actualizar cantidad -------------------
  const updateCartItem = async (productId, quantity) => {
    try {
      if (!user) return;
      await apiUpdateCart(productId, quantity); // PUT /cart/items/{id} {quantity}
      await fetchCart();
    } catch (err) {
      console.error(err);
      toast.error("No se pudo actualizar la cantidad");
    }
  };

  // ------------------- Eliminar producto -------------------
  const removeCartItem = async (productId) => {
    try {
     

      await apiRemoveFromCart(productId); // DELETE /cart/items/{id}
      toast.success("Producto eliminado del carrito");
      await fetchCart();
    } catch (err) {
      console.error(err);
      toast.error("No se pudo eliminar el producto");
    }
  };

  // ------------------- Vaciar carrito -------------------
  const clearCart = async () => {
    try {
      

      await apiEmptyCart(); // DELETE /cart
      toast.success("Carrito vaciado");
      await fetchCart();
    } catch (err) {
      console.error(err);
      toast.error("No se pudo vaciar el carrito");
    }
  };

  // ------------------- Checkout -------------------
  const checkout = async (data) => {
    try {
      if (!user) {
        toast.error("Debes iniciar sesión para realizar el checkout");
        return { success: false, error: "No autenticado" };
      }

      const res = await apiEmptyCart(data); // POST /cart/checkout
      if (res.success) {
        setCart({ items: [], total: 0 });
        toast.success("Orden creada correctamente");
      }
      return res;
    } catch (err) {
      console.error(err);
      toast.error("Error al procesar el checkout");
      return { success: false, error: err.message };
    }
  };

  // ------------------- Inicialización -------------------
  useEffect(() => {
    const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");

    if (user) {
      if (guestCart.length) syncCartWithUser(guestCart);
      else fetchCart();
    } else if (guestCart.length) {
      setCart({ items: guestCart, total: calcCartTotal(guestCart) });
    }
  }, [user, syncCartWithUser, fetchCart]);

  return (
    <CartContext.Provider
      value={{
        cartItems: cart.items || [],
        total: cart.total || 0,
        addToCart,
        updateCartItem,
        removeCartItem,
        clearCart,
        fetchCart,
        syncCartWithUser,
        checkout,
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
