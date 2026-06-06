import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';
import { addToCart as addToCartApi, fetchCart, removeCartItem as removeCartItemApi, updateCartItem as updateCartItemApi } from '../services/cartService';

const CartContext = createContext(null);

const mapCartItem = (cartItem) => ({
  id: cartItem.product._id,
  name: cartItem.product.name,
  price: cartItem.product.price,
  quantity: cartItem.quantity,
  imageUrl: cartItem.product.imageUrl || '',
  category: cartItem.product.category,
  availability: cartItem.product.availability || 'In Stock',
});

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const { user, loading } = useAuth();

  const loadCart = useCallback(async () => {
    if (!user || user.role !== 'customer') {
      setItems([]);
      return;
    }

    try {
      const response = await fetchCart();
      setItems(response.data.cart.map(mapCartItem));
    } catch (error) {
      toast.error('Unable to load your cart.');
    }
  }, [user]);

  useEffect(() => {
    if (!loading) {
      loadCart();
    }
  }, [loading, loadCart]);

  const addItem = async (product, quantity = 1) => {
    if (!user || user.role !== 'customer') {
      toast.info('Please log in as a customer to add items to your cart.');
      return;
    }

    try {
      const response = await addToCartApi(product._id, quantity);
      setItems(response.data.cart.map(mapCartItem));
      toast.success(`${product.name} added to cart.`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to add item to cart.');
    }
  };

  const updateItem = async (id, quantity) => {
    try {
      const response = await updateCartItemApi(id, Math.max(quantity, 1));
      setItems(response.data.cart.map(mapCartItem));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update cart item.');
    }
  };

  const removeItem = async (id) => {
    try {
      const response = await removeCartItemApi(id);
      setItems(response.data.cart.map(mapCartItem));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to remove cart item.');
    }
  };

  const clearCart = () => setItems([]);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const deliveryCharge = items.length > 0 ? 30 : 0;
  const total = subtotal + deliveryCharge;

  return (
    <CartContext.Provider value={{ items, addItem, updateItem, removeItem, clearCart, subtotal, deliveryCharge, total }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
