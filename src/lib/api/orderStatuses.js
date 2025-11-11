// lib/api/orderStatuses.js - Order Statuses API

import client from './client.js';

/**
 * Get all active order statuses
 * @returns {Promise} Order statuses
 */
export const getOrderStatuses = async () => {
  const response = await client.get('/order-statuses');
  return response;
};

/**
 * Get all order statuses (Admin - including inactive)
 * @returns {Promise} All order statuses
 */
export const getAllOrderStatusesAdmin = async () => {
  const response = await client.get('/order-statuses/admin');
  return response;
};

/**
 * Create new order status (Admin only)
 * @param {Object} statusData - Status data
 * @returns {Promise} Created status
 */
export const createOrderStatus = async (statusData) => {
  const response = await client.post('/order-statuses/admin', statusData);
  return response;
};

/**
 * Update order status (Admin only)
 * @param {string} id - Status ID
 * @param {Object} statusData - Updated status data
 * @returns {Promise} Updated status
 */
export const updateOrderStatus = async (id, statusData) => {
  const response = await client.put(`/order-statuses/admin/${id}`, statusData);
  return response;
};

/**
 * Delete order status (Admin only)
 * @param {string} id - Status ID
 * @returns {Promise} Deletion result
 */
export const deleteOrderStatus = async (id) => {
  const response = await client.delete(`/order-statuses/admin/${id}`);
  return response;
};

/**
 * Reorder statuses (Admin only)
 * @param {Array} statuses - Array of {id, order}
 * @returns {Promise} Reorder result
 */
export const reorderStatuses = async (statuses) => {
  const response = await client.put('/order-statuses/admin/reorder', { statuses });
  return response;
};

export default {
  getOrderStatuses,
  getAllOrderStatusesAdmin,
  createOrderStatus,
  updateOrderStatus,
  deleteOrderStatus,
  reorderStatuses
};
