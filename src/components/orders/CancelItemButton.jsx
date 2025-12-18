'use client';

import { useState } from 'react';
import { requestCancelItem } from '@/lib/api/orders';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { X, AlertCircle } from 'lucide-react';

/**
 * CancelItemButton Component
 *
 * מאפשר ללקוחות לבטל פריטים בודדים בהזמנה (רק אם סטטוס = pending)
 * Phase 4: Customer Cancellations
 *
 * @param {string} orderId - מזהה ההזמנה
 * @param {string} itemId - מזהה הפריט
 * @param {string} itemName - שם הפריט (להצגה)
 * @param {function} onCancelled - Callback כשהביטול מצליח
 */
export function CancelItemButton({ orderId, itemId, itemName, onCancelled }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleCancel = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await requestCancelItem(orderId, itemId, reason);

      // הצלחה
      console.log('✅ פריט בוטל בהצלחה:', result);
      setIsOpen(false);
      setReason(''); // נקה את השדה

      // קרא ל-callback אם קיים
      if (onCancelled) {
        onCancelled(result);
      }

      // הצג הודעת הצלחה
      alert(`הפריט "${itemName}" בוטל בהצלחה`);

    } catch (err) {
      console.error('❌ שגיאה בביטול פריט:', err);
      setError(err.message || 'שגיאה בביטול הפריט');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
      >
        <X className="w-4 h-4 ml-1" />
        בטל פריט
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent dir="rtl" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>ביטול פריט</DialogTitle>
            <DialogDescription>
              האם אתה בטוח שברצונך לבטל את הפריט <strong>&quot;{itemName}&quot;</strong>?
              <br />
              <span className="text-orange-600 font-medium">
                הפריט יבוטל והסכום לא יחויב.
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                סיבת הביטול (אופציונלי)
              </label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="למשל: מצאתי מוצר זול יותר, לא צריך יותר..."
                rows={3}
                disabled={isSubmitting}
                className="resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                הסיבה תעזור לנו לשפר את השירות
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">שגיאה</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                setError(null);
                setReason('');
              }}
              disabled={isSubmitting}
            >
              ביטול
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'מבטל...' : 'בטל פריט'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
