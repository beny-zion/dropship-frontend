/**
 * Cancel Item Modal
 *
 * מודל לביטול פריט
 */

'use client';

import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import SafeText from '@/components/ui/SafeText';

const CANCEL_REASONS = [
  'המוצר אזל במלאי אצל הספק',
  'המחיר עלה משמעותית',
  'ספק לא זמין',
  'בעיית איכות במוצר',
  'בקשת לקוח',
  'אחר'
];

export default function CancelItemModal({ item, onConfirm, onClose }) {
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const refundAmount = item ? item.price * item.quantity : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalReason = reason === 'אחר' ? customReason : reason;

    if (!finalReason.trim()) {
      alert('נא לבחור או להזין סיבה לביטול');
      return;
    }

    setIsSubmitting(true);

    try {
      await onConfirm(finalReason);
      onClose();
    } catch (error) {
      console.error('Cancel item error:', error);
      alert('שגיאה בביטול פריט');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white max-w-lg w-full">
        {/* Header */}
        <div className="border-b border-neutral-200 p-6 flex items-center justify-between">
          <h2 className="text-xl font-light tracking-wide">ביטול פריט</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 p-4 flex gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-normal text-yellow-900 mb-1">שים לב:</p>
              <p className="text-yellow-700 font-light">
                ביטול הפריט יגרום להחזר כספי ללקוח ועלול להשפיע על עמידה במינימום הזמנה.
              </p>
            </div>
          </div>

          {/* Item Info */}
          <div className="bg-neutral-50 p-4 border border-neutral-200">
            <p className="text-sm font-light text-neutral-600 mb-1">מוצר:</p>
            <SafeText as="p" className="font-normal">{item?.name}</SafeText>
            <div className="flex gap-4 mt-2 text-sm">
              <span className="text-neutral-600">
                מחיר: <span className="font-normal text-black">₪{item?.price}</span>
              </span>
              <span className="text-neutral-600">
                כמות: <span className="font-normal text-black">{item?.quantity}</span>
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-neutral-300">
              <span className="text-sm text-neutral-600">
                סכום החזר: <span className="font-normal text-red-600 text-base">₪{refundAmount}</span>
              </span>
            </div>
          </div>

          {/* Reason Selection */}
          <div>
            <label className="block text-sm font-light text-neutral-700 mb-2">
              סיבת ביטול <span className="text-red-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 focus:border-black transition-colors outline-none text-sm"
              required
            >
              <option value="">בחר סיבה...</option>
              {CANCEL_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Reason */}
          {reason === 'אחר' && (
            <div>
              <label className="block text-sm font-light text-neutral-700 mb-2">
                פירוט הסיבה <span className="text-red-500">*</span>
              </label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-neutral-300 focus:border-black transition-colors outline-none text-sm resize-none"
                placeholder="הזן את סיבת הביטול..."
                required
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-neutral-300 text-sm font-light tracking-wide hover:border-black transition-colors"
              disabled={isSubmitting}
            >
              חזור
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-red-600 text-white text-sm font-light tracking-wide hover:bg-red-700 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'מבטל...' : 'בטל פריט'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
