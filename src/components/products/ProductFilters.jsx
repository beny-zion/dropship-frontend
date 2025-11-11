'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCategories } from '@/lib/hooks/useCategories';
import { useTags } from '@/lib/hooks/useTags';
import { Tag, ChevronDown, ChevronUp, SlidersHorizontal, X } from 'lucide-react';

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'חדשים ביותר' },
  { value: 'price_asc', label: 'מחיר: נמוך לגבוה' },
  { value: 'price_desc', label: 'מחיר: גבוה לנמוך' },
  { value: 'rating', label: 'דירוג הכי גבוה' },
  { value: 'popular', label: 'הכי פופולרי' },
];

// Collapsible Section Component
function CollapsibleSection({ title, icon: Icon, children, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-neutral-200 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-right hover:text-black transition-colors group"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="h-5 w-5 text-neutral-600 group-hover:text-black transition-colors" />}
          <h4 className="text-sm font-medium tracking-wide text-neutral-800">{title}</h4>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-neutral-500 group-hover:text-black transition-all" />
        ) : (
          <ChevronDown className="h-4 w-4 text-neutral-500 group-hover:text-black transition-all" />
        )}
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[2000px] opacity-100 pb-5' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-1">{children}</div>
      </div>
    </div>
  );
}

export default function ProductFilters({
  filters,
  onFilterChange,
  onReset
}) {
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { categories, loading: categoriesLoading } = useCategories(true); // Only active categories
  const { tags, loading: tagsLoading } = useTags(15); // Get top 15 tags

  const handleCategoryChange = (categoryId) => {
    if (categoryId === 'all') {
      // Navigate to all products page
      router.push('/products');
    } else {
      // Find the category to get its slug
      const category = categories?.find(c => c._id === categoryId);
      if (category?.slug) {
        // Navigate to the category page
        router.push(`/categories/${category.slug}`);
      }
    }
  };

  // Prepare categories list
  const categoryOptions = [
    { _id: 'all', name: { he: 'כל הקטגוריות' } },
    ...(categories || [])
  ];

  // Check if any filters are active
  const hasActiveFilters =
    filters.category !== 'all' ||
    filters.search ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.tags ||
    filters.freeShipping;

  return (
    <>
      {/* Mobile Filter Toggle Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-neutral-300 hover:border-neutral-400 transition-colors"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5" />
            <span className="text-sm font-medium tracking-wide">סינון וחיפוש</span>
            {hasActiveFilters && (
              <span className="bg-black text-white text-xs px-2 py-0.5 rounded-full">
                פעיל
              </span>
            )}
          </div>
          {isMobileOpen ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Filters Container */}
      <div className={`
        bg-white border border-neutral-200
        transition-all duration-300 ease-in-out
        ${isMobileOpen ? 'block' : 'hidden'} lg:block
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 bg-neutral-50">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-neutral-700" />
            <h3 className="text-base font-semibold tracking-wide text-neutral-800">סינון מתקדם</h3>
          </div>
          {hasActiveFilters && (
            <button
              onClick={() => {
                onReset();
                setIsMobileOpen(false);
              }}
              className="flex items-center gap-1 text-xs font-medium tracking-wide text-red-600 hover:text-red-700 transition-colors group"
            >
              <X className="h-4 w-4 group-hover:rotate-90 transition-transform duration-200" />
              <span>נקה הכל</span>
            </button>
          )}
        </div>

        {/* Filter Sections */}
        <div className="divide-y divide-neutral-200">
          {/* קטגוריות */}
          <CollapsibleSection title="קטגוריות מוצרים" defaultOpen={true}>
            <div className="space-y-1">
              {categoriesLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-8 bg-neutral-100 animate-pulse rounded" />
                  ))}
                </div>
              ) : (
                <>
                  {/* All Categories */}
                  <button
                    onClick={() => router.push('/products')}
                    className="w-full text-right px-4 py-2.5 text-sm font-light tracking-wide transition-all hover:bg-neutral-50 text-neutral-700 hover:text-black rounded"
                  >
                    כל המוצרים
                  </button>

                  {/* Individual Categories */}
                  {categories?.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => router.push(`/categories/${cat.slug}`)}
                      className="w-full text-right px-4 py-2.5 text-sm font-light tracking-wide transition-all hover:bg-neutral-50 text-neutral-700 hover:text-black rounded group"
                    >
                      <div className="flex items-center justify-between">
                        <span>{cat.name?.he || cat.name?.en}</span>
                        {cat.productCount > 0 && (
                          <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full group-hover:bg-neutral-200">
                            {cat.productCount}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          </CollapsibleSection>

          {/* תגים פופולריים */}
          <CollapsibleSection title="תגים פופולריים" icon={Tag} defaultOpen={true}>
            <div className="space-y-3">
              {tagsLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-8 bg-neutral-100 animate-pulse rounded" />
                  ))}
                </div>
              ) : tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tagObj) => {
                    const isSelected = filters.tags?.includes(tagObj.tag);
                    return (
                      <button
                        key={tagObj.tag}
                        onClick={() => {
                          const currentTags = filters.tags ? filters.tags.split(',') : [];
                          let newTags;
                          if (isSelected) {
                            newTags = currentTags.filter(t => t !== tagObj.tag);
                          } else {
                            newTags = [...currentTags, tagObj.tag];
                          }
                          onFilterChange('tags', newTags.length > 0 ? newTags.join(',') : '');
                        }}
                        className={`px-3 py-1.5 text-xs font-medium tracking-wide rounded-full transition-all ${
                          isSelected
                            ? 'bg-black text-white shadow-md'
                            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                        }`}
                      >
                        {tagObj.tag} <span className="opacity-70">({tagObj.count})</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-neutral-400 font-light text-center py-3">אין תגים זמינים</p>
              )}
            </div>
          </CollapsibleSection>

          {/* מיון */}
          <CollapsibleSection title="מיון תוצאות" defaultOpen={true}>
            <div className="space-y-3">
              <Select
                value={filters.sort || '-createdAt'}
                onValueChange={(value) => onFilterChange('sort', value)}
              >
                <SelectTrigger className="border-neutral-300 font-light text-sm hover:border-neutral-400 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="font-light text-sm">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CollapsibleSection>

          {/* טווח מחירים */}
          <CollapsibleSection title="טווח מחירים" defaultOpen={true}>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-500 mb-1 block">מינימום (₪)</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.minPrice || ''}
                    onChange={(e) => onFilterChange('minPrice', e.target.value)}
                    className="border-neutral-300 font-light text-sm hover:border-neutral-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-500 mb-1 block">מקסימום (₪)</label>
                  <Input
                    type="number"
                    placeholder="∞"
                    value={filters.maxPrice || ''}
                    onChange={(e) => onFilterChange('maxPrice', e.target.value)}
                    className="border-neutral-300 font-light text-sm hover:border-neutral-400 transition-colors"
                  />
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* אפשרויות נוספות */}
          <CollapsibleSection title="אפשרויות נוספות" defaultOpen={false}>
            <div className="space-y-4">
              {/* משלוח חינם */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  id="freeShipping"
                  checked={filters.freeShipping || false}
                  onChange={(e) => onFilterChange('freeShipping', e.target.checked)}
                  className="h-5 w-5 border-neutral-300 rounded text-black focus:ring-black cursor-pointer"
                />
                <span className="text-sm font-light tracking-wide text-neutral-700 group-hover:text-black transition-colors">
                  משלוח חינם בלבד
                </span>
              </label>

              {/* במבצע */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  id="onSale"
                  checked={filters.onSale || false}
                  onChange={(e) => onFilterChange('onSale', e.target.checked)}
                  className="h-5 w-5 border-neutral-300 rounded text-black focus:ring-black cursor-pointer"
                />
                <span className="text-sm font-light tracking-wide text-neutral-700 group-hover:text-black transition-colors">
                  מוצרים במבצע
                </span>
              </label>

              {/* זמין במלאי */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  id="inStock"
                  checked={filters.inStock || false}
                  onChange={(e) => onFilterChange('inStock', e.target.checked)}
                  className="h-5 w-5 border-neutral-300 rounded text-black focus:ring-black cursor-pointer"
                />
                <span className="text-sm font-light tracking-wide text-neutral-700 group-hover:text-black transition-colors">
                  זמין במלאי
                </span>
              </label>
            </div>
          </CollapsibleSection>
        </div>

        {/* Apply Filters Button (Mobile) */}
        <div className="lg:hidden p-4 border-t border-neutral-200 bg-neutral-50">
          <button
            onClick={() => setIsMobileOpen(false)}
            className="w-full bg-black text-white py-3 px-4 text-sm font-medium tracking-wide hover:bg-neutral-800 transition-colors"
          >
            הצג תוצאות
          </button>
        </div>
      </div>
    </>
  );
}