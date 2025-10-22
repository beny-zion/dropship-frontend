import apiClient from './client';

export const ordersApi = {
  // Create order
  createOrder: async (orderData) => {
    return await apiClient.post('/orders', orderData);
  },

  // Get my orders
  getMyOrders: async (page = 1, limit = 10) => {
    return await apiClient.get(`/orders/my-orders?page=${page}&limit=${limit}`);
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    return await apiClient.get(`/orders/${orderId}`);
  },
};