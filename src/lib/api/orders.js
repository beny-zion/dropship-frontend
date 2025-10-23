// lib/api/orders.js - Enhanced for Week 4

import client from './client.js';

/**
 * Get my orders with filtering and pagination
 * @param {Object} params - Query parameters
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=10] - Items per page
 * @param {string} [params.status] - Filter by status
 * @param {string} [params.sortBy='-createdAt'] - Sort field
 * @returns {Promise} Orders data with pagination
 */
export const getMyOrders = async (params = {}) => {
  const { page = 1, limit = 10, status, sortBy = '-createdAt' } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sortBy
  });

  if (status && status !== 'all') {
    queryParams.append('status', status);
  }

  const response = await client.get(`/orders/my-orders?${queryParams.toString()}`);
  return response;
};

/**
 * Get single order by ID
 * @param {string} id - Order ID
 * @returns {Promise} Order data
 */
export const getOrderById = async (id) => {
  const response = await client.get(`/orders/${id}`);
  return response;
};

/**
 * Get order statistics
 * @returns {Promise} Order statistics
 */
export const getOrderStats = async () => {
  const response = await client.get('/orders/stats');
  return response;
};

/**
 * Create new order
 * @param {Object} orderData - Order data
 * @param {Array} orderData.items - Order items
 * @param {Object} orderData.shippingAddress - Shipping address
 * @returns {Promise} Created order
 */
export const createOrder = async (orderData) => {
  const response = await client.post('/orders', orderData);
  return response;
};

/**
 * Cancel order
 * @param {string} id - Order ID
 * @returns {Promise} Updated order
 */
export const cancelOrder = async (id) => {
  const response = await client.put(`/orders/${id}/cancel`);
  return response;
};

/**
 * Update order status (Admin only)
 * @param {string} id - Order ID
 * @param {string} status - New status
 * @returns {Promise} Updated order
 */
export const updateOrderStatus = async (id, status) => {
  const response = await client.put(`/orders/${id}/status`, { status });
  return response;
};

// ==================== TYPES (for documentation) ====================

/**
 * @typedef {Object} Order
 * @property {string} _id
 * @property {string} orderNumber
 * @property {Object} user
 * @property {Array} items
 * @property {Object} shippingAddress
 * @property {number} subtotal
 * @property {number} shippingCost
 * @property {number} tax
 * @property {number} totalAmount
 * @property {string} status - 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string} [deliveredAt]
 */

/**
 * Order status options
 */
export const ORDER_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

/**
 * Order status labels (Hebrew)
 */
export const ORDER_STATUS_LABELS = {
  pending: 'ממתין',
  processing: 'בטיפול',
  shipped: 'נשלח',
  delivered: 'נמסר',
  cancelled: 'בוטל'
};

/**
 * Order status colors
 */
export const ORDER_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};