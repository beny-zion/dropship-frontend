import api from './client';

/**
 * Get media statistics
 */
export async function getMediaStats() {
  const response = await api.get('/admin/media/stats');
  return response; // interceptor already returns response.data
}

/**
 * Get images with pagination and filters
 */
export async function getImages(params = {}) {
  const response = await api.get('/admin/media/images', { params });
  return response; // interceptor already returns response.data
}

/**
 * Run sync between Cloudinary and database
 */
export async function syncImages() {
  const response = await api.post('/admin/media/sync');
  return response; // interceptor already returns response.data
}

/**
 * Cleanup unused images
 */
export async function cleanupImages(dryRun = true, publicIds = null) {
  const response = await api.delete('/admin/media/cleanup', {
    data: { dryRun, publicIds }
  });
  return response; // interceptor already returns response.data
}

/**
 * Initial sync - add all existing Cloudinary images to tracking
 */
export async function initialSyncImages() {
  const response = await api.post('/admin/media/initial-sync');
  return response; // interceptor already returns response.data
}
