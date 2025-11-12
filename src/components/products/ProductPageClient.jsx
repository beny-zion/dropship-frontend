'use client';

import { useProduct } from '@/lib/hooks/useProducts';
import ProductDetails from '@/components/products/ProductDetails';
import Loading from '@/components/shared/Loading';
import ErrorMessage from '@/components/shared/ErrorMessage';
import Link from 'next/link';
import { ChevronLeft, Home } from 'lucide-react';

export default function ProductPageClient({ productId, initialData }) {
  // Pass initialData to React Query so it doesn't fetch unnecessarily
  const { data, isLoading, error, refetch } = useProduct(productId, {
    initialData: initialData,
    enabled: !!productId,
  });

  // Use the data (will be initialData on first render, then cached/refetched data)
  const currentData = data;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-20">
          <ErrorMessage message={error.message} onRetry={refetch} />
        </div>
      </div>
    );
  }

  if (!currentData || !currentData.data) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-20">
          <ErrorMessage message="מוצר לא נמצא" />
        </div>
      </div>
    );
  }

  const product = currentData.data;

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumbs - Minimal & Clean */}
      <div className="bg-white border-b border-neutral-200">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-xs tracking-wider overflow-x-auto" dir="rtl">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-neutral-500 hover:text-black transition-colors whitespace-nowrap font-light"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">דף הבית</span>
            </Link>
            <ChevronLeft className="h-4 w-4 text-neutral-300 rotate-180 flex-shrink-0" />
            <Link
              href="/products"
              className="text-neutral-500 hover:text-black transition-colors whitespace-nowrap font-light"
            >
              מוצרים
            </Link>
            <ChevronLeft className="h-4 w-4 text-neutral-300 rotate-180 flex-shrink-0" />
            <span className="text-black font-normal truncate">{product.name_he}</span>
          </nav>
        </div>
      </div>

      {/* Product Details */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <ProductDetails product={product} />
      </div>

      {/* Back button - Minimal */}
      <div className="container mx-auto px-4 pb-12">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-light tracking-wide text-neutral-600 hover:text-black transition-colors underline underline-offset-4"
        >
          ← חזרה לכל המוצרים
        </Link>
      </div>
    </div>
  );
}
