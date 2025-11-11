import apiClient from './client';

export const authApi = {
  // Register
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    // 🍪 No need to save token - it's in HttpOnly cookie now!
    return response;
  },

  // Login
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    // 🍪 No need to save token - it's in HttpOnly cookie now!
    return response;
  },

  // Logout
  logout: async () => {
    await apiClient.post('/auth/logout');
    // 🍪 Cookie is cleared by backend automatically
  },

  // Get current user
  getMe: async () => {
    return await apiClient.get('/auth/me');
  },
};