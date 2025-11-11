// components/admin/RecentOrders.jsx - Week 5: Recent Orders Table

'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';
import { ExternalLink } from 'lucide-react';
import { useStatusConfig } from '@/lib/hooks/useOrderStatuses';

export default function RecentOrders({ orders = [] }) {
  // Load dynamic status configuration
  const { statusConfig, isLoading: statusLoading } = useStatusConfig();
  // Ensure orders is an array
  const orderList = Array.isArray(orders) ? orders : [];

  if (!orderList || orderList.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        אין הזמנות להצגה
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
              מספר הזמנה
            </th>
            <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
              לקוח
            </th>
            <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
              סטטוס
            </th>
            <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
              סכום
            </th>
            <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
              זמן
            </th>
            <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
              פעולות
            </th>
          </tr>
        </thead>
        <tbody>
          {orderList.map((order) => (
            <tr 
              key={order._id} 
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

              {/* Status */}
              <td className="py-3 px-4">
                <Badge className={statusConfig[order.status]?.className || 'bg-gray-100 text-gray-800'}>
                  {statusConfig[order.status]?.label || order.status}
                </Badge>
              </td>

              {/* Total */}
              <td className="py-3 px-4">
                <span className="font-semibold text-gray-900">
                  ₪{order.pricing?.total?.toLocaleString()}
                </span>
              </td>

              {/* Time */}
              <td className="py-3 px-4">
                <span className="text-sm text-gray-600">
                  {formatDistanceToNow(new Date(order.createdAt), { 
                    addSuffix: true,
                    locale: he 
                  })}
                </span>
              </td>

              {/* Actions */}
              <td className="py-3 px-4">
                <Link
                  href={`/admin/orders/${order._id}`}
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  צפייה
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* View All Link */}
      <div className="mt-4 text-center">
        <Link
          href="/admin/orders"
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          צפייה בכל ההזמנות →
        </Link>
      </div>
    </div>
  );
}
