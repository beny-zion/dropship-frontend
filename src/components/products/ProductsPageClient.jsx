'use client';

import { useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useProducts } from '@/lib/hooks/useProducts';
import ProductList from '@/components/products/ProductList';
import ProductFilters from '@/components/products/ProductFilters';
import SearchBar from '@/components/products/SearchBar';
import Loading from '@/components/shared/Loading';
import ErrorMessage from '@/components/shared/ErrorMessage';
import GlobalCategoryNav from '@/components/sections/GlobalCategoryNav';

export default function ProductsPageClient({ initialData }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Always sync filters with URL - no state needed
  const filters = useMemo(() => ({
    page: parseInt(searchParams.get('page')) || 1,
    limit: 12,
    category: searchParams.get('category') || 'all',
    sort: searchParams.get('sort') || '-createdAt',
    search: searchParams.get('search') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    tags: searchParams.get('tags') || '',
  }), [searchParams]);

  // Pass initialData to React Query
  const { data, isLoading, error, refetch } = useProducts(filters, {
    initialData: initialData,
  });

  // Use the data (will be initialData on first render)
  const currentData = data;

  const handleFilterChange = (key, value) => {
    const newFilters = {
      ...filters,
      [key]: value,
      page: 1 // Reset to first page
    };

    // עדכון ה-URL (filters will update automatically via useMemo)
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
    if (newFilters.tags) {
      params.set('tags', newFilters.tags);
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
    updateURL(newFilters);
  };

  const handleReset = () => {
    router.push('/products', { scroll: false });
  };

  const handlePageChange = (newPage) => {
    const newFilters = { ...filters, page: newPage };
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
    <div className="min-h-screen bg-white">
      {/* Header Section - Elegant & Minimal */}
      <div className="border-b border-neutral-200 bg-gradient-to-b from-neutral-50 to-white">
        <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-widest text-center mb-6 md:mb-8 uppercase">
            כל המוצרים
          </h1>
          <SearchBar onSearch={handleSearch} initialValue={filters.search} />
        </div>
      </div>

      {/* Category Navigation */}
      <GlobalCategoryNav language="he" className="border-b border-neutral-100" />

      <div className="container mx-auto px-4 py-6 lg:py-8">
        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Sidebar - Minimal Filters */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-4">
              <ProductFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleReset}
              />
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-4 space-y-6 lg:space-y-8">
            {/* Results Count - Subtle */}
            {currentData && (
              <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                <p className="text-sm font-light tracking-wide text-neutral-600">
                  {currentData.pagination.total} מוצרים
                </p>
              </div>
            )}

            {/* Products Grid */}
            {isLoading && !initialData ? (
              <Loading />
            ) : (
              <ProductList products={currentData?.data || []} onReset={handleReset} />
            )}

            {/* Pagination - Clean Design */}
            {currentData && currentData.pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-12 pt-8 border-t border-neutral-200">
                <button
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page === 1}
                  className="px-4 py-2 text-sm font-light tracking-wider border border-black hover:bg-black hover:text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-black"
                >
                  הקודם
                </button>

                <div className="flex gap-2">
                  {[...Array(currentData.pagination.pages)].map((_, i) => {
                    const pageNum = i + 1;
                    // Show smart pagination
                    if (
                      pageNum === 1 ||
                      pageNum === currentData.pagination.pages ||
                      Math.abs(pageNum - filters.page) <= 1
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`min-w-[40px] px-3 py-2 text-sm font-light tracking-wider transition-all duration-300 ${
                            filters.page === pageNum
                              ? 'bg-black text-white'
                              : 'border border-neutral-300 hover:border-black'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (pageNum === filters.page - 2 || pageNum === filters.page + 2) {
                      return (
                        <span key={pageNum} className="px-2 flex items-center text-neutral-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page === currentData.pagination.pages}
                  className="px-4 py-2 text-sm font-light tracking-wider border border-black hover:bg-black hover:text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-black"
                >
                  הבא
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
