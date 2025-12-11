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

// 🔒 Request interceptor - Add CSRF token to every request
apiClient.interceptors.request.use(
  (config) => {
    // Get CSRF token from axios defaults (set by CsrfProvider)
    const csrfToken = axios.defaults.headers.common['X-CSRF-Token'];

    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - טיפול בשגיאות
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // 🔒 Handle CSRF errors
    if (error.response?.data?.code === 'CSRF_ERROR') {
      console.error('🔒 CSRF token invalid - refreshing page...');

      // Refresh the page to get a new CSRF token
      if (typeof window !== 'undefined') {
        window.location.reload();
      }

      return Promise.reject({
        message: 'CSRF token expired. Page will reload...',
        isCsrfError: true
      });
    }

    // Create error object with better info for admin pages
    const errorObj = {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      isAuthError: error.response?.status === 401,
      isNetworkError: !error.response,
      isCsrfError: error.response?.data?.code === 'CSRF_ERROR',
    };

    if (error.response?.status === 401) {
      // Token פג תוקף או לא קיים
      // 🚫 Don't redirect if already on login/register pages to avoid infinite loop
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const isAuthPage = currentPath === '/login' || currentPath === '/register';
        const isAdminPage = currentPath.startsWith('/admin');

        // For admin pages - provide detailed error message
        if (isAdminPage) {
          errorObj.message = error.response?.data?.message || 'נא להתחבר מחדש כמנהל';

          // Redirect to login after delay to show error
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        } else if (!isAuthPage) {
          // For regular users - silent redirect
          window.location.href = '/login';
        }
      }
    }

    // Add Hebrew error messages for admin pages only
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
      if (!error.response) {
        errorObj.message = 'שגיאת רשת - השרת לא מגיב';
      } else if (error.response?.status === 403) {
        errorObj.message = 'אין לך הרשאות מנהל';
      } else if (error.response?.status === 404) {
        errorObj.message = 'הנתון המבוקש לא נמצא';
      } else if (error.response?.status >= 500) {
        errorObj.message = 'שגיאת שרת - אנא נסה שוב';
      }
    }

    return Promise.reject(errorObj);
  }
);

export default apiClient;