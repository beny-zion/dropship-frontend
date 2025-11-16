import { useState } from 'react';
import { createEmptySection } from '@/lib/api/homepage';
import { Card } from '@/components/ui/card';
import { Image, Grid3x3, Package, Megaphone, Code, ImageIcon } from 'lucide-react';

const COMPONENT_TYPES = [
  {
    type: 'hero_image',
    name: 'Hero Image',
    icon: ImageIcon,
    description: 'תמונת Hero רספונסיבית (ללא טקסט)',
    color: 'bg-cyan-50 text-cyan-600 border-cyan-200'
  },
  {
    type: 'hero_banner',
    name: 'Hero Banner',
    icon: Image,
    description: 'תמונת רקע גדולה עם טקסט וכפתור',
    color: 'bg-blue-50 text-blue-600 border-blue-200'
  },
  {
    type: 'category_grid',
    name: 'Category Grid',
    icon: Grid3x3,
    description: 'גריד של קטגוריות',
    color: 'bg-purple-50 text-purple-600 border-purple-200'
  },
  {
    type: 'product_carousel',
    name: 'Product Carousel',
    icon: Package,
    description: 'קרוסלה של מוצרים',
    color: 'bg-green-50 text-green-600 border-green-200'
  },
  {
    type: 'promotional_banner',
    name: 'Promotional Banner',
    icon: Megaphone,
    description: 'באנר פרסומי עם תזמון',
    color: 'bg-orange-50 text-orange-600 border-orange-200'
  },
  {
    type: 'custom_component',
    name: 'Custom Component',
    icon: Code,
    description: 'HTML/CSS/JS מותאם אישית',
    color: 'bg-gray-50 text-gray-600 border-gray-200'
  }
];

export default function ComponentLibrary({ onAddSection }) {
  const [hoveredType, setHoveredType] = useState(null);

  const handleAddComponent = (type) => {
    const template = createEmptySection(type);
    onAddSection(template);
  };

  return (
    <div className="p-1.5 sm:p-2 md:p-2.5 lg:p-3 xl:p-4">
      <div className="mb-1.5 sm:mb-2 md:mb-2.5 lg:mb-3">
        <h2 className="text-[10px] sm:text-xs lg:text-sm xl:text-base font-semibold mb-0.5">קומפוננטות</h2>
        <p className="text-[9px] sm:text-[10px] lg:text-xs text-muted-foreground">
          לחץ להוספה
        </p>
      </div>

      <div className="space-y-1 sm:space-y-1.5 lg:space-y-2">
        {COMPONENT_TYPES.map((component) => {
          const Icon = component.icon;
          return (
            <Card
              key={component.type}
              className={`p-1 sm:p-1.5 lg:p-2 xl:p-2.5 cursor-pointer transition-all hover:shadow-md border ${
                hoveredType === component.type ? component.color : 'border-gray-200'
              }`}
              onMouseEnter={() => setHoveredType(component.type)}
              onMouseLeave={() => setHoveredType(null)}
              onClick={() => handleAddComponent(component.type)}
            >
              <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2">
                <div className={`p-0.5 sm:p-1 lg:p-1.5 rounded ${component.color}`}>
                  <Icon className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5 xl:h-4 xl:w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-[9px] sm:text-[10px] md:text-xs xl:text-sm truncate">{component.name}</h3>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-1.5 sm:mt-2 md:mt-2.5 lg:mt-3 p-1 sm:p-1.5 lg:p-2 bg-blue-50 rounded border border-blue-200">
        <p className="text-[9px] sm:text-[10px] lg:text-xs text-blue-700 leading-tight">
          💡 לחץ על קומפוננטה
        </p>
      </div>
    </div>
  );
}
