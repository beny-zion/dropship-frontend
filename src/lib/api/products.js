import apiClient from './client';

export const productsApi = {
  // Get all products
  getProducts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiClient.get(`/products?${queryString}`);
  },

  // Get single product
  getProduct: async (id) => {
    return await apiClient.get(`/products/${id}`);
  },

  // Get categories
  getCategories: async () => {
    return await apiClient.get('/products/categories');
  },

  // Track click
  trackClick: async (id) => {
    return await apiClient.post(`/products/${id}/click`);
  },
};