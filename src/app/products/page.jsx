'use client';

import { useState } from 'react';
import { useProducts } from '@/lib/hooks/useProducts';
import ProductList from '@/components/products/ProductList';
import ProductFilters from '@/components/products/ProductFilters';
import SearchBar from '@/components/products/SearchBar';
import Loading from '@/components/shared/Loading';
import ErrorMessage from '@/components/shared/ErrorMessage';
import { Button } from '@/components/ui/button';

export default function ProductsPage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    category: 'all',
    sort: '-createdAt',
    search: '',
    minPrice: '',
    maxPrice: '',
  });

  const { data, isLoading, error, refetch } = useProducts(filters);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page
    }));
  };

  const handleSearch = (query) => {
    setFilters(prev => ({
      ...prev,
      search: query,
      page: 1
    }));
  };

  const handleReset = () => {
    setFilters({
      page: 1,
      limit: 12,
      category: 'all',
      sort: '-createdAt',
      search: '',
      minPrice: '',
      maxPrice: '',
    });
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
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
            <ProductList products={data?.data || []} />
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