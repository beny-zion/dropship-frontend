import CategoryCarouselClient from './CategoryCarouselClient';

// Server Component - fetches data
export default async function CategoryCarousel({ language = 'he', className = '' }) {
  let categories = [];

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories?active=true`, {
      cache: 'no-store', // Always fetch fresh data for SSR
      next: { revalidate: 60 } // But revalidate every 60 seconds
    });
    const data = await response.json();
    categories = data.data || [];
  } catch (error) {
    console.error('Failed to fetch categories:', error);
  }

  if (!categories.length) return null;

  // Add "All Categories" item at the beginning
  const allCategoriesItem = {
    _id: 'all',
    name: { he: 'כל הקטגוריות', en: 'All Categories' },
    slug: 'products',
    isAllCategories: true
  };

  const allItems = [allCategoriesItem, ...categories];

  // Return client component with server-fetched data
  return <CategoryCarouselClient categories={allItems} language={language} className={className} />;
}
