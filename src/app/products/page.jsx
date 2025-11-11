import { Suspense } from 'react';
import ProductsPageClient from '@/components/products/ProductsPageClient';
import Loading from '@/components/shared/Loading';

// Server Component - fetches initial data
export const dynamic = 'force-dynamic';
export const revalidate = 30; // Revalidate every 30 seconds

async function getInitialProducts(searchParams) {
  try {
    const params = new URLSearchParams();
    params.set('page', searchParams.page || '1');
    params.set('limit', '12');

    if (searchParams.category && searchParams.category !== 'all') {
      params.set('category', searchParams.category);
    }
    if (searchParams.search) {
      params.set('search', searchParams.search);
    }
    if (searchParams.sort && searchParams.sort !== '-createdAt') {
      params.set('sort', searchParams.sort);
    }
    if (searchParams.minPrice) {
      params.set('minPrice', searchParams.minPrice);
    }
    if (searchParams.maxPrice) {
      params.set('maxPrice', searchParams.maxPrice);
    }
    if (searchParams.tags) {
      params.set('tags', searchParams.tags);
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products?${params.toString()}`,
      {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    return null;
  }
}

export default async function ProductsPage({ searchParams }) {
  // Await searchParams in Next.js 15
  const params = await searchParams;
  const initialData = await getInitialProducts(params);

  return (
    <Suspense fallback={<Loading />}>
      <ProductsPageClient initialData={initialData} />
    </Suspense>
  );
}