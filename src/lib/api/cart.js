import apiClient from './client';

export const cartApi = {
  // Get cart
  getCart: async () => {
    return await apiClient.get('/cart');
  },

  // Add to cart
  addToCart: async (productId, quantity = 1) => {
    return await apiClient.post('/cart/add', { productId, quantity });
  },

  // Update cart item
  updateCartItem: async (productId, quantity) => {
    return await apiClient.put(`/cart/update/${productId}`, { quantity });
  },

  // Remove from cart
  removeFromCart: async (productId) => {
    return await apiClient.delete(`/cart/remove/${productId}`);
  },

  // Clear cart
  clearCart: async () => {
    return await apiClient.delete('/cart/clear');
  },
};