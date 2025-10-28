// lib/api/admin.js - Admin API Client

import apiClient from './client';

export const adminApi = {
  // ============================================
  // DASHBOARD
  // ============================================

  getDashboardStats: async () => {
    return await apiClient.get('/admin/dashboard/stats', {
      params: { _t: Date.now() }
    });
  },

  getRecentOrders: async (limit = 10) => {
    return await apiClient.get('/admin/dashboard/recent-orders', {
      params: { limit, _t: Date.now() }
    });
  },

  getTopProducts: async (limit = 5) => {
    return await apiClient.get('/admin/dashboard/top-products', {
      params: { limit, _t: Date.now() }
    });
  },

  getSalesChart: async (period = 7) => {
    return await apiClient.get('/admin/dashboard/sales-chart', {
      params: { period, _t: Date.now() }
    });
  },

  getRevenueByCategory: async () => {
    return await apiClient.get('/admin/dashboard/revenue-by-category');
  },

  getUserGrowth: async (period = 30) => {
    return await apiClient.get('/admin/dashboard/user-growth', {
      params: { period }
    });
  },

  // ============================================
  // PRODUCTS MANAGEMENT
  // ============================================

  getAllProducts: async (params = {}) => {
    return await apiClient.get('/admin/products', { params });
  },

  getProductById: async (id) => {
    return await apiClient.get(`/admin/products/${id}`);
  },

  createProduct: async (productData) => {
    return await apiClient.post('/admin/products', productData);
  },

  updateProduct: async (id, productData) => {
    return await apiClient.put(`/admin/products/${id}`, productData);
  },

  deleteProduct: async (id) => {
    return await apiClient.delete(`/admin/products/${id}`);
  },

  updateStock: async (id, stockData) => {
    return await apiClient.patch(`/admin/products/${id}/stock`, stockData);
  },

  toggleFeatured: async (id) => {
    return await apiClient.patch(`/admin/products/${id}/featured`);
  },

  updateProductStatus: async (id, status) => {
    return await apiClient.patch(`/admin/products/${id}/status`, { status });
  },

  bulkDeleteProducts: async (productIds) => {
    return await apiClient.post('/admin/products/bulk-delete', { productIds });
  },

  // ============================================
  // IMAGE UPLOAD
  // ============================================

  uploadImage: async (imageData) => {
    return await apiClient.post('/upload/image', imageData);
  },

  // ============================================
  // ORDERS MANAGEMENT
  // ============================================

  getOrderStats: async () => {
    return await apiClient.get('/admin/orders/stats');
  },

  getAllOrders: async (params = {}) => {
    return await apiClient.get('/admin/orders', { params });
  },

  getOrderById: async (id) => {
    return await apiClient.get(`/admin/orders/${id}`);
  },

  updateOrderStatus: async (id, status) => {
    return await apiClient.put(`/admin/orders/${id}/status`, { status });
  },

  updateTracking: async (id, trackingData) => {
    return await apiClient.put(`/admin/orders/${id}/tracking`, trackingData);
  },

  addOrderNotes: async (id, notes) => {
    return await apiClient.post(`/admin/orders/${id}/notes`, { notes });
  },

  cancelOrder: async (id) => {
    return await apiClient.delete(`/admin/orders/${id}`);
  },

  // ============================================
  // USERS MANAGEMENT
  // ============================================

  getUsersStats: async () => {
    return await apiClient.get('/admin/users/stats');
  },

  getAllUsers: async (params = {}) => {
    return await apiClient.get('/admin/users', { params });
  },

  getUserById: async (id) => {
    return await apiClient.get(`/admin/users/${id}`);
  },

  getUserOrders: async (id, params = {}) => {
    return await apiClient.get(`/admin/users/${id}/orders`, { params });
  },

  updateUserStatus: async (id, status) => {
    return await apiClient.patch(`/admin/users/${id}/status`, { status });
  }
};

export default adminApi;
