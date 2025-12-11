/**
 * Item Status Constants - Frontend
 *
 * קבועים וצבעים לסטטוסי פריטים
 */

export const ITEM_STATUS = {
  PENDING: 'pending',
  ORDERED_FROM_SUPPLIER: 'ordered_from_supplier',
  ARRIVED_US_WAREHOUSE: 'arrived_us_warehouse',
  SHIPPED_TO_ISRAEL: 'shipped_to_israel',
  CUSTOMS_ISRAEL: 'customs_israel',
  ARRIVED_ISRAEL: 'arrived_israel',
  READY_FOR_DELIVERY: 'ready_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

export const ITEM_STATUS_LABELS = {
  [ITEM_STATUS.PENDING]: 'ממתין לטיפול',
  [ITEM_STATUS.ORDERED_FROM_SUPPLIER]: 'הוזמן מספק',
  [ITEM_STATUS.ARRIVED_US_WAREHOUSE]: 'הגיע למחסן ארה"ב',
  [ITEM_STATUS.SHIPPED_TO_ISRAEL]: 'נשלח לישראל',
  [ITEM_STATUS.CUSTOMS_ISRAEL]: 'במכס בישראל',
  [ITEM_STATUS.ARRIVED_ISRAEL]: 'הגיע לישראל',
  [ITEM_STATUS.READY_FOR_DELIVERY]: 'מוכן למשלוח',
  [ITEM_STATUS.DELIVERED]: 'נמסר',
  [ITEM_STATUS.CANCELLED]: 'בוטל'
};

export const ITEM_STATUS_COLORS = {
  [ITEM_STATUS.PENDING]: 'bg-gray-100 text-gray-700 border-gray-300',
  [ITEM_STATUS.ORDERED_FROM_SUPPLIER]: 'bg-blue-100 text-blue-700 border-blue-300',
  [ITEM_STATUS.ARRIVED_US_WAREHOUSE]: 'bg-indigo-100 text-indigo-700 border-indigo-300',
  [ITEM_STATUS.SHIPPED_TO_ISRAEL]: 'bg-purple-100 text-purple-700 border-purple-300',
  [ITEM_STATUS.CUSTOMS_ISRAEL]: 'bg-pink-100 text-pink-700 border-pink-300',
  [ITEM_STATUS.ARRIVED_ISRAEL]: 'bg-cyan-100 text-cyan-700 border-cyan-300',
  [ITEM_STATUS.READY_FOR_DELIVERY]: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  [ITEM_STATUS.DELIVERED]: 'bg-green-100 text-green-700 border-green-300',
  [ITEM_STATUS.CANCELLED]: 'bg-red-100 text-red-700 border-red-300'
};

// סטטוסים אפשריים למעבר (לכל סטטוס)
export const NEXT_STATUSES = {
  [ITEM_STATUS.PENDING]: [
    ITEM_STATUS.ORDERED_FROM_SUPPLIER
  ],
  [ITEM_STATUS.ORDERED_FROM_SUPPLIER]: [
    ITEM_STATUS.ARRIVED_US_WAREHOUSE
  ],
  [ITEM_STATUS.ARRIVED_US_WAREHOUSE]: [
    ITEM_STATUS.SHIPPED_TO_ISRAEL
  ],
  [ITEM_STATUS.SHIPPED_TO_ISRAEL]: [
    ITEM_STATUS.CUSTOMS_ISRAEL,
    ITEM_STATUS.ARRIVED_ISRAEL
  ],
  [ITEM_STATUS.CUSTOMS_ISRAEL]: [
    ITEM_STATUS.ARRIVED_ISRAEL
  ],
  [ITEM_STATUS.ARRIVED_ISRAEL]: [
    ITEM_STATUS.READY_FOR_DELIVERY
  ],
  [ITEM_STATUS.READY_FOR_DELIVERY]: [
    ITEM_STATUS.DELIVERED
  ],
  [ITEM_STATUS.DELIVERED]: [],
  [ITEM_STATUS.CANCELLED]: []
};

export const MINIMUM_ORDER_AMOUNT = 400; // ש"ח
export const MINIMUM_ITEMS_COUNT = 2;

export default {
  ITEM_STATUS,
  ITEM_STATUS_LABELS,
  ITEM_STATUS_COLORS,
  NEXT_STATUSES,
  MINIMUM_ORDER_AMOUNT,
  MINIMUM_ITEMS_COUNT
};
