/**
 * Order Status Constants - SIMPLIFIED
 *
 * ✨ NEW: צומצם מ-10 ל-6 סטטוסים ראשיים בלבד
 * תואם ל-backend/src/constants/orderStatuses.js
 */

export const ORDER_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  READY_TO_SHIP: 'ready_to_ship',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'ממתין לטיפול',
  [ORDER_STATUS.IN_PROGRESS]: 'בתהליך',
  [ORDER_STATUS.READY_TO_SHIP]: 'מוכן למשלוח',
  [ORDER_STATUS.SHIPPED]: 'נשלח ללקוח',
  [ORDER_STATUS.DELIVERED]: 'נמסר',
  [ORDER_STATUS.CANCELLED]: 'בוטל'
};

export const ORDER_STATUS_COLORS = {
  [ORDER_STATUS.PENDING]: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-300',
    badge: 'bg-gray-100 text-gray-700 border border-gray-300'
  },
  [ORDER_STATUS.IN_PROGRESS]: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-300',
    badge: 'bg-blue-100 text-blue-700 border border-blue-300'
  },
  [ORDER_STATUS.READY_TO_SHIP]: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-300',
    badge: 'bg-purple-100 text-purple-700 border border-purple-300'
  },
  [ORDER_STATUS.SHIPPED]: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-700',
    border: 'border-indigo-300',
    badge: 'bg-indigo-100 text-indigo-700 border border-indigo-300'
  },
  [ORDER_STATUS.DELIVERED]: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-300',
    badge: 'bg-green-100 text-green-700 border border-green-300'
  },
  [ORDER_STATUS.CANCELLED]: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-300',
    badge: 'bg-red-100 text-red-700 border border-red-300'
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
 * קבלת צבע badge לסטטוס
 */
export function getOrderStatusBadgeClass(status) {
  return ORDER_STATUS_COLORS[status]?.badge || ORDER_STATUS_COLORS[ORDER_STATUS.PENDING].badge;
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
  return Object.values(ORDER_STATUS).includes(status);
}

export default {
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_DESCRIPTIONS,
  getOrderStatusBadgeClass,
  getOrderStatusLabel,
  getOrderStatusDescription,
  isValidOrderStatus
};
