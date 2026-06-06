import api from '../api/api';

export const fetchCart = () => api.get('/cart');
export const addToCart = (productId, quantity = 1) => api.post('/cart', { productId, quantity });
export const updateCartItem = (productId, quantity) => api.put(`/cart/${productId}`, { quantity });
export const removeCartItem = (productId) => api.delete(`/cart/${productId}`);
