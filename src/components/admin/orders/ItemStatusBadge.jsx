/**
 * Item Status Badge Component
 *
 * בדג' צבעוני להצגת סטטוס פריט
 */

import { ITEM_STATUS_LABELS, ITEM_STATUS_COLORS } from '@/lib/constants/itemStatuses';

export default function ItemStatusBadge({ status, className = '' }) {
  const label = ITEM_STATUS_LABELS[status] || status;
  const colorClass = ITEM_STATUS_COLORS[status] || 'bg-gray-100 text-gray-700 border-gray-300';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-light tracking-wide border ${colorClass} ${className}`}
    >
      {label}
    </span>
  );
}
