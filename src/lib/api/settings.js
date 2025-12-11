/**
 * Settings API Client
 *
 * Public endpoints for system settings (shipping rates, etc.)
 */

import apiClient from './client';

export const settingsApi = {
  /**
   * Get shipping settings (public endpoint)
   */
  getShippingSettings: async () => {
    return await apiClient.get('/settings/shipping');
  },

  /**
   * Get shipping rate (public endpoint)
   * @param {string} currency - USD or ILS
   */
  getShippingRate: async (currency = 'ILS') => {
    const response = await apiClient.get('/settings/shipping');
    const rate = currency === 'USD'
      ? response.data?.data?.shipping?.flatRate?.usd
      : response.data?.data?.shipping?.flatRate?.ils;
    return { data: { rate, currency } };
  },

  /**
   * Get minimum order requirements (public endpoint)
   */
  getMinimumOrderRequirements: async () => {
    const response = await apiClient.get('/settings/shipping');
    return {
      minimumAmount: response.data?.data?.order?.minimumAmount || { usd: 0, ils: 0 },
      minimumItemsCount: response.data?.data?.order?.minimumItemsCount || 0
    };
  }
};

export default settingsApi;
