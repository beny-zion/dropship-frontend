/**
 * Item History Modal
 *
 * מודל להצגת היסטוריית סטטוסים של פריט
 */

'use client';

import { X, Clock } from 'lucide-react';
import { ITEM_STATUS_LABELS } from '@/lib/constants/itemStatuses';

export default function ItemHistoryModal({ item, onClose }) {
  const history = item.statusHistory || [];

  // Sort by date descending (newest first)
  const sortedHistory = [...history].sort((a, b) =>
    new Date(b.changedAt) - new Date(a.changedAt)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-neutral-200 p-6 flex items-center justify-between sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-light tracking-wide">היסטוריית פריט</h2>
            <p className="text-sm text-gray-600 mt-1">{item.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {sortedHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>אין היסטוריה זמינה</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedHistory.map((entry, index) => (
                <div
                  key={entry._id || index}
                  className="border-r-4 border-blue-500 bg-gray-50 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                          {ITEM_STATUS_LABELS[entry.status] || entry.status}
                        </span>
                        {index === 0 && (
                          <span className="text-xs text-gray-500">(נוכחי)</span>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mt-2">
                        {new Date(entry.changedAt).toLocaleString('he-IL', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>

                      {entry.notes && (
                        <p className="text-sm text-gray-700 mt-2 bg-yellow-50 border-r-2 border-yellow-400 pr-3 py-2">
                          💬 {entry.notes}
                        </p>
                      )}

                      {entry.changedBy && (
                        <p className="text-xs text-gray-400 mt-1">
                          עודכן על ידי: {
                            entry.changedBy.firstName && entry.changedBy.lastName
                              ? `${entry.changedBy.firstName} ${entry.changedBy.lastName}`
                              : entry.changedBy.email || 'מנהל מערכת'
                          }
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 p-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 border border-neutral-300 text-sm font-light tracking-wide hover:border-black transition-colors"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
}
