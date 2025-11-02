'use client';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCategories } from '@/lib/hooks/useCategories';

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'חדשים ביותר' },
  { value: 'price_asc', label: 'מחיר: נמוך לגבוה' },
  { value: 'price_desc', label: 'מחיר: גבוה לנמוך' },
  { value: 'rating', label: 'דירוג הכי גבוה' },
  { value: 'popular', label: 'הכי פופולרי' },
];

export default function ProductFilters({
  filters,
  onFilterChange,
  onReset
}) {
  const { categories, loading: categoriesLoading } = useCategories(true); // Only active categories

  // Prepare categories list
  const categoryOptions = [
    { _id: 'all', name: { he: 'כל הקטגוריות' } },
    ...(categories || [])
  ];

  return (
    <div className="bg-white p-6 rounded-lg border space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">סינון וחיפוש</h3>
        <Button variant="ghost" size="sm" onClick={onReset}>
          נקה הכל
        </Button>
      </div>

      {/* קטגוריה */}
      <div className="space-y-2">
        <Label>קטגוריה</Label>
        <Select
          value={filters.category || 'all'}
          onValueChange={(value) => onFilterChange('category', value)}
          disabled={categoriesLoading}
        >
          <SelectTrigger>
            <SelectValue>
              {categoriesLoading
                ? 'טוען...'
                : categoryOptions.find(c => c._id === filters.category)?.name.he || 'בחר קטגוריה'
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((cat) => (
              <SelectItem key={cat._id} value={cat._id}>
                {cat.name.he}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* מיון */}
      <div className="space-y-2">
        <Label>מיון</Label>
        <Select
          value={filters.sort || '-createdAt'}
          onValueChange={(value) => onFilterChange('sort', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* טווח מחירים */}
      <div className="space-y-2">
        <Label>טווח מחירים (₪)</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="מינימום"
            value={filters.minPrice || ''}
            onChange={(e) => onFilterChange('minPrice', e.target.value)}
          />
          <Input
            type="number"
            placeholder="מקסימום"
            value={filters.maxPrice || ''}
            onChange={(e) => onFilterChange('maxPrice', e.target.value)}
          />
        </div>
      </div>

      {/* משלוח חינם */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="freeShipping"
          checked={filters.freeShipping || false}
          onChange={(e) => onFilterChange('freeShipping', e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="freeShipping" className="cursor-pointer">
          משלוח חינם בלבד
        </Label>
      </div>
    </div>
  );
}