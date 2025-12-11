/**
 * Order Alerts Panel
 *
 * פאנל התראות - מציג הזמנות שדורשות תשומת לב
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import { AlertTriangle, Package, Clock, User } from 'lucide-react';
import Link from 'next/link';

export default function OrderAlertsPanel() {
  const { data: alertsData, isLoading } = useQuery({
    queryKey: ['admin', 'order-alerts'],
    queryFn: async () => {
      const response = await adminApi.getOrdersWithAlerts();
      return response.data;
    },
    refetchInterval: 60000 // Refresh every minute
  });

  if (isLoading) {
    return (
      <div className="bg-white border border-neutral-200 p-6">
        <p className="text-sm text-neutral-500">טוען התראות...</p>
      </div>
    );
  }

  if (!alertsData || alertsData.ordersWithAlerts === 0) {
    return (
      <div className="bg-white border border-neutral-200 p-6">
        <div className="flex items-center gap-3 text-green-600">
          <Package className="w-5 h-5" />
          <p className="text-sm font-light">
            אין הזמנות שדורשות תשומת לב כרגע
          </p>
        </div>
      </div>
    );
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Package className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="bg-white border border-neutral-200">
      {/* Header */}
      <div className="border-b border-neutral-200 p-6 bg-red-50">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-light tracking-wide flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            הזמנות עם התראות
          </h2>
          <div className="text-sm">
            <span className="font-medium text-red-600">{alertsData.ordersWithAlerts}</span>
            <span className="text-neutral-600"> מתוך {alertsData.totalOrders} הזמנות</span>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="divide-y divide-neutral-200">
        {alertsData.orders.map((order) => (
          <div key={order.orderId} className="p-6 hover:bg-neutral-50 transition-colors">
            {/* Order Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <Link
                  href={`/admin/orders/${order.orderId}`}
                  className="text-lg font-light hover:underline"
                >
                  הזמנה #{order.orderNumber}
                </Link>
                <div className="flex items-center gap-2 mt-1 text-sm text-neutral-600">
                  <User className="w-3 h-3" />
                  <span>
                    {order.user?.firstName} {order.user?.lastName}
                  </span>
                  <span className="text-neutral-400">•</span>
                  <span>
                    {new Date(order.createdAt).toLocaleDateString('he-IL')}
                  </span>
                </div>
              </div>

              <div className="text-left">
                <p className="text-xs text-neutral-500">אחוז השלמה</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-24 bg-neutral-200 h-2">
                    <div
                      className="bg-blue-500 h-2 transition-all"
                      style={{ width: `${order.statistics.completionPercentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {order.statistics.completionPercentage}%
                  </span>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="bg-neutral-50 border border-neutral-200 px-3 py-2">
                <p className="text-xs text-neutral-600">סך פריטים</p>
                <p className="text-lg font-light">{order.statistics.totalItemsCount}</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 px-3 py-2">
                <p className="text-xs text-blue-600">פעילים</p>
                <p className="text-lg font-light text-blue-800">
                  {order.statistics.activeItemsCount}
                </p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 px-3 py-2">
                <p className="text-xs text-yellow-600">תקועים</p>
                <p className="text-lg font-light text-yellow-800">
                  {order.statistics.stuckOrders.stuckItemsCount}
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 px-3 py-2">
                <p className="text-xs text-red-600">התראות</p>
                <p className="text-lg font-light text-red-800">
                  {order.statistics.stuckOrders.alertsCount}
                </p>
              </div>
            </div>

            {/* Alerts */}
            {order.alerts && order.alerts.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-neutral-700 mb-2">
                  התראות ({order.alerts.length}):
                </p>
                {order.alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-2 p-3 border ${getSeverityColor(alert.severity)}`}
                  >
                    {getSeverityIcon(alert.severity)}
                    <p className="text-sm flex-1">{alert.message}</p>
                  </div>
                ))}
              </div>
            )}

            {/* View Order Button */}
            <div className="mt-4 pt-4 border-t border-neutral-200">
              <Link
                href={`/admin/orders/${order.orderId}`}
                className="inline-block px-4 py-2 bg-black text-white text-sm font-light tracking-wide hover:bg-neutral-800 transition-colors"
              >
                צפה בהזמנה וטפל בבעיות
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
