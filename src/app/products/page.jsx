'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useProducts } from '@/lib/hooks/useProducts';
import ProductList from '@/components/products/ProductList';
import ProductFilters from '@/components/products/ProductFilters';
import SearchBar from '@/components/products/SearchBar';
import Loading from '@/components/shared/Loading';
import ErrorMessage from '@/components/shared/ErrorMessage';
import { Button } from '@/components/ui/button';

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // קריאת הפרמטרים מה-URL בעת הטעינה הראשונית
  const [filters, setFilters] = useState({
    page: parseInt(searchParams.get('page')) || 1,
    limit: 12,
    category: searchParams.get('category') || 'all',
    sort: searchParams.get('sort') || '-createdAt',
    search: searchParams.get('search') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
  });

  const { data, isLoading, error, refetch } = useProducts(filters);

  const handleFilterChange = (key, value) => {
    const newFilters = {
      ...filters,
      [key]: value,
      page: 1 // Reset to first page
    };
    setFilters(newFilters);

    // עדכון ה-URL
    updateURL(newFilters);
  };

  const updateURL = (newFilters) => {
    const params = new URLSearchParams();

    // הוסף רק פרמטרים שאינם ברירת מחדל
    if (newFilters.category && newFilters.category !== 'all') {
      params.set('category', newFilters.category);
    }
    if (newFilters.search) {
      params.set('search', newFilters.search);
    }
    if (newFilters.sort && newFilters.sort !== '-createdAt') {
      params.set('sort', newFilters.sort);
    }
    if (newFilters.minPrice) {
      params.set('minPrice', newFilters.minPrice);
    }
    if (newFilters.maxPrice) {
      params.set('maxPrice', newFilters.maxPrice);
    }
    if (newFilters.page > 1) {
      params.set('page', newFilters.page.toString());
    }

    const queryString = params.toString();
    const newURL = queryString ? `/products?${queryString}` : '/products';
    router.push(newURL, { scroll: false });
  };

  const handleSearch = (query) => {
    const newFilters = {
      ...filters,
      search: query,
      page: 1
    };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      page: 1,
      limit: 12,
      category: 'all',
      sort: '-createdAt',
      search: '',
      minPrice: '',
      maxPrice: '',
    };
    setFilters(resetFilters);
    router.push('/products', { scroll: false });
  };

  const handlePageChange = (newPage) => {
    const newFilters = { ...filters, page: newPage };
    setFilters(newFilters);
    updateURL(newFilters);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage message={error.message} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">כל המוצרים</h1>
        <SearchBar onSearch={handleSearch} initialValue={filters.search} />
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar - Filters */}
        <aside className="lg:col-span-1">
          <ProductFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleReset}
          />
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Results count */}
          {data && (
            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                מציג {data.data.length} מתוך {data.pagination.total} מוצרים
              </p>
            </div>
          )}

          {/* Products */}
          {isLoading ? (
            <Loading />
          ) : (
            <ProductList products={data?.data || []} onReset={handleReset} />
          )}

          {/* Pagination */}
          {data && data.pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page === 1}
              >
                הקודם
              </Button>

              {[...Array(data.pagination.pages)].map((_, i) => (
                <Button
                  key={i + 1}
                  variant={filters.page === i + 1 ? 'default' : 'outline'}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}

              <Button
                variant="outline"
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page === data.pagination.pages}
              >
                הבא
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// קומפוננט Wrapper עם Suspense
export default function ProductsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ProductsPageContent />
    </Suspense>
  );
}