/**
 * Order Minimum Warning Component
 *
 * אזהרה כשההזמנה לא עומדת במינימום
 */

import { AlertTriangle } from 'lucide-react';
import { MINIMUM_ORDER_AMOUNT, MINIMUM_ITEMS_COUNT } from '@/lib/constants/itemStatuses';

export default function OrderMinimumWarning({ order }) {
  // חישוב פריטים פעילים
  const activeItems = order.items?.filter(item => !item.cancellation?.cancelled) || [];
  const activeTotal = activeItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const meetsAmount = activeTotal >= MINIMUM_ORDER_AMOUNT;
  const meetsCount = activeItems.length >= MINIMUM_ITEMS_COUNT;
  const meetsMinimum = meetsAmount && meetsCount;

  // אם עומד במינימום - לא להציג אזהרה
  if (meetsMinimum) {
    return null;
  }

  const amountDiff = MINIMUM_ORDER_AMOUNT - activeTotal;
  const countDiff = MINIMUM_ITEMS_COUNT - activeItems.length;

  return (
    <div className="bg-yellow-50 border-2 border-yellow-400 p-6">
      <div className="flex gap-4">
        <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-normal text-yellow-900 mb-2 text-lg">
            ⚠️ ההזמנה לא עומדת במינימום
          </h3>
          <div className="space-y-2 text-sm text-yellow-800">
            <p className="font-light">
              לאחר הביטולים, ההזמנה לא עומדת בדרישות המינימום:
            </p>
            <ul className="list-disc list-inside space-y-1 mr-4">
              {!meetsAmount && (
                <li>
                  <span className="font-normal">חסרים {amountDiff} ₪</span> (נדרש מינימום {MINIMUM_ORDER_AMOUNT} ₪, יש {activeTotal} ₪)
                </li>
              )}
              {!meetsCount && (
                <li>
                  <span className="font-normal">חסרים {countDiff} מוצרים</span> (נדרש מינימום {MINIMUM_ITEMS_COUNT} מוצרים, יש {activeItems.length})
                </li>
              )}
            </ul>
            <div className="mt-4 pt-4 border-t border-yellow-300">
              <p className="font-normal text-yellow-900 mb-2">מה לעשות?</p>
              <ol className="list-decimal list-inside space-y-1 mr-4 font-light">
                <li>צור קשר עם הלקוח לאישור המשך ההזמנה</li>
                <li>הצע ללקוח להוסיף מוצרים נוספים</li>
                <li>או בטל את ההזמנה כולה</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
