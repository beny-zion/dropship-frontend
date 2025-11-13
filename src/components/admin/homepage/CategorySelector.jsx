import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, ImageIcon, GripVertical } from 'lucide-react';
import { useCategories } from '@/lib/hooks/useCategories';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Category Item
function SortableCategoryItem({ category, isSelected, onToggle, language = 'he' }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const name = category.name?.[language] || category.name?.he || '';
  const imageUrl = category.mainImage?.url || category.image?.url || '';

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onToggle(category._id)}
      className={`
        flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
        ${isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300 bg-white'
        }
        ${!category.isActive ? 'opacity-60' : ''}
      `}
    >
      {/* Drag Handle */}
      {isSelected && (
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 rounded"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>
      )}

      {/* Checkbox */}
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onToggle(category._id)}
        className="pointer-events-none"
      />

      {/* Category Image */}
      <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
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
          {name}
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
        </div>
      </div>
    </div>
  );
}

export default function CategorySelector({ selectedCategoryIds = [], onChange }) {
  const { categories, loading, error } = useCategories(false);
  const [orderedIds, setOrderedIds] = useState(selectedCategoryIds);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    setOrderedIds(selectedCategoryIds);
  }, [selectedCategoryIds]);

  // Filter out any IDs that don't exist in the categories list
  const validOrderedIds = orderedIds.filter(id =>
    categories.some(cat => cat._id === id)
  );

  // Update if we found invalid IDs - cleanup effect
  useEffect(() => {
    if (!loading && categories.length > 0 && validOrderedIds.length !== orderedIds.length) {
      setOrderedIds(validOrderedIds);
      onChange(validOrderedIds);
    }
  }, [categories, loading]);

  const handleToggle = (categoryId) => {
    const isCurrentlySelected = orderedIds.includes(categoryId);
    let newOrderedIds;

    if (isCurrentlySelected) {
      // Remove from selection
      newOrderedIds = orderedIds.filter(id => id !== categoryId);
    } else {
      // Add to selection at the end
      newOrderedIds = [...orderedIds, categoryId];
    }

    setOrderedIds(newOrderedIds);
    onChange(newOrderedIds);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = orderedIds.indexOf(active.id);
      const newIndex = orderedIds.indexOf(over.id);
      const newOrderedIds = arrayMove(orderedIds, oldIndex, newIndex);
      setOrderedIds(newOrderedIds);
      onChange(newOrderedIds);
    }
  };

  const handleSelectAll = () => {
    const allActiveIds = categories.filter(cat => cat.isActive).map(cat => cat._id);
    setOrderedIds(allActiveIds);
    onChange(allActiveIds);
  };

  const handleDeselectAll = () => {
    setOrderedIds([]);
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

  // Separate selected and unselected categories
  const selectedCategories = validOrderedIds
    .map(id => categories.find(cat => cat._id === id))
    .filter(Boolean);

  const unselectedCategories = categories.filter(
    cat => !validOrderedIds.includes(cat._id)
  );

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
          נבחרו: {validOrderedIds.length} מתוך {categories.length}
        </div>
      </div>

      {/* Selected Categories (Draggable) */}
      {selectedCategories.length > 0 && (
        <div>
          <Label className="text-xs text-blue-600 mb-2 block flex items-center gap-2">
            <span>קטגוריות נבחרות (גרור לשינוי סדר) ↓</span>
          </Label>
          <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded p-2 mb-2">
            💡 <strong>הסדר כאן = הסדר באתר!</strong> הקטגוריה הראשונה תופיע ראשונה למשתמשים.
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={validOrderedIds}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto border-2 border-blue-300 rounded-lg p-3 bg-blue-50/30">
                {selectedCategories.map((category, index) => (
                  <div key={category._id} className="relative">
                    {/* Order Number Badge */}
                    <div className="absolute -right-2 -top-2 bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center z-10 shadow-md">
                      {index + 1}
                    </div>
                    <SortableCategoryItem
                      category={category}
                      isSelected={true}
                      onToggle={handleToggle}
                    />
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Unselected Categories */}
      {unselectedCategories.length > 0 && (
        <div>
          <Label className="text-xs text-gray-600 mb-2 block">
            קטגוריות זמינות (לחץ לבחירה) ↓
          </Label>
          <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto border rounded-lg p-3">
            {unselectedCategories.map((category) => (
              <SortableCategoryItem
                key={category._id}
                category={category}
                isSelected={false}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
