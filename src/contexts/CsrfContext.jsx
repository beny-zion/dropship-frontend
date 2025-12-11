/**
 * CSRF Protection Context
 *
 * 🔒 מספק CSRF token לכל האפליקציה
 * מונע התקפות Cross-Site Request Forgery
 */

'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CsrfContext = createContext(null);

export function CsrfProvider({ children }) {
  const [csrfToken, setCsrfToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCsrfToken();
  }, []);

  const fetchCsrfToken = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // ✅ Use same API_URL as apiClient to ensure consistency
      // Note: NEXT_PUBLIC_API_URL already includes /api
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

      const { data } = await axios.get(
        `${API_URL}/csrf-token`,
        {
          withCredentials: true,
          // Don't send CSRF token when fetching CSRF token!
          headers: {
            'X-CSRF-Token': undefined
          }
        }
      );

      setCsrfToken(data.csrfToken);

      // ✅ Set default CSRF header for all future axios requests
      axios.defaults.headers.common['X-CSRF-Token'] = data.csrfToken;

      console.log('🔒 CSRF token fetched successfully');
      setIsLoading(false);
    } catch (error) {
      console.error('❌ Failed to fetch CSRF token:', {
        message: error.message,
        status: error.response?.status,
        url: error.config?.url,
        apiUrl: process.env.NEXT_PUBLIC_API_URL
      });
      setError(error);
      setIsLoading(false);

      // Only retry if it's a network error or server error (not 404)
      if (!error.response || error.response.status >= 500) {
        console.log('🔄 Retrying in 5 seconds...');
        setTimeout(fetchCsrfToken, 5000);
      } else {
        console.warn('⚠️ CSRF endpoint not available. Operating without CSRF protection.');
        // Continue without CSRF token - app will still work
      }
    }
  };

  const refreshToken = () => {
    console.log('🔄 Refreshing CSRF token...');
    fetchCsrfToken();
  };

  const value = {
    csrfToken,
    isLoading,
    error,
    refreshToken
  };

  return (
    <CsrfContext.Provider value={value}>
      {children}
    </CsrfContext.Provider>
  );
}

/**
 * Hook לשימוש ב-CSRF token
 */
export const useCsrf = () => {
  const context = useContext(CsrfContext);

  if (!context) {
    throw new Error('useCsrf must be used within CsrfProvider');
  }

  return context;
};

export default CsrfContext;
