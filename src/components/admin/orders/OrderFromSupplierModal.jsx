/**
 * Order From Supplier Modal
 *
 * מודל להזמנת פריט מספק
 */

'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import SafeText from '@/components/ui/SafeText';

export default function OrderFromSupplierModal({ item, onConfirm, onClose }) {
  const [formData, setFormData] = useState({
    supplierOrderNumber: '',
    supplierTrackingNumber: '',
    actualCost: item?.price || 0,
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onConfirm(formData);
      onClose();
    } catch (error) {
      console.error('Order from supplier error:', error);
      alert('שגיאה בהזמנה מספק');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-neutral-200 p-6 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-xl font-light tracking-wide">הזמנה מספק</h2>
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
            <div className="flex gap-4 mt-2 text-sm">
              <span className="text-neutral-600">
                מחיר: <span className="font-normal text-black">₪{item?.price}</span>
              </span>
              <span className="text-neutral-600">
                כמות: <span className="font-normal text-black">{item?.quantity}</span>
              </span>
            </div>
            {item?.supplierLink && (
              <a
                href={item.supplierLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm mt-2 inline-block"
              >
                🔗 פתח קישור ספק
              </a>
            )}
          </div>

          {/* Supplier Order Number */}
          <div>
            <label className="block text-sm font-light text-neutral-700 mb-2">
              מספר הזמנה של הספק
            </label>
            <input
              type="text"
              value={formData.supplierOrderNumber}
              onChange={(e) => setFormData({ ...formData, supplierOrderNumber: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 focus:border-black transition-colors outline-none text-sm"
              placeholder="לדוגמה: AMZ-123456789"
            />
            <p className="text-xs text-neutral-500 mt-1">
              מספר ההזמנה שקיבלת מהספק (אופציונלי)
            </p>
          </div>

          {/* Tracking Number */}
          <div>
            <label className="block text-sm font-light text-neutral-700 mb-2">
              מספר מעקב
            </label>
            <input
              type="text"
              value={formData.supplierTrackingNumber}
              onChange={(e) => setFormData({ ...formData, supplierTrackingNumber: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 focus:border-black transition-colors outline-none text-sm"
              placeholder="לדוגמה: 1Z999AA10123456784"
            />
            <p className="text-xs text-neutral-500 mt-1">
              מספר מעקב למשלוח (אופציונלי)
            </p>
          </div>

          {/* Actual Cost */}
          <div>
            <label className="block text-sm font-light text-neutral-700 mb-2">
              עלות בפועל
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={formData.actualCost || ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setFormData({
                    ...formData,
                    actualCost: isNaN(value) ? 0 : value
                  });
                }}
                className="w-full px-3 py-2 border border-neutral-300 focus:border-black transition-colors outline-none text-sm pr-8"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">
                ₪
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              המחיר בפועל ששילמת (אם שונה מהמחיר הצפוי)
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-light text-neutral-700 mb-2">
              הערות
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-neutral-300 focus:border-black transition-colors outline-none text-sm resize-none"
              placeholder="הערות נוספות (אופציונלי)"
            />
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
              disabled={isSubmitting}
            >
              {isSubmitting ? 'מזמין...' : 'הזמן מספק'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
