'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import ProductInventoryCard from '@/components/admin/inventory/ProductInventoryCard';
import { Package, ChevronLeft, ChevronRight, Search, Loader2, Clock, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function InventoryCheckPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [checkedToday, setCheckedToday] = useState(0);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const limit = 20;

  // Load checked today count from localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    const storedData = localStorage.getItem('inventoryCheckToday');
    if (storedData) {
      const { date, count } = JSON.parse(storedData);
      if (date === today) {
        setCheckedToday(count);
      } else {
        // Reset for new day
        localStorage.setItem('inventoryCheckToday', JSON.stringify({ date: today, count: 0 }));
        setCheckedToday(0);
      }
    }
  }, []);

  // Update checked today count
  const incrementCheckedToday = () => {
    const today = new Date().toDateString();
    const newCount = checkedToday + 1;
    setCheckedToday(newCount);
    localStorage.setItem('inventoryCheckToday', JSON.stringify({ date: today, count: newCount }));
  };

  // Fetch checked count from server (per page)
  const getCheckedCountFromProducts = (products) => {
    if (!products || products.length === 0) return 0;
    return products.filter(p => p.inventoryChecks?.lastChecked).length;
  };

  // Fetch pricing config
  const { data: pricingConfig } = useQuery({
    queryKey: ['admin', 'pricingConfig'],
    queryFn: async () => {
      const response = await adminApi.getPricingConfig();
      return response.data;
    },
    staleTime: 1000 * 60 * 10 // 10 minutes
  });

  // שליפת מוצרים עם pagination + FIFO sorting
  const { data: apiResponse, isLoading, error } = useQuery({
    queryKey: ['admin', 'products', 'inventory', page, searchTerm],
    queryFn: async () => {
      const response = await adminApi.getAllProducts({
        page,
        limit,
        search: searchTerm || undefined,
        sortBy: 'oldest_check' // FIFO - מוצרים שלא נבדקו ראשונים
      });
      return response;
    }
  });

  // Parse response data
  const products = apiResponse?.data || [];
  const pagination = apiResponse?.pagination || {};
  const totalProducts = pagination.totalProducts || 0;
  const totalPages = pagination.totalPages || 1;
  const currentPage = pagination.currentPage || 1;

  // סטטיסטיקות זמינות
  const checkedCount = getCheckedCountFromProducts(products);
  const uncheckedCount = products.length - checkedCount;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          {/* Top Row - Title + Productivity Counter */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-neutral-900">מצפן מלאי ותמחור</h1>
                <p className="text-xs text-neutral-500 hidden sm:block">
                  בדוק זמינות ומחירים - FIFO Queue
                </p>
              </div>
            </div>

            {/* Productivity Counter */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-800">
                  בדקת היום: <span className="text-lg">{checkedToday}</span>
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-800">
                  נותרו: <span className="text-lg">{totalProducts > 0 ? totalProducts - checkedToday : 0}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Stats Row - Compact */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
              <span className="text-xs text-blue-600">סה"כ:</span>
              <span className="text-sm font-bold text-blue-900">{totalProducts}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg">
              <span className="text-xs text-purple-600">עמוד:</span>
              <span className="text-sm font-bold text-purple-900">{currentPage}/{totalPages}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
              <CheckCircle2 className="w-3 h-3 text-green-600" />
              <span className="text-xs text-green-600">נבדקו:</span>
              <span className="text-sm font-bold text-green-900">{checkedCount}/{products.length}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-lg">
              <span className="text-xs text-amber-600">ממתינים:</span>
              <span className="text-sm font-bold text-amber-900">{uncheckedCount}</span>
            </div>
          </div>

          {/* Search Bar - Compact */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="חפש מוצר לפי שם או SKU..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pr-9 pl-4 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
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
            <div className="space-y-3 mb-6">
              {products.map((product) => (
                <ProductInventoryCard
                  key={product._id}
                  product={product}
                  pricingConfig={pricingConfig}
                  onChecked={incrementCheckedToday}
                  isSelected={selectedProductId === product._id}
                  onSelect={(id) => setSelectedProductId(id === selectedProductId ? null : id)}
                />
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
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <ChevronRight className="w-4 h-4" />
                    הקודם
                  </Button>

                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-sm font-medium text-neutral-900">
                      עמוד {currentPage} מתוך {totalPages}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {products.length} מתוך {totalProducts}
                    </span>
                  </div>

                  <Button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
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
    </div>
  );
}
