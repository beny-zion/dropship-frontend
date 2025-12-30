/**
 * Order Items API Client
 *
 * פונקציות לניהול פריטים בהזמנות
 */

import api from './client';

/**
 * עדכון סטטוס פריט
 */
export async function updateItemStatus(orderId, itemId, newStatus, notes = '') {
  const response = await api.put(`/orders/${orderId}/items/${itemId}/status`, {
    newStatus,
    notes
  });
  return response.data;
}

/**
 * הזמנה מספק
 */
export async function orderItemFromSupplier(orderId, itemId, data) {
  const response = await api.post(`/orders/${orderId}/items/${itemId}/order-from-supplier`, data);
  return response.data;
}

/**
 * ביטול פריט
 */
export async function cancelOrderItem(orderId, itemId, reason) {
  const response = await api.post(`/orders/${orderId}/items/${itemId}/cancel`, {
    reason
  });
  return response.data;
}

/**
 * קבלת היסטוריה של פריט
 */
export async function getItemHistory(orderId, itemId) {
  const response = await api.get(`/orders/${orderId}/items/${itemId}/history`);
  return response.data;
}

/**
 * עדכון קבוצתי של פריטים
 */
export async function bulkUpdateItems(orderId, itemIds, newStatus, notes = '') {
  const response = await api.put(`/orders/${orderId}/items/bulk-update`, {
    itemIds,
    newStatus,
    notes
  });
  return response.data;
}

/**
 * עדכון מספר מעקב בינלאומי
 */
export async function updateIsraelTracking(orderId, itemId, trackingData) {
  const response = await api.put(`/admin/orders/${orderId}/items/${itemId}/israel-tracking`, trackingData);
  return response.data;
}

/**
 * עדכון מספר מעקב ללקוח
 */
export async function updateCustomerTracking(orderId, itemId, trackingData) {
  const response = await api.put(`/admin/orders/${orderId}/items/${itemId}/customer-tracking`, trackingData);
  return response.data;
}

/**
 * Phase 9.3: נעילת/שחרור סטטוס ידני
 * מונע מהאוטומציה לשנות את הסטטוס
 */
export async function manualStatusOverride(orderId, itemId, data) {
  const response = await api.put(`/admin/orders/${orderId}/items/${itemId}/manual-status`, data);
  return response.data;
}

export default {
  updateItemStatus,
  orderItemFromSupplier,
  cancelOrderItem,
  getItemHistory,
  bulkUpdateItems,
  updateIsraelTracking,
  updateCustomerTracking,
  manualStatusOverride
};
