/**
 * Status History Accordion
 * Expandable/collapsible status history display
 *
 * Used for:
 * - Item status history (statusHistory array)
 * - Order timeline (timeline array)
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { ITEM_STATUS_LABELS } from '@/lib/constants/itemStatuses';

export default function StatusHistoryAccordion({
  title = "היסטוריית סטטוסים",
  history = [],
  type = "item", // "item" or "order"
  defaultOpen = false
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (!history || history.length === 0) {
    return null;
  }

  return (
    <div className="border border-neutral-200 mt-3">
      {/* Header - Clickable */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 flex items-center justify-between bg-neutral-50 hover:bg-neutral-100 transition-colors text-right"
      >
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-neutral-600" />
          <span className="text-sm font-normal text-neutral-700">{title}</span>
          <span className="text-xs font-light text-neutral-500">
            ({history.length} {history.length === 1 ? 'עדכון' : 'עדכונים'})
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-neutral-600" />
        ) : (
          <ChevronDown className="h-4 w-4 text-neutral-600" />
        )}
      </button>

      {/* Content - Expandable */}
      {isOpen && (
        <div className="px-4 py-3 bg-white max-h-64 overflow-y-auto">
          <div className="space-y-2">
            {history.map((entry, index) => (
              <div
                key={entry._id || index}
                className="flex items-start gap-3 pb-2 border-b border-neutral-100 last:border-0"
              >
                {/* Timeline dot */}
                <div className="flex flex-col items-center mt-1">
                  <div className="w-2 h-2 bg-neutral-400 rounded-full"></div>
                  {index < history.length - 1 && (
                    <div className="w-px h-full bg-neutral-200 my-0.5"></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {type === "item" ? (
                    // Item status history
                    <>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-normal text-neutral-900">
                          {ITEM_STATUS_LABELS[entry.status] || entry.status}
                        </span>
                        {entry.notes && (
                          <span className="text-xs font-light text-neutral-600">
                            • {entry.notes}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-light text-neutral-500 mt-0.5">
                        {new Date(entry.changedAt).toLocaleString('he-IL')}
                        {entry.changedBy && (
                          <span className="mr-2">
                            • {entry.changedBy.firstName} {entry.changedBy.lastName}
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    // Order timeline
                    <>
                      <p className="text-sm font-normal text-neutral-900">
                        {entry.message}
                      </p>
                      <p className="text-xs font-light text-neutral-500 mt-0.5">
                        {new Date(entry.timestamp).toLocaleString('he-IL')}
                      </p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
