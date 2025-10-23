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

export default function OrderFilters({ status, sortBy, onStatusChange, onSortChange, onReset }) {
  const hasFilters = status !== 'all' || sortBy !== '-createdAt';

  return (
    <div className="bg-muted/50 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-4 w-4" />
        <h3 className="font-semibold">סינון והזמנות</h3>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium mb-2 block">סטטוס</label>
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="כל הסטטוסים" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הסטטוסים</SelectItem>
              <SelectItem value="pending">⏳ ממתין לטיפול</SelectItem>
              <SelectItem value="processing">🔄 בטיפול</SelectItem>
              <SelectItem value="shipped">📦 נשלח</SelectItem>
              <SelectItem value="delivered">✅ נמסר</SelectItem>
              <SelectItem value="cancelled">❌ בוטל</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium mb-2 block">מיון</label>
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
            <Button
              variant="outline"
              onClick={onReset}
              className="w-full sm:w-auto"
            >
              <X className="h-4 w-4 mr-2" />
              איפוס
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}