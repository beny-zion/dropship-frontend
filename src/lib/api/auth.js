import apiClient from './client';

export const authApi = {
  // Register
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    if (response.success && response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  },

  // Login
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    if (response.success && response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  },

  // Logout
  logout: async () => {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user
  getMe: async () => {
    return await apiClient.get('/auth/me');
  },
};