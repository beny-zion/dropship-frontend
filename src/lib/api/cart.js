import apiClient from './client';

export const cartApi = {
  // Get cart
  getCart: async () => {
    return await apiClient.get('/cart');
  },

  // Add to cart
  addToCart: async (productId, quantity = 1, variantSku = null) => {
    return await apiClient.post('/cart/add', { productId, quantity, variantSku });
  },

  // Update cart item
  updateCartItem: async (productId, quantity, variantSku = null) => {
    return await apiClient.put(`/cart/update/${productId}`, { quantity, variantSku });
  },

  // Remove from cart
  removeFromCart: async (productId, variantSku = null) => {
    const params = variantSku ? `?variantSku=${variantSku}` : '';
    return await apiClient.delete(`/cart/remove/${productId}${params}`);
  },

  // Clear cart
  clearCart: async () => {
    return await apiClient.delete('/cart/clear');
  },
};