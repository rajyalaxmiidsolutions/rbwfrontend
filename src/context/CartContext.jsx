import { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { getCart as fetchCart, addToCart as addItem, removeFromCart as removeItem, clearCart as clearItems } from '../services/api';
import toast from 'react-hot-toast';

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    } else {
      setItems([]);
    }
  }, [isAuthenticated]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const { data } = await fetchCart();
      setItems(data.items || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity) => {
    try {
      const { data } = await addItem({ productId, quantity });
      setItems(data.items || []);
      toast.success('Added to cart');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const { data } = await removeItem(productId);
      setItems(data.items || []);
      toast.success('Removed from cart');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const { data } = await addItem({ productId, quantity });
      setItems(data.items || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update quantity');
    }
  };

  const clearCartItems = async () => {
    try {
      await clearItems();
      setItems([]);
    } catch {
      toast.error('Failed to clear cart');
    }
  };

  const cartTotal = items.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, loading, cartTotal, cartCount,
      addToCart, removeFromCart, updateQuantity, clearCart: clearCartItems, loadCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};
