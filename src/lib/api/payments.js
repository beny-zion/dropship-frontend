// lib/api/payments.js - Payment API functions

import client from './client.js';

/**
 * תפיסת מסגרת אשראי (Hold)
 * @param {string} orderId - Order ID
 * @param {Object} paymentDetails - Payment card details
 * @param {string} paymentDetails.cardNumber - Card number (without spaces)
 * @param {string} paymentDetails.expMonth - Expiry month (MM)
 * @param {string} paymentDetails.expYear - Expiry year (YY)
 * @param {string} paymentDetails.cvv - CVV code
 * @param {string} paymentDetails.userId - User ID (ת.ז.)
 * @returns {Promise} Hold result
 */
export const holdCreditCard = async (orderId, paymentDetails) => {
  const response = await client.post('/payments/hold', {
    orderId,
    paymentDetails
  });
  return response;
};

/**
 * בדיקת סטטוס תשלום
 * @param {string} orderId - Order ID
 * @returns {Promise} Payment status
 */
export const getPaymentStatus = async (orderId) => {
  const response = await client.get(`/payments/status/${orderId}`);
  return response;
};

/**
 * גביה ידנית (Admin only)
 * @param {string} orderId - Order ID
 * @returns {Promise} Capture result
 */
export const capturePayment = async (orderId) => {
  const response = await client.post(`/payments/capture/${orderId}`);
  return response;
};

/**
 * ביטול עסקה (Admin only)
 * @param {string} orderId - Order ID
 * @returns {Promise} Cancel result
 */
export const cancelPayment = async (orderId) => {
  const response = await client.post(`/payments/cancel/${orderId}`);
  return response;
};

/**
 * הרצת Job לגביה ידנית (Admin only)
 * @returns {Promise} Job execution result
 */
export const runChargeReadyJob = async () => {
  const response = await client.post('/payments/charge-ready');
  return response;
};

// ==================== TYPES (for documentation) ====================

/**
 * @typedef {Object} PaymentDetails
 * @property {string} cardNumber - Card number (13-19 digits)
 * @property {string} expMonth - Expiry month (01-12)
 * @property {string} expYear - Expiry year (YY)
 * @property {string} cvv - CVV code (3-4 digits)
 * @property {string} userId - User ID / ת.ז.
 */

/**
 * @typedef {Object} PaymentStatus
 * @property {string} status - 'pending' | 'hold' | 'ready_to_charge' | 'charged' | 'cancelled' | 'failed'
 * @property {number} holdAmount - Amount held
 * @property {number} chargedAmount - Amount charged
 * @property {string} hypTransactionId - Hyp Pay transaction ID
 * @property {Array} paymentHistory - Payment history events
 */
