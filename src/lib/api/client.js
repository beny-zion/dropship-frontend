import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// יצירת Axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // 🍪 CRITICAL: Send cookies with every request
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor - טיפול בשגיאות
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token פג תוקף או לא קיים
      // 🚫 Don't redirect if already on login/register pages to avoid infinite loop
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const isAuthPage = currentPath === '/login' || currentPath === '/register';

        if (!isAuthPage) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export default apiClient;