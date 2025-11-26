// src/Context/Carrito/CartContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-hot-toast";

/**
 * @typedef {Object} CartItem
 * @property {number|string} id
 * @property {string} name
 * @property {number} price
 * @property {number} quantity
 * @property {string} [image]
 * @property {boolean} [is_promo]
 * @property {number} [promo_price]
 */

const CartContext = createContext();

/**
 * CartProvider: Contexto global para carrito de compras
 */
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const storedCart = localStorage.getItem("cartItems");
    return storedCart ? JSON.parse(storedCart) : [];
  });

  // Guardar cambios automáticamente en localStorage
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  /** Agrega un producto al carrito con restricciones */
  const addToCart = (product) => {
    const existingProduct = cartItems.find(item => item.id === product.id);
    const currentTotal = cartItems.reduce((sum, item) => sum + item.quantity * (item.promo_price || item.price), 0);
    const nextTotal = currentTotal + (product.promo_price || product.price);

    if (existingProduct && existingProduct.quantity >= 3) {
      toast.error("No puedes añadir más de 3 unidades del mismo producto.");
      return;
    }

    if (nextTotal > 1000) {
      toast.error("El total del carrito no puede superar los 1000 €.");
      return;
    }

    if (existingProduct) {
      setCartItems(cartItems.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }

    toast.success(`${product.name} agregado al carrito`);
  };

  /** Elimina un producto del carrito */
  const removeFromCart = (id) => {
    const product = cartItems.find(item => item.id === id);
    if (!product) return;

    setCartItems(cartItems.filter(item => item.id !== id));
    toast.success(`${product.name} eliminado del carrito`);
  };

  /** Vacía todo el carrito */
  const clearCart = () => {
    if (cartItems.length === 0) return;
    setCartItems([]);
    toast.success("Carrito vacío");
  };

  /** Total de productos en carrito */
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  /** Total monetario */
  const totalPrice = cartItems.reduce((acc, item) => acc + item.quantity * (item.promo_price || item.price), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      clearCart,
      totalItems,
      totalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
};

/** Hook personalizado para usar el carrito */
export const useCart = () => useContext(CartContext);
