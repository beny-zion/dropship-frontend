'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  ChevronUp,
  Package,
  Truck,
  AlertTriangle,
  XCircle,
  Printer,
  RefreshCw,
  Eye
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getUrgencyLevel, getUrgencyColor, calculateCompletion, formatRelativeTime } from '@/lib/utils/orderPriority';
import { getStatusConfig } from '@/lib/constants/orderStatuses';

function StatusBadge({ status, size = 'default' }) {
  const { label, className } = getStatusConfig(status);
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${className} ${sizeClass}`}>
      {label}
    </span>
  );
}

export default function OrderCompactCard({ order, onQuickAction, isSelected, onSelect }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const urgencyLevel = getUrgencyLevel(order);
  const urgencyColors = getUrgencyColor(urgencyLevel);
  const completionPercentage = calculateCompletion(order);

  const stats = order.statistics || {};

  return (
    <div className={`p-4 hover:bg-neutral-50 transition-colors border-b border-neutral-200 last:border-b-0 ${isSelected ? 'bg-blue-50' : ''}`}>
      {/* Header - תמיד גלוי */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 flex-1">
          {/* Selection Checkbox */}
          {onSelect && (
            <input
              type="checkbox"
              checked={isSelected || false}
              onChange={(e) => {
                e.stopPropagation();
                onSelect(order);
              }}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
            />
          )}

          {/* Urgency Indicator */}
          <div
            className={`
              w-3 h-3 rounded-full ${urgencyColors.bg}
              ${urgencyLevel === 'critical' ? 'animate-pulse' : ''}
            `}
            title={`דחיפות: ${urgencyLevel}`}
          />

          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/admin/orders/${order._id}`}
                className="font-medium hover:underline text-blue-600"
              >
                הזמנה #{order.orderNumber}
              </Link>
              <span className="text-sm text-neutral-600">
                {order.user?.firstName} {order.user?.lastName}
              </span>
              <StatusBadge status={order.status} size="sm" />
            </div>

            <div className="text-xs text-neutral-500 mt-1">
              {order.items?.length || 0} פריטים •
              נוצרה {formatRelativeTime(order.createdAt)}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="text-left mr-4 hidden md:block">
          <div className="text-sm font-medium mb-1 text-neutral-700">
            {completionPercentage}%
          </div>
          <div className="w-32 bg-neutral-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Items Summary - תמיד גלוי */}
      <div className="flex items-center gap-4 mt-3 text-xs flex-wrap">
        {stats.orderedFromSupplierCount > 0 && (
          <span key="ordered" className="flex items-center gap-1 text-blue-600">
            <Package className="w-3 h-3" />
            {stats.orderedFromSupplierCount} מספק
          </span>
        )}

        {stats.inTransitCount > 0 && (
          <span key="transit" className="flex items-center gap-1 text-purple-600">
            <Truck className="w-3 h-3" />
            {stats.inTransitCount} בדרך
          </span>
        )}

        {stats.stuckOrders?.stuckItemsCount > 0 && (
          <span key="stuck" className="flex items-center gap-1 text-red-600 font-medium">
            <AlertTriangle className="w-3 h-3" />
            {stats.stuckOrders.stuckItemsCount} תקוע ({stats.stuckOrders.maxDaysStuck} ימים)
          </span>
        )}

        {stats.cancelledItemsCount > 0 && (
          <span key="cancelled" className="flex items-center gap-1 text-gray-600">
            <XCircle className="w-3 h-3" />
            {stats.cancelledItemsCount} בוטל
          </span>
        )}
      </div>

      {/* Quick Actions - תמיד גלוי */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4 ml-1" />
              סגור
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 ml-1" />
              הרחב
            </>
          )}
        </Button>

        <Button
          onClick={() => onQuickAction?.('print_label', order._id)}
          variant="outline"
          size="sm"
          className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
        >
          <Printer className="w-3 h-3 ml-1" />
          הדפס תווית
        </Button>

        <Button
          onClick={() => onQuickAction?.('update_status', order._id)}
          variant="outline"
          size="sm"
          className="text-xs bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
        >
          <RefreshCw className="w-3 h-3 ml-1" />
          עדכן סטטוס
        </Button>

        <Link href={`/admin/orders/${order._id}`}>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <Eye className="w-3 h-3 ml-1" />
            צפה מלא
          </Button>
        </Link>
      </div>

      {/* Expanded View - רק כשלוחצים */}
      {isExpanded && order.items && (
        <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
          <div className="space-y-2">
            {order.items.map(item => (
              <div
                key={item._id}
                className="flex items-center justify-between text-sm p-2 bg-white rounded"
              >
                <div className="flex items-center gap-2 flex-1">
                  <StatusBadge status={item.itemStatus} size="sm" />
                  <span className="truncate max-w-xs">{item.name}</span>
                </div>
                <div className="text-xs text-neutral-500">
                  {item.supplierName || 'לא נבחר ספק'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
