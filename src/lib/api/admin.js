// lib/api/admin.js - Admin API Client

import apiClient from './client';

export const adminApi = {
  // ============================================
  // DASHBOARD
  // ============================================

  getDashboardStats: async () => {
    const response = await apiClient.get('/admin/dashboard/stats');
    // Return the data object directly
    return response.data?.data || response.data;
  },

  getRecentOrders: async (limit = 10) => {
    const response = await apiClient.get('/admin/dashboard/recent-orders', {
      params: { limit }
    });
    // Return the data array directly, not the wrapper object
    return response.data?.data || response.data || [];
  },

  getTopProducts: async (limit = 5) => {
    const response = await apiClient.get('/admin/dashboard/top-products', {
      params: { limit }
    });
    // Return the data array directly, not the wrapper object
    return response.data?.data || response.data || [];
  },

  getSalesChart: async (period = 7) => {
    const response = await apiClient.get('/admin/dashboard/sales-chart', {
      params: { period }
    });
    // Return the data array directly, not the wrapper object
    return response.data?.data || response.data || [];
  },

  getRevenueByCategory: async () => {
    const response = await apiClient.get('/admin/dashboard/revenue-by-category');
    return response.data;
  },

  getUserGrowth: async (period = 30) => {
    const response = await apiClient.get('/admin/dashboard/user-growth', {
      params: { period }
    });
    return response.data;
  },

  // ============================================
  // PRODUCTS MANAGEMENT
  // ============================================

  getAllProducts: async (params = {}) => {
    const response = await apiClient.get('/admin/products', { params });
    // Return the full response (includes data and pagination)
    return response.data;
  },

  getProductById: async (id) => {
    const response = await apiClient.get(`/admin/products/${id}`);
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await apiClient.post('/admin/products', productData);
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await apiClient.put(`/admin/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await apiClient.delete(`/admin/products/${id}`);
    return response.data;
  },

  updateStock: async (id, stockData) => {
    const response = await apiClient.patch(`/admin/products/${id}/stock`, stockData);
    return response.data;
  },

  toggleFeatured: async (id) => {
    const response = await apiClient.patch(`/admin/products/${id}/featured`);
    return response.data;
  },

  updateProductStatus: async (id, status) => {
    const response = await apiClient.patch(`/admin/products/${id}/status`, { status });
    return response.data;
  },

  bulkDeleteProducts: async (productIds) => {
    const response = await apiClient.post('/admin/products/bulk-delete', { productIds });
    return response.data;
  },

  // ============================================
  // ORDERS MANAGEMENT
  // ============================================

  getOrderStats: async () => {
    const response = await apiClient.get('/admin/orders/stats');
    return response.data;
  },

  getAllOrders: async (params = {}) => {
    const response = await apiClient.get('/admin/orders', { params });
    return response.data;
  },

  getOrderById: async (id) => {
    const response = await apiClient.get(`/admin/orders/${id}`);
    return response.data;
  },

  updateOrderStatus: async (id, status) => {
    const response = await apiClient.put(`/admin/orders/${id}/status`, { status });
    return response.data;
  },

  updateTracking: async (id, trackingData) => {
    const response = await apiClient.put(`/admin/orders/${id}/tracking`, trackingData);
    return response.data;
  },

  addOrderNotes: async (id, notes) => {
    const response = await apiClient.post(`/admin/orders/${id}/notes`, { notes });
    return response.data;
  },

  cancelOrder: async (id) => {
    const response = await apiClient.delete(`/admin/orders/${id}`);
    return response.data;
  },

  // ============================================
  // USERS MANAGEMENT
  // ============================================

  getUsersStats: async () => {
    const response = await apiClient.get('/admin/users/stats');
    return response.data;
  },

  getAllUsers: async (params = {}) => {
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  },

  getUserById: async (id) => {
    const response = await apiClient.get(`/admin/users/${id}`);
    return response.data;
  },

  getUserOrders: async (id, params = {}) => {
    const response = await apiClient.get(`/admin/users/${id}/orders`, { params });
    return response.data;
  },

  updateUserStatus: async (id, status) => {
    const response = await apiClient.patch(`/admin/users/${id}/status`, { status });
    return response.data;
  }
};

export default adminApi;
