'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, X } from 'lucide-react';
import { useOrderStatuses } from '@/lib/hooks/useOrderStatuses';

export default function OrderFilters({ status, sortBy, onStatusChange, onSortChange, onReset }) {
  const hasFilters = status !== 'all' || sortBy !== '-createdAt';

  // Load dynamic statuses from server
  const { data: statusesData, isLoading: statusesLoading } = useOrderStatuses();
  const statuses = statusesData?.data || [];

  return (
    <div className="border border-neutral-200 p-6 bg-neutral-50">
      <div className="flex items-center gap-2 mb-6">
        <Filter className="h-4 w-4 text-neutral-600" />
        <h3 className="text-xs font-light tracking-widest uppercase text-neutral-600">סינון ומיון</h3>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-light tracking-wide text-neutral-700 mb-2 block">סטטוס</label>
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="כל הסטטוסים" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הסטטוסים</SelectItem>
              {statusesLoading ? (
                <SelectItem value="loading" disabled>טוען...</SelectItem>
              ) : (
                statuses.map((s) => (
                  <SelectItem key={s.key} value={s.key}>
                    {s.label_he}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-light tracking-wide text-neutral-700 mb-2 block">מיון</label>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-createdAt">📅 חדש ביותר</SelectItem>
              <SelectItem value="createdAt">📅 ישן ביותר</SelectItem>
              <SelectItem value="-totalAmount">💰 מחיר (גבוה לנמוך)</SelectItem>
              <SelectItem value="totalAmount">💰 מחיר (נמוך לגבוה)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasFilters && (
          <div className="flex items-end">
            <button
              onClick={onReset}
              className="w-full sm:w-auto px-4 py-2 border border-neutral-300 text-sm font-light tracking-wide hover:border-black transition-colors inline-flex items-center justify-center gap-2"
            >
              <X className="h-4 w-4" />
              איפוס
            </button>
          </div>
        )}
      </div>
    </div>
  );
}