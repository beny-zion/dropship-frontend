'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import ProductInventoryCard from '@/components/admin/inventory/ProductInventoryCard';
import { Package, ChevronLeft, ChevronRight, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function InventoryCheckPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  // Fetch checked count from server (per page)
  // Count how many products in current page have been checked
  const getCheckedCountFromProducts = (products) => {
    if (!products || products.length === 0) return 0;
    return products.filter(p => p.inventoryChecks?.lastChecked).length;
  };

  // שליפת מוצרים עם pagination
  const { data: apiResponse, isLoading, error } = useQuery({
    queryKey: ['admin', 'products', 'inventory', page, searchTerm],
    queryFn: async () => {
      const response = await adminApi.getAllProducts({
        page,
        limit,
        search: searchTerm || undefined
      });
      // apiClient already returns response.data via interceptor
      // so response is already the API response object
      return response;
    }
  });

  // Debug logs
  console.log('🔍 Inventory Page:', {
    apiResponse,
    isLoading,
    error
  });

  // Parse response data
  const products = apiResponse?.data || [];
  const pagination = apiResponse?.pagination || {};
  const totalProducts = pagination.totalProducts || 0;
  const totalPages = pagination.totalPages || 1;
  const currentPage = pagination.currentPage || 1;

  console.log('📦 Parsed Data:', {
    products,
    productsLength: products?.length,
    pagination,
    totalProducts,
    totalPages,
    currentPage
  });

  // סטטיסטיקות זמינות
  const availableCount = products.filter(p => p.stock?.available).length;
  const unavailableCount = products.filter(p => !p.stock?.available).length;
  const checkedCount = getCheckedCountFromProducts(products);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">בדיקת זמינות מוצרים</h1>
            <p className="text-sm text-neutral-600">
              בדוק ועדכן זמינות של מוצרים, צבעים ומידות
            </p>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-700 font-medium mb-1">סה"כ מוצרים</p>
          <p className="text-3xl font-bold text-blue-900">{totalProducts}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
          <p className="text-sm text-purple-700 font-medium mb-1">עמוד נוכחי</p>
          <p className="text-3xl font-bold text-purple-900">{currentPage} / {totalPages}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-700 font-medium mb-1">✓ נבדקו בעמוד</p>
          <p className="text-3xl font-bold text-amber-900">{checkedCount}</p>
          <p className="text-xs text-amber-600 mt-1">
            {products.length > 0 ? `${Math.round((checkedCount / products.length) * 100)}% מהעמוד` : '0%'}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
          <p className="text-sm text-green-700 font-medium mb-1">זמינים בעמוד</p>
          <p className="text-3xl font-bold text-green-900">{availableCount}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-700 font-medium mb-1">לא זמינים בעמוד</p>
          <p className="text-3xl font-bold text-red-900">{unavailableCount}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="חפש מוצר לפי שם או SKU..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1); // Reset to first page on search
            }}
            className="w-full pr-10 pl-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mb-4" />
          <p className="text-neutral-600 font-medium">טוען מוצרים...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600 font-medium mb-2">שגיאה בטעינת מוצרים</p>
          <p className="text-sm text-neutral-600">{error.message}</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && products.length === 0 && (
        <div className="bg-neutral-50 border-2 border-dashed border-neutral-300 rounded-xl p-12 text-center">
          <Package className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
          <p className="text-neutral-600 font-medium mb-2">
            {searchTerm ? 'לא נמצאו מוצרים התואמים לחיפוש' : 'אין מוצרים במערכת'}
          </p>
          {searchTerm && (
            <Button
              onClick={() => setSearchTerm('')}
              variant="outline"
              className="mt-4"
            >
              נקה חיפוש
            </Button>
          )}
        </div>
      )}

      {/* Products List */}
      {!isLoading && !error && products.length > 0 && (
        <>
          <div className="space-y-4 mb-6">
            {products.map((product) => (
              <ProductInventoryCard key={product._id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <Button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ChevronRight className="w-4 h-4" />
                  הקודם
                </Button>

                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm font-medium text-neutral-900">
                    עמוד {currentPage} מתוך {totalPages}
                  </span>
                  <span className="text-xs text-neutral-500">
                    מציג {products.length} מתוך {totalProducts} מוצרים
                  </span>
                </div>

                <Button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  הבא
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
