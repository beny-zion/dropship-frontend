import ProductPageClient from '@/components/products/ProductPageClient';
import { notFound } from 'next/navigation';

// Server Component - fetches product data
export const dynamic = 'force-dynamic';
export const revalidate = 60; // Revalidate every 60 seconds

async function getProduct(id) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products/${id}`,
      {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        notFound();
      }
      throw new Error('Failed to fetch product');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { id } = await params;
  const productData = await getProduct(id);

  if (!productData || !productData.data) {
    return {
      title: 'מוצר לא נמצא',
    };
  }

  const product = productData.data;

  return {
    title: `${product.name_he} - TORINO`,
    description: product.description_he || product.name_he,
    openGraph: {
      title: product.name_he,
      description: product.description_he || product.name_he,
      images: product.images?.map(img => img.url) || [],
    },
  };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const initialData = await getProduct(id);

  return <ProductPageClient productId={id} initialData={initialData} />;
}