/**
 * Update Status Modal with Notes
 *
 * מודל לעדכון סטטוס עם אפשרות להוסיף הערות
 */

'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { ITEM_STATUS, ITEM_STATUS_LABELS } from '@/lib/constants/itemStatuses';
// ✅ Import sanitization
import { sanitizeText } from '@/lib/utils/sanitize';
import SafeText from '@/components/ui/SafeText';

export default function UpdateStatusModal({ item, onConfirm, onClose }) {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get all statuses except 'pending' and 'cancelled'
  const allStatuses = Object.values(ITEM_STATUS).filter(
    status => status !== ITEM_STATUS.PENDING && status !== ITEM_STATUS.CANCELLED
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedStatus) {
      alert('נא לבחור סטטוס');
      return;
    }

    // ✅ Sanitize notes before submission
    const sanitizedNotes = sanitizeText(notes);

    // Validate length
    if (sanitizedNotes.length > 500) {
      alert('ההערות ארוכות מדי (מקסימום 500 תווים)');
      return;
    }

    setIsSubmitting(true);

    try {
      await onConfirm(selectedStatus, sanitizedNotes);
      onClose();
    } catch (error) {
      console.error('Status update error:', error);
      alert('שגיאה בעדכון הסטטוס');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-neutral-200 p-6 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-xl font-light tracking-wide">עדכון סטטוס פריט</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Item Info */}
          <div className="bg-neutral-50 p-4 border border-neutral-200">
            <p className="text-sm font-light text-neutral-600 mb-1">מוצר:</p>
            <SafeText as="p" className="font-normal">{item?.name}</SafeText>
            <p className="text-sm text-neutral-500 mt-1">
              סטטוס נוכחי: <span className="font-medium">{ITEM_STATUS_LABELS[item?.itemStatus]}</span>
            </p>
          </div>

          {/* Status Selector */}
          <div>
            <label className="block text-sm font-light text-neutral-700 mb-2">
              סטטוס חדש *
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              required
              className="w-full px-3 py-2 border border-neutral-300 focus:border-black transition-colors outline-none text-sm"
            >
              <option value="">בחר סטטוס...</option>
              {allStatuses.map((status) => (
                <option key={status} value={status}>
                  {ITEM_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-light text-neutral-700 mb-2">
              הערות (אופציונלי)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-neutral-300 focus:border-black transition-colors outline-none text-sm resize-none"
              placeholder="הוסף הערות על השינוי..."
            />
            <p className="text-xs text-neutral-500 mt-1">
              ההערות יישמרו בהיסטוריה ויהיו נראות לכל המנהלים
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-neutral-300 text-sm font-light tracking-wide hover:border-black transition-colors"
              disabled={isSubmitting}
            >
              ביטול
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-black text-white text-sm font-light tracking-wide hover:bg-neutral-800 transition-colors disabled:opacity-50"
              disabled={isSubmitting || !selectedStatus}
            >
              {isSubmitting ? 'מעדכן...' : 'עדכן סטטוס'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
