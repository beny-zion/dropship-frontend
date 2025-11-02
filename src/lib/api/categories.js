import apiClient from './client';

/**
 * Get all categories
 * @param {boolean} activeOnly - Get only active categories
 * @returns {Promise} Categories response object
 */
export const getCategories = async (activeOnly = false) => {
  // apiClient interceptor already returns response.data
  // So response is { success, count, data }
  const response = await apiClient.get('/categories', {
    params: { active: activeOnly }
  });
  return response; // Don't return response.data again!
};

/**
 * Get single category by ID or slug
 * @param {string} identifier - Category ID or slug
 * @param {boolean} incrementView - Whether to increment view count
 * @returns {Promise} Category response object
 */
export const getCategoryById = async (identifier, incrementView = false) => {
  // apiClient interceptor already returns response.data
  const response = await apiClient.get(`/categories/${identifier}`, {
    params: { incrementView }
  });
  return response; // Don't return response.data again!
};

/**
 * Create new category (Admin only)
 * @param {Object} categoryData - Category data
 * @returns {Promise} Created category
 */
export const createCategory = async (categoryData) => {
  const response = await apiClient.post('/categories', categoryData);
  return response; // apiClient interceptor already returns response.data
};

/**
 * Update category (Admin only)
 * @param {string} id - Category ID
 * @param {Object} updates - Category updates
 * @returns {Promise} Updated category
 */
export const updateCategory = async (id, updates) => {
  const response = await apiClient.put(`/categories/${id}`, updates);
  return response; // apiClient interceptor already returns response.data
};

/**
 * Delete category (Admin only)
 * @param {string} id - Category ID
 * @returns {Promise} Success message
 */
export const deleteCategory = async (id) => {
  const response = await apiClient.delete(`/categories/${id}`);
  return response; // apiClient interceptor already returns response.data
};

/**
 * Reorder categories (Admin only)
 * @param {Array} categories - Array of {id, displayOrder}
 * @returns {Promise} Success message
 */
export const reorderCategories = async (categories) => {
  const response = await apiClient.put('/categories/reorder/batch', { categories });
  return response; // apiClient interceptor already returns response.data
};

/**
 * Increment category click count
 * @param {string} id - Category ID
 * @returns {Promise} Success message
 */
export const incrementCategoryClick = async (id) => {
  const response = await apiClient.post(`/categories/${id}/click`);
  return response; // apiClient interceptor already returns response.data
};

/**
 * Upload category image (Admin only)
 * @param {string} id - Category ID
 * @param {File} file - Image file
 * @param {string} imageType - 'main' or 'promotional'
 * @param {string} mediaType - 'image', 'gif', or 'video'
 * @param {string} alt - Alt text
 * @returns {Promise} Updated category
 */
export const uploadCategoryImage = async (id, file, imageType = 'main', mediaType = 'image', alt = '') => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('imageType', imageType);
  formData.append('mediaType', mediaType);
  formData.append('alt', alt);

  const response = await apiClient.post(`/categories/${id}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response; // apiClient interceptor already returns response.data
};

/**
 * Get category statistics (Admin only)
 * @returns {Promise} Statistics object
 */
export const getCategoryStats = async () => {
  const response = await apiClient.get('/categories/stats');
  return response; // apiClient interceptor already returns response.data
};

export default {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  incrementCategoryClick,
  uploadCategoryImage,
  getCategoryStats,
};
