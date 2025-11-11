'use client';

import { useState, useEffect } from 'react';

export const useTags = (limit = 20) => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTags = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/tags?limit=${limit}`);
      const data = await response.json();

      if (data.success) {
        setTags(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch tags');
      }
    } catch (err) {
      console.error('Error fetching tags:', err);
      setError(err.message);
      setTags([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, [limit]);

  return { tags, loading, error, refetch: fetchTags };
};
