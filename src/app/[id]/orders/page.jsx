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

export default function OrdersPage() {
  const [filters, setFilters] = useState({
    status: 'all',
    sortBy: '-createdAt',
    page: 1,
    limit: 10,
  });

  const { data: ordersData, isLoading, error } = useOrders(filters);

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

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message="שגיאה בטעינת ההזמנות" />;

  const orders = ordersData?.data || [];
  const pagination = ordersData?.pagination;

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">ההזמנות שלי</h1>
        <p className="text-muted-foreground">
          עקוב אחר ההזמנות שלך וצפה בהיסטוריה המלאה
        </p>
      </div>

      <div className="space-y-6">
        <OrderFilters
          status={filters.status}
          sortBy={filters.sortBy}
          onStatusChange={handleStatusChange}
          onSortChange={handleSortChange}
          onReset={handleReset}
        />

        {orders.length === 0 ? (
          <EmptyState
            icon={<Package className="h-12 w-12" />}
            title={filters.status === 'all' ? 'אין הזמנות' : 'אין הזמנות מסוננות'}
            description={
              filters.status === 'all'
                ? 'עדיין לא ביצעת הזמנות. התחל לקנות עכשיו!'
                : 'לא נמצאו הזמנות עם הסינון הנבחר. נסה לשנות את הפילטרים.'
            }
            action={
              filters.status === 'all'
                ? {
                    label: 'עבור לחנות',
                    href: '/products',
                  }
                : {
                    label: 'איפוס סינון',
                    onClick: handleReset,
                  }
            }
          />
        ) : (
          <>
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-semibold text-lg">
                            הזמנה #{order.orderNumber}
                          </h3>
                          <Badge className={ORDER_STATUS_COLORS[order.status]}>
                            {ORDER_STATUS_LABELS[order.status]}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <span>תאריך:</span>
                            <span className="font-medium">{formatDate(order.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>פריטים:</span>
                            <span className="font-medium">{order.items.length}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>סה"כ:</span>
                            <span className="font-medium">
                              {formatCurrency(order.totalAmount)}
                            </span>
                          </div>
                        </div>

                        {/* Order Items Preview */}
                        <div className="flex gap-2 overflow-x-auto py-2">
                          {order.items.slice(0, 4).map((item, idx) => (
                            <div
                              key={idx}
                              className="relative w-16 h-16 rounded border bg-muted shrink-0"
                            >
                              {item.product?.imageUrl ? (
                                <img
                                  src={item.product.imageUrl}
                                  alt={item.product.name_he}
                                  className="w-full h-full object-cover rounded"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                          ))}
                          {order.items.length > 4 && (
                            <div className="w-16 h-16 rounded border bg-muted flex items-center justify-center text-sm font-medium shrink-0">
                              +{order.items.length - 4}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 lg:flex-col">
                        <Button asChild variant="outline" className="flex-1 lg:flex-initial">
                          <Link href={`/orders/${order._id}`}>
                            צפה בפרטים
                            <ChevronLeft className="h-4 w-4 mr-2" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page === 1}
                >
                  הקודם
                </Button>

                <div className="flex gap-1">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={filters.page === page ? 'default' : 'outline'}
                      onClick={() => handlePageChange(page)}
                      size="sm"
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page === pagination.pages}
                >
                  הבא
                </Button>
              </div>
            )}

            {/* Results summary */}
            {pagination && (
              <p className="text-sm text-muted-foreground text-center">
                מציג {orders.length} מתוך {pagination.total} הזמנות
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}