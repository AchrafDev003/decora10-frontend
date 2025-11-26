// src/components/ProductCard.jsx
import { useCart } from './CartContext';

export default function ProductCard({ product }) {
  const { dispatch } = useCart();

  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} width="100" />
      <h4>{product.name}</h4>
      <p>{product.price} €</p>
      <button onClick={() => dispatch({ type: 'ADD_TO_CART', payload: product })}>
        Añadir al carrito
      </button>
    </div>
  );
}
