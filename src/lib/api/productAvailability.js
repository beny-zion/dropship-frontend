/**
 * Product Availability API Client
 * ================================
 * Client מרכזי לכל פעולות זמינות מוצרים.
 * משתמש ב-API המרכזי החדש בצד השרת.
 */

import apiClient from './client';

export const productAvailabilityApi = {
  /**
   * עדכון זמינות (לשימוש כללי)
   *
   * @param {string} productId - מזהה המוצר
   * @param {Object} data - נתונים
   * @param {string|null} data.variantSku - SKU ווריאנט (אופציונלי)
   * @param {boolean} data.available - זמינות חדשה
   * @param {string} data.reason - סיבת העדכון
   * @param {string} data.source - מקור העדכון
   * @param {Object} data.metadata - מידע נוסף
   */
  updateAvailability: async (productId, data) => {
    console.log('🟡 [productAvailabilityApi] updateAvailability called');
    console.log('🟡 [productAvailabilityApi] Product ID:', productId);
    console.log('🟡 [productAvailabilityApi] Data:', JSON.stringify(data, null, 2));
    const url = `/admin/products/${productId}/availability-v2`;
    console.log('🟡 [productAvailabilityApi] URL:', url);

    try {
      const response = await apiClient.patch(url, data);
      console.log('🟡 [productAvailabilityApi] Response:', response);
      return response;
    } catch (error) {
      console.error('🔴 [productAvailabilityApi] Error:', error);
      console.error('🔴 [productAvailabilityApi] Error response:', error.response);
      throw error;
    }
  },

  /**
   * בדיקת זמינות + מחיר (לשימוש ב-Inventory Check)
   *
   * @param {string} productId - מזהה המוצר
   * @param {Object} data - נתונים
   * @param {string|null} data.variantSku - SKU ווריאנט (אופציונלי)
   * @param {boolean} data.available - זמינות
   * @param {number} data.currentPrice - מחיר נוכחי שנראה אצל הספק
   * @param {string} data.notes - הערות
   */
  checkAndUpdate: async (productId, data) => {
    return apiClient.post(`/admin/products/${productId}/check-availability`, data);
  },

  /**
   * שליפת היסטוריית זמינות
   *
   * @param {string} productId - מזהה המוצר
   * @param {string|null} variantSku - SKU ווריאנט (אופציונלי)
   * @param {number} limit - מקסימום רשומות
   */
  getHistory: async (productId, variantSku = null, limit = 50) => {
    const params = { limit };
    if (variantSku) {
      params.variantSku = variantSku;
    }
    return apiClient.get(`/admin/products/${productId}/availability-history`, { params });
  },

  /**
   * שליפת היסטוריית מחירים
   *
   * @param {string} productId - מזהה המוצר
   * @param {number} limit - מקסימום רשומות
   */
  getPriceHistory: async (productId, limit = 50) => {
    return apiClient.get(`/admin/products/${productId}/price-history`, { params: { limit } });
  },

  /**
   * שמירת בדיקת זמינות (עדכון "נבדק ב")
   *
   * @param {string} productId - מזהה המוצר
   * @param {Object} data - נתונים
   * @param {string} data.result - תוצאת הבדיקה (available/unavailable/partial)
   * @param {string} data.notes - הערות
   * @param {Array} data.variantsSnapshot - snapshot של סטטוס הווריאנטים
   */
  recordInventoryCheck: async (productId, data) => {
    console.log('🟡 [productAvailabilityApi] recordInventoryCheck called');
    console.log('🟡 [productAvailabilityApi] Product ID:', productId);
    console.log('🟡 [productAvailabilityApi] Data:', JSON.stringify(data, null, 2));

    const url = `/admin/products/${productId}/inventory-check`;
    console.log('🟡 [productAvailabilityApi] URL:', url);

    try {
      const response = await apiClient.post(url, data);
      console.log('🟡 [productAvailabilityApi] recordInventoryCheck Response:', response);
      return response;
    } catch (error) {
      console.error('🔴 [productAvailabilityApi] recordInventoryCheck Error:', error);
      console.error('🔴 [productAvailabilityApi] Error response:', error.response);
      throw error;
    }
  },

  /**
   * שליפת מידע על בדיקת זמינות אחרונה
   *
   * @param {string} productId - מזהה המוצר
   * @param {number} limit - מקסימום רשומות
   */
  getInventoryCheck: async (productId, limit = 20) => {
    return apiClient.get(`/admin/products/${productId}/inventory-check`, { params: { limit } });
  },

  /**
   * עדכון Batch (מוצר + ווריאנטים ביחד) - ביצועים משופרים!
   *
   * @param {string} productId - מזהה המוצר
   * @param {Object} data - נתונים
   * @param {Object} data.product - עדכון מוצר ראשי (אופציונלי)
   * @param {boolean} data.product.available - זמינות
   * @param {Array} data.variants - רשימת ווריאנטים לעדכן
   * @param {string} data.variants[].sku - SKU של הווריאנט
   * @param {boolean} data.variants[].available - זמינות
   * @param {string} data.reason - סיבת העדכון
   * @param {string} data.source - מקור העדכון
   */
  batchUpdate: async (productId, data) => {
    console.log('🟡 [productAvailabilityApi] batchUpdate called');
    console.log('🟡 [productAvailabilityApi] Product ID:', productId);
    console.log('🟡 [productAvailabilityApi] Data:', JSON.stringify(data, null, 2));

    const url = `/admin/products/${productId}/availability/batch`;
    console.log('🟡 [productAvailabilityApi] URL:', url);

    try {
      const response = await apiClient.post(url, data);
      console.log('🟡 [productAvailabilityApi] batchUpdate Response:', response);
      return response;
    } catch (error) {
      console.error('🔴 [productAvailabilityApi] batchUpdate Error:', error);
      console.error('🔴 [productAvailabilityApi] Error response:', error.response);
      throw error;
    }
  },

  /**
   * עדכון מחיר מוצר (עם חישוב מחיר מכירה)
   *
   * @param {string} productId - מזהה המוצר
   * @param {Object} data - נתונים
   * @param {number} data.newUsdCost - עלות דולרית חדשה
   * @param {boolean} data.confirmOnly - אישור מחיר ללא שינוי (עדכון timestamp בלבד)
   * @param {string} data.notes - הערות
   */
  updatePrice: async (productId, data) => {
    console.log('🟡 [productAvailabilityApi] updatePrice called');
    console.log('🟡 [productAvailabilityApi] Product ID:', productId);
    console.log('🟡 [productAvailabilityApi] Data:', JSON.stringify(data, null, 2));

    const url = `/admin/products/${productId}/update-price`;

    try {
      const response = await apiClient.post(url, data);
      console.log('🟡 [productAvailabilityApi] updatePrice Response:', response);
      return response;
    } catch (error) {
      console.error('🔴 [productAvailabilityApi] updatePrice Error:', error);
      console.error('🔴 [productAvailabilityApi] Error response:', error.response);
      throw error;
    }
  }
};

export default productAvailabilityApi;
