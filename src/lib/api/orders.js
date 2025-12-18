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
  PAYMENT_HOLD: 'payment_hold',
  ORDERED: 'ordered',
  CANCELLED: 'cancelled',
  ARRIVED_US_WAREHOUSE: 'arrived_us_warehouse',
  SHIPPED_TO_ISRAEL: 'shipped_to_israel',
  CUSTOMS_ISRAEL: 'customs_israel',
  ARRIVED_ISRAEL_WAREHOUSE: 'arrived_israel_warehouse',
  SHIPPED_TO_CUSTOMER: 'shipped_to_customer',
  DELIVERED: 'delivered'
};

/**
 * Order status labels (Hebrew)
 */
export const ORDER_STATUS_LABELS = {
  pending: 'ממתין לאישור',
  payment_hold: 'מסגרת אשראי תפוסה',
  ordered: 'הוזמן מארה"ב',
  cancelled: 'בוטל',
  arrived_us_warehouse: 'הגיע למחסן ארה"ב',
  shipped_to_israel: 'נשלח לישראל',
  customs_israel: 'במכס בישראל',
  arrived_israel_warehouse: 'הגיע למחסן בישראל',
  shipped_to_customer: 'נשלח אליך',
  delivered: 'נמסר'
};

/**
 * Order status colors
 */
export const ORDER_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  payment_hold: 'bg-orange-100 text-orange-800',
  ordered: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
  arrived_us_warehouse: 'bg-indigo-100 text-indigo-800',
  shipped_to_israel: 'bg-purple-100 text-purple-800',
  customs_israel: 'bg-pink-100 text-pink-800',
  arrived_israel_warehouse: 'bg-cyan-100 text-cyan-800',
  shipped_to_customer: 'bg-teal-100 text-teal-800',
  delivered: 'bg-green-100 text-green-800'
};

// ==================== CUSTOMER CANCELLATION (Phase 4) ====================

/**
 * בקשת ביטול פריט
 * @param {string} orderId - Order ID
 * @param {string} itemId - Item ID
 * @param {string} [reason] - Cancellation reason (optional)
 * @returns {Promise} Cancellation result
 */
export const requestCancelItem = async (orderId, itemId, reason) => {
  const response = await client.post(
    `/orders/${orderId}/items/${itemId}/request-cancel`,
    { reason }
  );
  return response;
};

/**
 * בדיקת אפשרות ביטול פריט
 * @param {string} orderId - Order ID
 * @param {string} itemId - Item ID
 * @returns {Promise} Cancellation eligibility
 */
export const checkCanCancelItem = async (orderId, itemId) => {
  const response = await client.get(
    `/orders/${orderId}/items/${itemId}/can-cancel`
  );
  return response;
};