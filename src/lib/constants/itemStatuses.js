/**
 * Item Status Constants - SIMPLIFIED
 *
 * ✨ NEW: צומצם מ-9 ל-7 סטטוסים
 * תואם ל-backend/src/constants/itemStatuses.js
 */

export const ITEM_STATUS = {
  PENDING: 'pending',
  ORDERED: 'ordered',
  IN_TRANSIT: 'in_transit',
  ARRIVED_ISRAEL: 'arrived_israel',
  SHIPPED_TO_CUSTOMER: 'shipped_to_customer',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

export const ITEM_STATUS_LABELS = {
  [ITEM_STATUS.PENDING]: 'ממתין להזמנה',
  [ITEM_STATUS.ORDERED]: 'הוזמן מספק',
  [ITEM_STATUS.IN_TRANSIT]: 'בדרך לישראל',
  [ITEM_STATUS.ARRIVED_ISRAEL]: 'הגיע לישראל',
  [ITEM_STATUS.SHIPPED_TO_CUSTOMER]: 'נשלח ללקוח',
  [ITEM_STATUS.DELIVERED]: 'נמסר ללקוח',
  [ITEM_STATUS.CANCELLED]: 'בוטל'
};

export const ITEM_STATUS_COLORS = {
  [ITEM_STATUS.PENDING]: 'bg-gray-100 text-gray-700 border-gray-300',
  [ITEM_STATUS.ORDERED]: 'bg-blue-100 text-blue-700 border-blue-300',
  [ITEM_STATUS.IN_TRANSIT]: 'bg-purple-100 text-purple-700 border-purple-300',
  [ITEM_STATUS.ARRIVED_ISRAEL]: 'bg-cyan-100 text-cyan-700 border-cyan-300',
  [ITEM_STATUS.SHIPPED_TO_CUSTOMER]: 'bg-indigo-100 text-indigo-700 border-indigo-300',
  [ITEM_STATUS.DELIVERED]: 'bg-green-100 text-green-700 border-green-300',
  [ITEM_STATUS.CANCELLED]: 'bg-red-100 text-red-700 border-red-300'
};

// ✨ NEW: Simplified status transitions
export const NEXT_STATUSES = {
  [ITEM_STATUS.PENDING]: [
    ITEM_STATUS.ORDERED
  ],
  [ITEM_STATUS.ORDERED]: [
    ITEM_STATUS.IN_TRANSIT
  ],
  [ITEM_STATUS.IN_TRANSIT]: [
    ITEM_STATUS.ARRIVED_ISRAEL
  ],
  [ITEM_STATUS.ARRIVED_ISRAEL]: [
    ITEM_STATUS.SHIPPED_TO_CUSTOMER,
    ITEM_STATUS.DELIVERED  // אפשרות לדלג (איסוף עצמי)
  ],
  [ITEM_STATUS.SHIPPED_TO_CUSTOMER]: [
    ITEM_STATUS.DELIVERED
  ],
  [ITEM_STATUS.DELIVERED]: [],
  [ITEM_STATUS.CANCELLED]: []
};

/**
 * קבלת סטטוס הבא המומלץ
 */
export function getNextRecommendedStatus(currentStatus) {
  const nextOptions = NEXT_STATUSES[currentStatus];
  if (!nextOptions || nextOptions.length === 0) {
    return null;
  }
  return nextOptions[0]; // החזר את הראשון כברירת מחדל
}

/**
 * קבלת תווית סטטוס
 */
export function getItemStatusLabel(status) {
  return ITEM_STATUS_LABELS[status] || status;
}

/**
 * קבלת צבע סטטוס
 */
export function getItemStatusColor(status) {
  return ITEM_STATUS_COLORS[status] || ITEM_STATUS_COLORS[ITEM_STATUS.PENDING];
}

/**
 * בדיקה אם סטטוס תקין
 */
export function isValidItemStatus(status) {
  return Object.values(ITEM_STATUS).includes(status);
}

// הסרנו את MINIMUM_ORDER_AMOUNT ו-MINIMUM_ITEMS_COUNT
// כי אלה צריכים להגיע דינמית מהשרת (SystemSettings)

export default {
  ITEM_STATUS,
  ITEM_STATUS_LABELS,
  ITEM_STATUS_COLORS,
  NEXT_STATUSES,
  getNextRecommendedStatus,
  getItemStatusLabel,
  getItemStatusColor,
  isValidItemStatus
};
