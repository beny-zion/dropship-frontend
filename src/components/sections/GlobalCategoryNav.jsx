'use client';

import { useEffect, useState } from 'react';
import CategoryCarouselClient from './CategoryCarouselClient';

// Global client component - fetches once and caches
export default function GlobalCategoryNav({ language = 'he', className = '' }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch once when component mounts
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories?active=true`, {
          next: { revalidate: 300 } // Cache for 5 minutes
        });
        const data = await response.json();
        const cats = data.data || [];

        if (cats.length > 0) {
          // Add "All Categories" item at the beginning
          const allCategoriesItem = {
            _id: 'all',
            name: { he: 'כל הקטגוריות', en: 'All Categories' },
            slug: 'products',
            isAllCategories: true
          };
          setCategories([allCategoriesItem, ...cats]);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []); // Empty dependency array - fetch only once

  if (loading || !categories.length) return null;

  return <CategoryCarouselClient categories={categories} language={language} className={className} />;
}
