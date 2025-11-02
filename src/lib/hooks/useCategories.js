import { useState, useEffect } from 'react';
import { getCategories, getCategoryById, incrementCategoryClick } from '../api/categories';

/**
 * Hook to fetch all categories
 * @param {boolean} activeOnly - Fetch only active categories
 * @returns {Object} { categories, loading, error, refetch }
 */
export const useCategories = (activeOnly = true) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getCategories(activeOnly);

      // Response is { success, count, data }
      if (response && response.success && response.data) {
        setCategories(response.data);
      } else {
        setError(response?.message || 'שגיאה בטעינת הקטגוריות');
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err?.message || 'שגיאה בטעינת הקטגוריות');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [activeOnly]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
};

/**
 * Hook to fetch single category
 * @param {string} identifier - Category ID or slug
 * @param {boolean} incrementView - Whether to increment view count
 * @returns {Object} { category, loading, error, refetch }
 */
export const useCategory = (identifier, incrementView = false) => {
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategory = async () => {
    if (!identifier) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // The apiClient interceptor returns response.data
      const response = await getCategoryById(identifier, incrementView);

      if (response && response.success && response.data) {
        setCategory(response.data);
      } else {
        console.error('Invalid category response:', response);
        setError('שגיאה בטעינת הקטגוריה');
      }
    } catch (err) {
      console.error('Error fetching category:', err);
      setError(err?.message || 'שגיאה בטעינת הקטגוריה');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, [identifier]);

  return {
    category,
    loading,
    error,
    refetch: fetchCategory,
  };
};

/**
 * Hook to handle category click
 * @returns {Function} handleCategoryClick function
 */
export const useCategoryClick = () => {
  const handleCategoryClick = async (categoryId) => {
    try {
      await incrementCategoryClick(categoryId);
    } catch (err) {
      console.error('Error incrementing category click:', err);
      // Silently fail - this is analytics, not critical
    }
  };

  return handleCategoryClick;
};

export default useCategories;
