'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useOrders } from '@/lib/hooks/useOrders';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import OrderFilters from '@/components/orders/OrderFilters';
import Loading from '@/components/shared/Loading';
import ErrorMessage from '@/components/shared/ErrorMessage';
import EmptyState from '@/components/shared/EmptyState';
import { formatDate, formatCurrency } from '@/lib/utils/format';
import { ChevronLeft, Package, ShoppingBag } from 'lucide-react';
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '@/lib/api/orders';
import { useStatusLabels, useStatusColors } from '@/lib/hooks/useOrderStatuses';

export default function OrdersPage() {
  const [filters, setFilters] = useState({
    status: 'all',
    sortBy: '-createdAt',
    page: 1,
    limit: 10,
  });

  const { data: ordersData, isLoading, error } = useOrders(filters);

  // Load dynamic statuses from server
  const { statusLabels, isLoading: statusLabelsLoading } = useStatusLabels();
  const { statusColors, isLoading: statusColorsLoading } = useStatusColors();

  const handleStatusChange = (status) => {
    setFilters((prev) => ({ ...prev, status, page: 1 }));
  };

  const handleSortChange = (sortBy) => {
    setFilters((prev) => ({ ...prev, sortBy, page: 1 }));
  };

  const handleReset = () => {
    setFilters({ status: 'all', sortBy: '-createdAt', page: 1, limit: 10 });
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  if (isLoading || statusLabelsLoading || statusColorsLoading) return <Loading />;
  if (error) return <ErrorMessage message="שגיאה בטעינת ההזמנות" />;

  const orders = ordersData?.data || [];
  const pagination = ordersData?.pagination;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-neutral-200">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-light tracking-widest uppercase text-center">ההזמנות שלי</h1>
        </div>
      </div>

      <div className="container max-w-6xl px-4 py-12">
        <p className="text-sm font-light text-neutral-600 tracking-wide mb-8">
          עקוב אחר ההזמנות שלך וצפה בהיסטוריה המלאה
        </p>

      <div className="space-y-6">
        <OrderFilters
          status={filters.status}
          sortBy={filters.sortBy}
          onStatusChange={handleStatusChange}
          onSortChange={handleSortChange}
          onReset={handleReset}
        />

        {orders.length === 0 ? (
          <div className="border border-dashed border-neutral-300 p-12 text-center">
            <Package className="h-20 w-20 mx-auto text-neutral-300 mb-4" />
            <h2 className="text-2xl font-light tracking-wide mb-2">
              {filters.status === 'all' ? 'אין הזמנות' : 'אין הזמנות מסוננות'}
            </h2>
            <p className="text-sm font-light text-neutral-600 mb-6 tracking-wide">
              {filters.status === 'all'
                ? 'עדיין לא ביצעת הזמנות. התחל לקנות עכשיו!'
                : 'לא נמצאו הזמנות עם הסינון הנבחר. נסה לשנות את הפילטרים.'}
            </p>
            {filters.status === 'all' ? (
              <Link href="/products">
                <button className="px-8 py-3 bg-black text-white text-sm font-light tracking-widest uppercase hover:bg-neutral-800 transition-all">
                  עבור לחנות
                </button>
              </Link>
            ) : (
              <button
                onClick={handleReset}
                className="px-8 py-3 bg-black text-white text-sm font-light tracking-widest uppercase hover:bg-neutral-800 transition-all"
              >
                איפוס סינון
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order._id} className="border border-neutral-200 p-6 hover:border-neutral-400 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-normal text-lg tracking-wide">
                          הזמנה #{order.orderNumber}
                        </h3>
                        <span className={`px-3 py-1 text-xs font-light tracking-wider ${
                          statusColors[order.status] || ORDER_STATUS_COLORS[order.status] || 'bg-neutral-100 text-neutral-700'
                        }`}>
                          {statusLabels[order.status] || ORDER_STATUS_LABELS[order.status] || order.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-light text-neutral-600">
                        <div className="flex items-center gap-2">
                          <span>תאריך:</span>
                          <span className="font-normal text-black">{formatDate(order.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>פריטים:</span>
                          <span className="font-normal text-black">{order.items.length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>סה"כ:</span>
                          <span className="font-normal text-black">
                            {formatCurrency(order.pricing?.total || order.totalAmount)}
                          </span>
                        </div>
                      </div>

                      {/* Order Items Preview */}
                      <div className="flex gap-2 overflow-x-auto py-2">
                        {order.items.slice(0, 4).map((item, idx) => {
                          // Get image from either product.images array or item.image or product.imageUrl
                          const primaryImage = item.product?.images?.find(img => img.isPrimary);
                          const imageUrl = primaryImage?.url || item.product?.images?.[0]?.url || item.image || item.product?.imageUrl;

                          return (
                            <div
                              key={`${item.product?._id || item.product?.id}-${item.variantSku || 'base'}-${idx}`}
                              className="relative w-16 h-16 border border-neutral-200 bg-neutral-50 shrink-0"
                            >
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={item.name || item.product?.name_he || 'מוצר'}
                                  className="w-full h-full object-contain p-1"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ShoppingBag className="h-6 w-6 text-neutral-400" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {order.items.length > 4 && (
                          <div className="w-16 h-16 border border-neutral-200 bg-neutral-50 flex items-center justify-center text-xs font-light shrink-0">
                            +{order.items.length - 4}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 lg:flex-col lg:min-w-[140px]">
                      <Link href={`/orders/${order._id}`} className="flex-1">
                        <button className="w-full px-4 py-3 border border-neutral-300 text-sm font-light tracking-wide hover:border-black transition-colors inline-flex items-center justify-center gap-2">
                          צפה בפרטים
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page === 1}
                  className="px-4 py-2 border border-neutral-300 text-sm font-light hover:border-black transition-colors disabled:opacity-30 disabled:hover:border-neutral-300"
                >
                  הקודם
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 text-sm font-light transition-colors ${
                        filters.page === page
                          ? 'bg-black text-white'
                          : 'border border-neutral-300 hover:border-black'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page === pagination.pages}
                  className="px-4 py-2 border border-neutral-300 text-sm font-light hover:border-black transition-colors disabled:opacity-30 disabled:hover:border-neutral-300"
                >
                  הבא
                </button>
              </div>
            )}

            {/* Results summary */}
            {pagination && (
              <p className="text-xs font-light text-neutral-600 text-center tracking-wide">
                מציג {orders.length} מתוך {pagination.total} הזמנות
              </p>
            )}
          </>
        )}
      </div>
      </div>
    </div>
  );
}