/**
 * Manual Status Override Modal
 * Phase 9.3: נעילת סטטוס למקרים חריגים
 *
 * שימוש: כשצריך לנעול סטטוס ידנית כדי שהאוטומציה לא תדרוס
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ITEM_STATUS_LABELS } from '@/lib/constants/itemStatuses';
import { Lock, Unlock, AlertTriangle } from 'lucide-react';

export default function ManualStatusOverrideModal({
  item,
  onClose,
  onConfirm,
  isLoading = false
}) {
  const [selectedStatus, setSelectedStatus] = useState(item.itemStatus);
  const [reason, setReason] = useState('');
  const [action, setAction] = useState(item.manualStatusOverride ? 'unlock' : 'lock');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (action === 'unlock') {
      onConfirm({ clearOverride: true });
    } else {
      if (!reason.trim()) {
        alert('נא להזין סיבה לנעילת הסטטוס');
        return;
      }
      onConfirm({
        status: selectedStatus,
        reason: reason.trim()
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white max-w-md w-full shadow-lg">
        <div className="p-6 border-b border-neutral-200">
          <h2 className="text-xl font-normal tracking-wide flex items-center gap-2">
            {action === 'lock' ? (
              <>
                <Lock className="h-5 w-5" />
                נעילת סטטוס ידנית
              </>
            ) : (
              <>
                <Unlock className="h-5 w-5" />
                שחרור נעילה
              </>
            )}
          </h2>
          <p className="text-sm font-light text-neutral-600 mt-2">
            פריט: {item.name}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Toggle between lock/unlock */}
          {item.manualStatusOverride && (
            <div className="bg-amber-50 border border-amber-200 p-3 text-sm">
              <p className="flex items-center gap-2 text-amber-800">
                <Lock className="h-4 w-4" />
                <strong>הפריט נעול כרגע</strong>
              </p>
              <p className="text-amber-700 mt-1 text-xs font-light">
                האוטומציה לא משנה את הסטטוס של פריט זה
              </p>
              <div className="mt-3 flex gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="action"
                    value="unlock"
                    checked={action === 'unlock'}
                    onChange={() => setAction('unlock')}
                  />
                  <span className="text-sm">שחרר נעילה</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="action"
                    value="lock"
                    checked={action === 'lock'}
                    onChange={() => setAction('lock')}
                  />
                  <span className="text-sm">עדכן סטטוס + שמור נעילה</span>
                </label>
              </div>
            </div>
          )}

          {action === 'lock' && (
            <>
              {/* Status Selector */}
              <div>
                <label className="block text-sm font-normal mb-2">
                  סטטוס חדש
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 text-sm font-light focus:border-black transition-colors outline-none"
                  required
                >
                  {Object.entries(ITEM_STATUS_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-normal mb-2">
                  סיבה לנעילה <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="למשל: לקוח אישר קבלה בטלפון, ספק שלח ללא tracking, החלטה עסקית..."
                  className="w-full px-3 py-2 border border-neutral-300 text-sm font-light focus:border-black transition-colors outline-none resize-none"
                  rows={3}
                  required
                />
                <p className="text-xs font-light text-neutral-500 mt-1">
                  הסיבה תירשם ב-timeline הפנימי
                </p>
              </div>

              {/* Warning */}
              <div className="bg-orange-50 border border-orange-200 p-3 text-xs">
                <p className="flex items-start gap-2 text-orange-800">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>שים לב:</strong> לאחר הנעילה, האוטומציה לא תשנה את הסטטוס של הפריט.
                    השתמש בזה רק במקרים חריגים (לקוח אישר בטלפון, החלטה עסקית וכו').
                  </span>
                </p>
              </div>
            </>
          )}

          {action === 'unlock' && (
            <div className="bg-blue-50 border border-blue-200 p-3 text-sm">
              <p className="text-blue-800">
                שחרור הנעילה יאפשר לאוטומציה לעדכן את הסטטוס של הפריט שוב.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'מבצע...' : action === 'lock' ? 'נעל סטטוס' : 'שחרר נעילה'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              ביטול
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
