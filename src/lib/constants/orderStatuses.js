/**
 * Order Status Constants - SINGLE SOURCE OF TRUTH
 *
 * ✨ קובץ מרכזי אחד לכל הסטטוסים של ההזמנה
 * משמש את כל הרכיבים והעמודים במערכת
 *
 * תואם ל-backend/src/constants/orderStatuses.js
 */

// ✅ MAIN ORDER STATUSES (6)
export const ORDER_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  READY_TO_SHIP: 'ready_to_ship',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

// ⚠️ LEGACY STATUSES (for backward compatibility)
export const LEGACY_ORDER_STATUS = {
  PAYMENT_HOLD: 'payment_hold',
  ORDERED: 'ordered',
  ARRIVED_US_WAREHOUSE: 'arrived_us_warehouse',
  SHIPPED_TO_ISRAEL: 'shipped_to_israel',
  CUSTOMS_ISRAEL: 'customs_israel',
  ARRIVED_ISRAEL_WAREHOUSE: 'arrived_israel_warehouse',
  SHIPPED_TO_CUSTOMER: 'shipped_to_customer',
  IN_TRANSIT: 'in_transit'
};

export const ORDER_STATUS_LABELS = {
  // ✅ Main statuses
  [ORDER_STATUS.PENDING]: 'ממתין לטיפול',
  [ORDER_STATUS.IN_PROGRESS]: 'בתהליך',
  [ORDER_STATUS.READY_TO_SHIP]: 'מוכן למשלוח',
  [ORDER_STATUS.SHIPPED]: 'נשלח ללקוח',
  [ORDER_STATUS.DELIVERED]: 'נמסר',
  [ORDER_STATUS.CANCELLED]: 'בוטל',

  // ⚠️ Legacy statuses
  [LEGACY_ORDER_STATUS.PAYMENT_HOLD]: 'מסגרת תפוסה',
  [LEGACY_ORDER_STATUS.ORDERED]: 'הוזמן מספק',
  [LEGACY_ORDER_STATUS.ARRIVED_US_WAREHOUSE]: 'הגיע למחסן ארה"ב',
  [LEGACY_ORDER_STATUS.SHIPPED_TO_ISRAEL]: 'נשלח לישראל',
  [LEGACY_ORDER_STATUS.CUSTOMS_ISRAEL]: 'במכס בישראל',
  [LEGACY_ORDER_STATUS.ARRIVED_ISRAEL_WAREHOUSE]: 'הגיע למחסן בישראל',
  [LEGACY_ORDER_STATUS.SHIPPED_TO_CUSTOMER]: 'נשלח ללקוח (ישן)',
  [LEGACY_ORDER_STATUS.IN_TRANSIT]: 'בדרך לישראל'
};

export const ORDER_STATUS_COLORS = {
  // ✅ Main statuses
  [ORDER_STATUS.PENDING]: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-300',
    badge: 'bg-yellow-100 text-yellow-800',
    className: 'bg-yellow-100 text-yellow-800'
  },
  [ORDER_STATUS.IN_PROGRESS]: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300',
    badge: 'bg-blue-100 text-blue-800',
    className: 'bg-blue-100 text-blue-800'
  },
  [ORDER_STATUS.READY_TO_SHIP]: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-300',
    badge: 'bg-purple-100 text-purple-800',
    className: 'bg-purple-100 text-purple-800'
  },
  [ORDER_STATUS.SHIPPED]: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-800',
    border: 'border-indigo-300',
    badge: 'bg-indigo-100 text-indigo-800',
    className: 'bg-indigo-100 text-indigo-800'
  },
  [ORDER_STATUS.DELIVERED]: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-300',
    badge: 'bg-green-100 text-green-800',
    className: 'bg-green-100 text-green-800'
  },
  [ORDER_STATUS.CANCELLED]: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-300',
    badge: 'bg-red-100 text-red-800',
    className: 'bg-red-100 text-red-800'
  },

  // ⚠️ Legacy statuses
  [LEGACY_ORDER_STATUS.PAYMENT_HOLD]: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    className: 'bg-orange-100 text-orange-800'
  },
  [LEGACY_ORDER_STATUS.ORDERED]: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    className: 'bg-blue-100 text-blue-800'
  },
  [LEGACY_ORDER_STATUS.IN_TRANSIT]: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    className: 'bg-purple-100 text-purple-800'
  }
};

export const ORDER_STATUS_DESCRIPTIONS = {
  [ORDER_STATUS.PENDING]: 'ההזמנה התקבלה וממתינה לטיפול',
  [ORDER_STATUS.IN_PROGRESS]: 'פריטים בתהליך הזמנה או משלוח',
  [ORDER_STATUS.READY_TO_SHIP]: 'כל הפריטים הגיעו למחסן בישראל',
  [ORDER_STATUS.SHIPPED]: 'ההזמנה נשלחה ללקוח',
  [ORDER_STATUS.DELIVERED]: 'ההזמנה נמסרה ללקוח',
  [ORDER_STATUS.CANCELLED]: 'ההזמנה בוטלה'
};

/**
 * קבלת תצורה מלאה של סטטוס - פונקציית עזר מרכזית
 * @param {string} status - מפתח הסטטוס
 * @returns {object} { label, className }
 */
export function getStatusConfig(status) {
  const label = ORDER_STATUS_LABELS[status] || ORDER_STATUS_LABELS[ORDER_STATUS.PENDING];
  const className = ORDER_STATUS_COLORS[status]?.className || ORDER_STATUS_COLORS[ORDER_STATUS.PENDING].className;

  return { label, className };
}

/**
 * קבלת אובייקט פשוט של כל הסטטוסים (label + className)
 * שימושי ל-dropdown ו-badges
 * @param {boolean} includeActive - רק סטטוסים פעילים (default: true)
 * @returns {object} { status: { label, className } }
 */
export function getAllStatusConfigs(includeActive = true) {
  const configs = {};

  // ✅ Main statuses (always included)
  Object.values(ORDER_STATUS).forEach(status => {
    configs[status] = getStatusConfig(status);
  });

  // ⚠️ Legacy statuses (optional)
  if (!includeActive) {
    Object.values(LEGACY_ORDER_STATUS).forEach(status => {
      configs[status] = getStatusConfig(status);
    });
  }

  return configs;
}

/**
 * קבלת צבע badge לסטטוס
 */
export function getOrderStatusBadgeClass(status) {
  return ORDER_STATUS_COLORS[status]?.badge || ORDER_STATUS_COLORS[ORDER_STATUS.PENDING].badge;
}

/**
 * קבלת className של סטטוס (Tailwind)
 */
export function getOrderStatusClassName(status) {
  return ORDER_STATUS_COLORS[status]?.className || ORDER_STATUS_COLORS[ORDER_STATUS.PENDING].className;
}

/**
 * קבלת תווית לסטטוס
 */
export function getOrderStatusLabel(status) {
  return ORDER_STATUS_LABELS[status] || status;
}

/**
 * קבלת תיאור לסטטוס
 */
export function getOrderStatusDescription(status) {
  return ORDER_STATUS_DESCRIPTIONS[status] || '';
}

/**
 * בדיקה אם סטטוס תקין
 */
export function isValidOrderStatus(status) {
  return Object.values(ORDER_STATUS).includes(status) ||
         Object.values(LEGACY_ORDER_STATUS).includes(status);
}

/**
 * בדיקה אם סטטוס הוא legacy
 */
export function isLegacyStatus(status) {
  return Object.values(LEGACY_ORDER_STATUS).includes(status);
}

export default {
  ORDER_STATUS,
  LEGACY_ORDER_STATUS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_DESCRIPTIONS,
  getStatusConfig,
  getAllStatusConfigs,
  getOrderStatusBadgeClass,
  getOrderStatusClassName,
  getOrderStatusLabel,
  getOrderStatusDescription,
  isValidOrderStatus,
  isLegacyStatus
};
