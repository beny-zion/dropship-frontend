// components/admin/orders/OrdersListWidget.jsx
// Phase 11: Enhanced Orders List with Bulk Selection Support

'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import OrderCompactCard from './OrderCompactCard';
import BulkActionsBar from './BulkActionsBar';
import { Loader2, ChevronRight, ChevronLeft, Square, CheckSquare } from 'lucide-react';

export default function OrdersListWidget({
  activeFilter,
  searchTerm,
  advancedFilters = {},
  onQuickAction
}) {
  const [page, setPage] = useState(1);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const limit = 20;
  const queryClient = useQueryClient();

  // Build query key including all filters
  const queryKey = [
    'admin',
    'orders',
    'filtered',
    activeFilter,
    searchTerm,
    advancedFilters.paymentStatus,
    advancedFilters.itemStatus,
    advancedFilters.dateRange?.from,
    advancedFilters.dateRange?.to,
    page
  ];

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const params = {
        filter: activeFilter,
        limit,
        page
      };

      // Add search term
      if (searchTerm && searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      // Add advanced filters
      if (advancedFilters.paymentStatus && advancedFilters.paymentStatus !== 'all') {
        params.paymentStatus = advancedFilters.paymentStatus;
      }

      if (advancedFilters.itemStatus && advancedFilters.itemStatus !== 'all') {
        params.itemStatus = advancedFilters.itemStatus;
      }

      if (advancedFilters.dateRange?.from) {
        params.dateFrom = advancedFilters.dateRange.from;
      }

      if (advancedFilters.dateRange?.to) {
        params.dateTo = advancedFilters.dateRange.to;
      }

      const response = await adminApi.getOrdersFiltered(params);
      return response.data;
    },
    refetchInterval: 60000, // Refresh every minute
    keepPreviousData: true
  });

  // Clear selection when filters or page changes
  useEffect(() => {
    setSelectedOrders([]);
  }, [activeFilter, searchTerm, page, advancedFilters.paymentStatus, advancedFilters.itemStatus]);

  // Reset page when filters change (except page)
  useEffect(() => {
    setPage(1);
  }, [activeFilter, searchTerm, advancedFilters.paymentStatus, advancedFilters.itemStatus, advancedFilters.dateRange?.from, advancedFilters.dateRange?.to]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Selection handlers
  const handleSelectOrder = (order) => {
    setSelectedOrders(prev => {
      const isSelected = prev.some(o => o._id === order._id);
      if (isSelected) {
        return prev.filter(o => o._id !== order._id);
      } else {
        return [...prev, order];
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedOrders(orders);
  };

  const handleClearSelection = () => {
    setSelectedOrders([]);
  };

  const handleActionComplete = () => {
    // Refresh data and clear selection
    refetch();
    queryClient.invalidateQueries(['admin', 'orders']);
    setSelectedOrders([]);
  };

  const orders = data?.orders || [];
  const pagination = data?.pagination || {};
  const totalPages = Math.ceil((pagination.total || 0) / limit);

  if (error) {
    return (
      <div className="bg-white border border-neutral-200 rounded-lg p-6">
        <div className="text-center text-red-600">
          <p>שגיאה בטעינת הזמנות</p>
          <p className="text-sm text-neutral-600 mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedOrders={selectedOrders}
        totalOrders={orders.length}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        onActionComplete={handleActionComplete}
      />

      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 bg-neutral-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {orders.length > 0 && (
                <button
                  onClick={selectedOrders.length === orders.length ? handleClearSelection : handleSelectAll}
                  className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                  title={selectedOrders.length === orders.length ? 'בטל בחירה' : 'בחר הכל'}
                >
                  {selectedOrders.length === orders.length ? (
                    <CheckSquare className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>
              )}
              <h2 className="text-lg font-medium">הזמנות פעילות</h2>
            </div>
            {!isLoading && (
              <span className="text-sm text-neutral-600">
                {pagination.total || 0} הזמנות
              </span>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && orders.length === 0 && (
          <div className="text-center py-12 text-neutral-600">
            {searchTerm ? (
              <>
                <p className="font-medium">לא נמצאו תוצאות לחיפוש</p>
                <p className="text-sm mt-2">נסה לחפש במילים אחרות או בדוק את האיות</p>
              </>
            ) : (
              <>
                <p className="font-medium">לא נמצאו הזמנות</p>
                <p className="text-sm mt-2">נסה לשנות את הפילטרים או לחפש משהו אחר</p>
              </>
            )}
          </div>
        )}

        {/* Orders List */}
        {!isLoading && orders.length > 0 && (
          <div>
            {orders.map(order => (
              <OrderCompactCard
                key={order._id}
                order={order}
                onQuickAction={onQuickAction}
                isSelected={selectedOrders.some(o => o._id === order._id)}
                onSelect={handleSelectOrder}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="p-4 border-t border-neutral-200 bg-neutral-50">
            <div className="flex items-center justify-between">
              {/* Results Info */}
              <span className="text-sm text-neutral-600">
                מציג {((page - 1) * limit) + 1}-{Math.min(page * limit, pagination.total)} מתוך {pagination.total}
              </span>

              {/* Pagination Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-neutral-300 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors
                          ${page === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-neutral-100'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-neutral-300 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
