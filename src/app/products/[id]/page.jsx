'use client';

import { use } from 'react';
import { useProduct } from '@/lib/hooks/useProducts';
import ProductDetails from '@/components/products/ProductDetails';
import Loading from '@/components/shared/Loading';
import ErrorMessage from '@/components/shared/ErrorMessage';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ProductPage({ params }) {
  const { id } = use(params);
  const { data, isLoading, error, refetch } = useProduct(id);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage message={error.message} onRetry={refetch} />
      </div>
    );
  }

  if (!data || !data.data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage message="מוצר לא נמצא" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
        <Link href="/" className="hover:text-blue-600">
          בית
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-blue-600">
          מוצרים
        </Link>
        <span>/</span>
        <span className="text-gray-900">{data.data.name_he}</span>
      </div>

      {/* Product Details */}
      <ProductDetails product={data.data} />

      {/* Back button */}
      <div className="mt-8">
        <Link href="/products">
          <Button variant="outline">← חזרה לכל המוצרים</Button>
        </Link>
      </div>
    </div>
  );
}