import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, ImageIcon } from 'lucide-react';
import { useCategories } from '@/lib/hooks/useCategories';

export default function CategorySelector({ selectedCategoryIds = [], onChange }) {
  const { categories, loading, error } = useCategories(false); // Get all categories (active + inactive)
  const [selected, setSelected] = useState(new Set(selectedCategoryIds));

  useEffect(() => {
    setSelected(new Set(selectedCategoryIds));
  }, [selectedCategoryIds]);

  const handleToggle = (categoryId) => {
    const newSelected = new Set(selected);
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId);
    } else {
      newSelected.add(categoryId);
    }
    setSelected(newSelected);
    onChange(Array.from(newSelected));
  };

  const handleSelectAll = () => {
    const allIds = categories.map(cat => cat._id);
    setSelected(new Set(allIds));
    onChange(allIds);
  };

  const handleDeselectAll = () => {
    setSelected(new Set());
    onChange([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-500 py-4">
        שגיאה בטעינת קטגוריות: {error}
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="text-sm text-gray-500 py-4">
        לא נמצאו קטגוריות במערכת
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSelectAll}
        >
          בחר הכל
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDeselectAll}
        >
          בטל הכל
        </Button>
        <div className="text-sm text-gray-500 flex items-center mr-auto">
          נבחרו: {selected.size} מתוך {categories.length}
        </div>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto border rounded-lg p-3">
        {categories.map((category) => {
          const isSelected = selected.has(category._id);

          return (
            <div
              key={category._id}
              onClick={() => handleToggle(category._id)}
              className={`
                flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
                ${isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
                }
                ${!category.isActive ? 'opacity-60' : ''}
              `}
            >
              {/* Checkbox */}
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => handleToggle(category._id)}
                className="pointer-events-none"
              />

              {/* Category Image */}
              <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                {category.mainImage?.url ? (
                  <img
                    src={category.mainImage.url}
                    alt={category.mainImage.alt || category.name.he}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Category Info */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {category.name.he}
                </div>
                {category.name.en && (
                  <div className="text-xs text-gray-500 truncate">
                    {category.name.en}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    category.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {category.isActive ? 'פעיל' : 'לא פעיל'}
                  </span>
                  {category.displayOrder !== undefined && (
                    <span className="text-xs text-gray-500">
                      סדר: {category.displayOrder}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
