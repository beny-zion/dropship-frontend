// lib/api/users.js - Week 4

import client from './client.js';

// ==================== USER PROFILE ====================

/**
 * Get user profile with stats
 * @returns {Promise} User profile data with order statistics
 */
export const getProfile = async () => {
  return await client.get('/users/profile');
};

/**
 * Update user profile
 * @param {Object} profileData - Profile fields to update
 * @returns {Promise} Updated user data
 */
export const updateProfile = async (profileData) => {
  return await client.put('/users/profile', profileData);
};

/**
 * Change user password
 * @param {Object} passwords - { currentPassword, newPassword }
 * @returns {Promise} Success response
 */
export const changePassword = async (passwords) => {
  return await client.put('/users/change-password', passwords);
};

/**
 * Update user preferences
 * @param {Object} preferences - User preferences
 * @returns {Promise} Updated preferences
 */
export const updatePreferences = async (preferences) => {
  return await client.put('/users/preferences', preferences);
};

/**
 * Delete user account (soft delete)
 * @param {string} password - User password for confirmation
 * @returns {Promise} Success response
 */
export const deleteAccount = async (password) => {
  return await client.delete('/users/account', {
    data: { password }
  });
};

// ==================== ADDRESSES ====================

/**
 * Get all user addresses
 * @returns {Promise} Array of addresses
 */
export const getAddresses = async () => {
  return await client.get('/users/addresses');
};

/**
 * Get single address by ID
 * @param {string} id - Address ID
 * @returns {Promise} Address data
 */
export const getAddress = async (id) => {
  return await client.get(`/users/addresses/${id}`);
};

/**
 * Get default address
 * @returns {Promise} Default address data
 */
export const getDefaultAddress = async () => {
  return await client.get('/users/addresses/default');
};

/**
 * Create new address
 * @param {Object} address - Address data
 * @returns {Promise} Created address
 */
export const createAddress = async (address) => {
  return await client.post('/users/addresses', address);
};

/**
 * Update address
 * @param {string} id - Address ID
 * @param {Object} address - Address data to update
 * @returns {Promise} Updated address
 */
export const updateAddress = async (id, address) => {
  return await client.put(`/users/addresses/${id}`, address);
};

/**
 * Delete address
 * @param {string} id - Address ID
 * @returns {Promise} Success response
 */
export const deleteAddress = async (id) => {
  return await client.delete(`/users/addresses/${id}`);
};

/**
 * Set address as default
 * @param {string} id - Address ID
 * @returns {Promise} Updated address
 */
export const setDefaultAddress = async (id) => {
  return await client.put(`/users/addresses/${id}/default`);
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