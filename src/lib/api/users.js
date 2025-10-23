// lib/api/users.js - Week 4

import client from './client.js';

// ==================== USER PROFILE ====================

/**
 * Get user profile with stats
 * @returns {Promise} User profile data with order statistics
 */
export const getProfile = async () => {
  const response = await client.get('/users/profile');

  // Handle both response formats
  if (response.data?.data) {
    return response.data.data; // {success: true, data: {...}}
  }

  return response.data; // Already extracted by axios
};

/**
 * Update user profile
 * @param {Object} profileData - Profile fields to update
 * @returns {Promise} Updated user data
 */
export const updateProfile = async (profileData) => {
  const { data } = await client.put('/users/profile', profileData);
  return data;
};

/**
 * Change user password
 * @param {Object} passwords - { currentPassword, newPassword }
 * @returns {Promise} Success response
 */
export const changePassword = async (passwords) => {
  const { data } = await client.put('/users/change-password', passwords);
  return data;
};

/**
 * Update user preferences
 * @param {Object} preferences - User preferences
 * @returns {Promise} Updated preferences
 */
export const updatePreferences = async (preferences) => {
  const { data } = await client.put('/users/preferences', preferences);
  return data;
};

/**
 * Delete user account (soft delete)
 * @param {string} password - User password for confirmation
 * @returns {Promise} Success response
 */
export const deleteAccount = async (password) => {
  const { data } = await client.delete('/users/account', {
    data: { password }
  });
  return data;
};

// ==================== ADDRESSES ====================

/**
 * Get all user addresses
 * @returns {Promise} Array of addresses
 */
export const getAddresses = async () => {
  const response = await client.get('/users/addresses');
  return response.data || [];
};

/**
 * Get single address by ID
 * @param {string} id - Address ID
 * @returns {Promise} Address data
 */
export const getAddress = async (id) => {
  const { data } = await client.get(`/users/addresses/${id}`);
  return data;
};

/**
 * Get default address
 * @returns {Promise} Default address data
 */
export const getDefaultAddress = async () => {
  const { data} = await client.get('/users/addresses/default');
  return data;
};

/**
 * Create new address
 * @param {Object} address - Address data
 * @returns {Promise} Created address
 */
export const createAddress = async (address) => {
  const { data } = await client.post('/users/addresses', address);
  return data;
};

/**
 * Update address
 * @param {string} id - Address ID
 * @param {Object} address - Address data to update
 * @returns {Promise} Updated address
 */
export const updateAddress = async (id, address) => {
  const { data } = await client.put(`/users/addresses/${id}`, address);
  return data;
};

/**
 * Delete address
 * @param {string} id - Address ID
 * @returns {Promise} Success response
 */
export const deleteAddress = async (id) => {
  const { data } = await client.delete(`/users/addresses/${id}`);
  return data;
};

/**
 * Set address as default
 * @param {string} id - Address ID
 * @returns {Promise} Updated address
 */
export const setDefaultAddress = async (id) => {
  const { data } = await client.put(`/users/addresses/${id}/default`);
  return data;
};

// ==================== TYPES (for documentation) ====================

/**
 * @typedef {Object} UserProfile
 * @property {string} _id
 * @property {string} email
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} phone
 * @property {string} [profileImage]
 * @property {string} [bio]
 * @property {Object} preferences
 * @property {string} preferences.language - 'he' | 'en'
 * @property {string} preferences.currency - 'ILS' | 'USD'
 * @property {Object} preferences.notifications
 * @property {boolean} preferences.notifications.email
 * @property {boolean} preferences.notifications.sms
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} Address
 * @property {string} _id
 * @property {string} fullName
 * @property {string} phone
 * @property {string} street
 * @property {string} city
 * @property {string} zipCode
 * @property {string} country
 * @property {boolean} isDefault
 * @property {string} label - 'home' | 'work' | 'other'
 * @property {string} createdAt
 * @property {string} updatedAt
 */