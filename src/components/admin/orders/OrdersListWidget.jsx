'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import OrderCompactCard from './OrderCompactCard';
import { Loader2 } from 'lucide-react';

export default function OrdersListWidget({ activeFilter, searchTerm, onQuickAction }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'orders', 'filtered', activeFilter, searchTerm],
    queryFn: async () => {
      const params = {
        filter: activeFilter,
        limit: 50
      };

      // הוסף חיפוש אם קיים
      if (searchTerm && searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const response = await adminApi.getOrdersFiltered(params);
      return response.data;
    },
    refetchInterval: 60000, // כל דקה
    enabled: true // תמיד enabled, גם עם חיפוש
  });

  const orders = data?.orders || [];
  const pagination = data?.pagination || {};

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
    <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200 bg-neutral-50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">הזמנות פעילות</h2>
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

      {/* Orders List */}
      {!isLoading && orders.length === 0 && (
        <div className="text-center py-12 text-neutral-600">
          {searchTerm ? (
            <>
              <p className="font-medium">לא נמצאו תוצאות לחיפוש</p>
              <p className="text-sm mt-2">נסה לחפש במילים אחרות או בדוק את האיות</p>
            </>
          ) : (
            <p>לא נמצאו הזמנות</p>
          )}
        </div>
      )}

      {!isLoading && orders.length > 0 && (
        <div>
          {orders.map(order => (
            <OrderCompactCard
              key={order._id}
              order={order}
              onQuickAction={onQuickAction}
            />
          ))}
        </div>
      )}

      {/* Pagination Info */}
      {!isLoading && pagination.total > pagination.limit && (
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 text-center text-sm text-neutral-600">
          מציג {orders.length} מתוך {pagination.total} הזמנות
        </div>
      )}
    </div>
  );
}
