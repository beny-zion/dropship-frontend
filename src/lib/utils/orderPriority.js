/**
 * Order Priority & Formatting Utilities
 *
 * פונקציות עזר לחישוב דחיפות ועיצוב זמנים
 */

/**
 * חישוב רמת דחיפות להזמנה
 * @param {Object} order - אובייקט הזמנה
 * @returns {'critical' | 'high' | 'medium' | 'low'}
 */
export function getUrgencyLevel(order) {
  // ✅ אם יש computed - השתמש בו!
  if (order.computed?.needsAttention !== undefined) {
    // אם צריך תשומת לב - לפחות high
    if (order.computed.needsAttention) {
      // בדוק אם critical לפי תנאים נוספים
      const activeItems = order.items?.filter(item => !item.cancellation?.cancelled) || [];
      const maxDaysStuck = Math.max(
        ...activeItems.map(item => {
          if (!['ordered_from_supplier', 'in_transit'].includes(item.itemStatus)) return 0;
          const lastUpdate = item.supplierOrder?.lastUpdated || item.supplierOrder?.orderedAt || order.createdAt;
          const days = Math.floor((Date.now() - new Date(lastUpdate)) / (1000 * 60 * 60 * 24));
          return days;
        }),
        0
      );

      if (maxDaysStuck > 14 || (activeItems.length > 0 && activeItems.length < 2)) {
        return 'critical';
      }
      return 'high';
    }

    // אם לא צריך תשומת לב
    if (order.computed.allItemsDelivered) return 'low';
    if (order.computed.hasActiveItems) return 'medium';
    return 'low';
  }

  // Fallback - חישוב ישן
  const stats = order.statistics || order.stuckOrders;

  if (!stats) return 'low';

  const maxDaysStuck = stats.maxDaysStuck || 0;
  const activeItemsCount = stats.activeItemsCount || 0;
  const stuckItemsCount = stats.stuckItemsCount || stats.hasStuckItems ? 1 : 0;

  // Critical - תקוע מעל 14 ימים או מתחת למינימום
  if (maxDaysStuck > 14 || (activeItemsCount > 0 && activeItemsCount < 2)) {
    return 'critical';
  }

  // High - תקוע 7-14 ימים או pending/payment_hold
  if (
    maxDaysStuck >= 7 ||
    order.status === 'pending' ||
    order.status === 'payment_hold'
  ) {
    return 'high';
  }

  // Medium - יש פריטים תקועים או מוזמנים
  if (stuckItemsCount > 0 || stats.orderedFromSupplierCount > 0) {
    return 'medium';
  }

  // Low - הכל OK
  return 'low';
}

/**
 * קבלת צבע לפי רמת דחיפות
 */
export function getUrgencyColor(level) {
  const colors = {
    critical: {
      bg: 'bg-red-500',
      text: 'text-red-600',
      border: 'border-red-500',
      light: 'bg-red-50'
    },
    high: {
      bg: 'bg-orange-500',
      text: 'text-orange-600',
      border: 'border-orange-500',
      light: 'bg-orange-50'
    },
    medium: {
      bg: 'bg-yellow-500',
      text: 'text-yellow-600',
      border: 'border-yellow-500',
      light: 'bg-yellow-50'
    },
    low: {
      bg: 'bg-green-500',
      text: 'text-green-600',
      border: 'border-green-500',
      light: 'bg-green-50'
    }
  };

  return colors[level] || colors.low;
}

/**
 * חישוב אחוז השלמה של הזמנה
 * @param {Object} order - אובייקט הזמנה
 * @returns {number} - אחוז השלמה (0-100)
 */
export function calculateCompletion(order) {
  // ✅ אם יש computed - השתמש בו!
  if (order.computed?.completionPercentage !== undefined) {
    return order.computed.completionPercentage;
  }

  // Fallback - חישוב ידני
  if (!order.items || order.items.length === 0) return 0;

  const totalItems = order.items.filter(item => !item.cancellation?.cancelled).length;
  if (totalItems === 0) return 100; // אם הכל בוטל

  const deliveredItems = order.items.filter(
    item => !item.cancellation?.cancelled && item.itemStatus === 'delivered'
  ).length;

  return Math.round((deliveredItems / totalItems) * 100);
}

/**
 * עיצוב זמן יחסי בעברית
 * @param {Date|string} date - תאריך
 * @returns {string} - תיאור זמן יחסי
 */
export function formatRelativeTime(date) {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (months > 0) return `לפני ${months} ${months === 1 ? 'חודש' : 'חודשים'}`;
  if (weeks > 0) return `לפני ${weeks} ${weeks === 1 ? 'שבוע' : 'שבועות'}`;
  if (days > 0) return `לפני ${days} ${days === 1 ? 'יום' : 'ימים'}`;
  if (hours > 0) return `לפני ${hours} ${hours === 1 ? 'שעה' : 'שעות'}`;
  if (minutes > 0) return `לפני ${minutes} ${minutes === 1 ? 'דקה' : 'דקות'}`;
  return 'כרגע';
}

/**
 * עיצוב תאריך מלא בעברית
 */
export function formatHebrewDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * קבלת טקסט סטטוס בעברית
 */
export function getStatusText(status) {
  const statusMap = {
    pending: 'ממתין לאישור',
    payment_hold: 'בהמתנה לתשלום',
    ordered_from_supplier: 'הוזמן מספק',
    in_transit: 'בדרך',
    delivered: 'נמסר',
    cancelled: 'בוטל',
    processing: 'בטיפול'
  };

  return statusMap[status] || status;
}
