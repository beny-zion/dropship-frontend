// app/admin/orders/page.jsx - Orders Management Page

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Eye, Package } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

const statusConfig = {
  pending: { label: 'ממתינה', className: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'אושרה', className: 'bg-blue-100 text-blue-800' },
  processing: { label: 'בטיפול', className: 'bg-purple-100 text-purple-800' },
  shipped: { label: 'נשלחה', className: 'bg-orange-100 text-orange-800' },
  delivered: { label: 'נמסרה', className: 'bg-green-100 text-green-800' },
  cancelled: { label: 'בוטלה', className: 'bg-red-100 text-red-800' }
};

export default function OrdersManagementPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 20;

  // Fetch orders
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders', { search, status: statusFilter, page, limit }],
    queryFn: () => adminApi.getAllOrders({
      search: search.length >= 3 ? search : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      page,
      limit
    })
  });

  // Fetch stats
  const { data: statsData } = useQuery({
    queryKey: ['admin', 'orders', 'stats'],
    queryFn: () => adminApi.getOrderStats()
  });

  // Extract orders and pagination from response
  // Server returns: { success, data: [...orders], pagination: {...} }
  const orders = data?.data || [];
  const pagination = data?.pagination || {};
  const stats = statsData?.data || {};

  // Debug log
  console.log('📦 Orders Page Data:', {
    rawData: data,
    ordersCount: orders.length,
    pagination,
    stats
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ניהול הזמנות</h1>
        <p className="text-gray-600 mt-1">
          {pagination.totalOrders || pagination.total || 0} הזמנות במערכת
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">הזמנות ממתינות</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {stats.pending || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">בטיפול</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {stats.processing || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">נשלחו</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">
            {stats.shipped || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">הושלמו</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {stats.breakdown?.delivered || 0}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="חיפוש לפי מספר הזמנה או לקוח (לפחות 3 תווים)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10"
            />
            {search.length > 0 && search.length < 3 && (
              <p className="text-xs text-amber-600 mt-1">
                יש להזין לפחות 3 תווים לחיפוש
              </p>
            )}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">כל הסטטוסים</option>
            <option value="pending">ממתינה</option>
            <option value="confirmed">אושרה</option>
            <option value="processing">בטיפול</option>
            <option value="shipped">נשלחה</option>
            <option value="delivered">נמסרה</option>
            <option value="cancelled">בוטלה</option>
          </select>

          {/* Clear Filters */}
          {(search || statusFilter !== 'all') && (
            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
              }}
            >
              נקה סינון
            </Button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">לא נמצאו הזמנות</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                      מספר הזמנה
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                      לקוח
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                      פריטים
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                      סכום
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                      סטטוס
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                      תאריך
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                      פעולות
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order._id?.toString() || order.id || order.orderNumber}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      {/* Order Number */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm font-medium text-gray-900">
                          {order.orderNumber}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {order.user?.firstName} {order.user?.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.user?.email}
                          </p>
                        </div>
                      </td>

                      {/* Items */}
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-700">
                          {order.items?.length || 0} פריטים
                        </span>
                      </td>

                      {/* Total */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-900">
                          ₪{order.pricing?.total?.toLocaleString()}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <Badge className={statusConfig[order.status]?.className}>
                          {statusConfig[order.status]?.label || order.status}
                        </Badge>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm text-gray-700">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('he-IL') : 'לא זמין'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.createdAt && !isNaN(new Date(order.createdAt).getTime()) ? (
                              formatDistanceToNow(new Date(order.createdAt), {
                                addSuffix: true,
                                locale: he
                              })
                            ) : (
                              '-'
                            )}
                          </p>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/orders/${String(order._id || order.id)}`}>
                            <Eye className="w-4 h-4 ml-1" />
                            צפייה
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {(pagination.totalPages || pagination.pages) > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  מציג {((page - 1) * limit) + 1} - {Math.min(page * limit, pagination.totalOrders || pagination.total || 0)} מתוך {pagination.totalOrders || pagination.total || 0}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    הקודם
                  </Button>
                  <span className="px-4 py-2 text-sm">
                    עמוד {page} מתוך {pagination.totalPages || pagination.pages || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(pagination.totalPages || pagination.pages || 1, p + 1))}
                    disabled={page === (pagination.totalPages || pagination.pages)}
                  >
                    הבא
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
