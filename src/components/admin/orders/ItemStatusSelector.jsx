/**
 * Item Status Selector Component
 *
 * בוחר סטטוס לפריט - מציג את כל הסטטוסים עם גמישות מלאה
 */

import { ITEM_STATUS, ITEM_STATUS_LABELS } from '@/lib/constants/itemStatuses';

export default function ItemStatusSelector({ currentStatus, onSelect, disabled = false }) {
  // Get all statuses except 'pending' and 'cancelled'
  const allStatuses = Object.values(ITEM_STATUS).filter(
    status => status !== ITEM_STATUS.PENDING && status !== ITEM_STATUS.CANCELLED
  );

  return (
    <select
      value={currentStatus}
      onChange={(e) => {
        if (e.target.value !== currentStatus) {
          onSelect(e.target.value);
        }
      }}
      disabled={disabled}
      className="px-3 py-2 border border-neutral-300 text-sm font-light focus:border-black transition-colors outline-none disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <option value="">בחר סטטוס...</option>
      {allStatuses.map((status) => (
        <option key={status} value={status}>
          {ITEM_STATUS_LABELS[status]}
        </option>
      ))}
    </select>
  );
}
