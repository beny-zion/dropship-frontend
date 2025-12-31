/**
 * Refunds API Client
 *
 * Phase 10: פונקציות לניהול החזרים
 */

import api from './client';

/**
 * ביצוע החזר כספי
 * @param {string} orderId - מזהה ההזמנה
 * @param {string[]} itemIds - מזהי הפריטים להחזר
 * @param {string} reason - סיבת ההחזר
 * @param {number} customAmount - סכום מותאם (אופציונלי)
 * @param {object} cardDetails - פרטי כרטיס אשראי (חובה)
 */
export async function createRefund(orderId, itemIds, reason, customAmount = null, cardDetails = null) {
  const response = await api.post('/admin/refunds', {
    orderId,
    itemIds,
    reason,
    customAmount,
    cardDetails
  });
  return response.data;
}

/**
 * קבלת כל ההחזרים
 */
export async function getRefunds(params = {}) {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.status) queryParams.append('status', params.status);
  if (params.fromDate) queryParams.append('fromDate', params.fromDate);
  if (params.toDate) queryParams.append('toDate', params.toDate);

  const response = await api.get(`/admin/refunds?${queryParams.toString()}`);
  return response.data;
}

/**
 * קבלת סטטיסטיקות החזרים
 */
export async function getRefundStats() {
  const response = await api.get('/admin/refunds/stats');
  return response.data;
}

/**
 * קבלת החזרים של הזמנה ספציפית
 */
export async function getOrderRefunds(orderId) {
  const response = await api.get(`/admin/orders/${orderId}/refunds`);
  return response.data;
}

/**
 * בדיקת יכולת החזר להזמנה
 */
export async function canRefund(orderId) {
  const response = await api.get(`/admin/orders/${orderId}/can-refund`);
  return response.data;
}

/**
 * חישוב סכום החזר (preview)
 */
export async function calculateRefund(orderId, itemIds = []) {
  const response = await api.post(`/admin/orders/${orderId}/calculate-refund`, {
    itemIds
  });
  return response.data;
}

/**
 * בדיקת יכולת גביה להזמנה
 */
export async function canCharge(orderId) {
  const response = await api.get(`/admin/orders/${orderId}/can-charge`);
  return response.data;
}

/**
 * גביה ידנית מיידית
 * @param {string} orderId - מזהה ההזמנה
 * @param {number} amount - סכום לגביה
 * @param {string} reason - סיבה לגביה
 * @param {object} cardDetails - פרטי כרטיס אשראי (אופציונלי - עבור גביה מכרטיס חדש)
 */
export async function manualCharge(orderId, amount, reason, cardDetails = null) {
  const response = await api.post(`/admin/orders/${orderId}/manual-charge`, {
    amount,
    reason,
    cardDetails
  });
  return response.data;
}

export default {
  createRefund,
  getRefunds,
  getRefundStats,
  getOrderRefunds,
  canRefund,
  calculateRefund,
  canCharge,
  manualCharge
};
