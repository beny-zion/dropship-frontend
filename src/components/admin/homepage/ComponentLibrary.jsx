import { useState } from 'react';
import { createEmptySection } from '@/lib/api/homepage';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Image, Grid3x3, Package, Megaphone, Code, AlignLeft, Video, ImageIcon } from 'lucide-react';

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
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-1">ספריית קומפוננטות</h2>
        <p className="text-sm text-muted-foreground">
          גרור או לחץ להוספת section לדף
        </p>
      </div>

      <div className="space-y-3">
        {COMPONENT_TYPES.map((component) => {
          const Icon = component.icon;
          return (
            <Card
              key={component.type}
              className={`p-4 cursor-pointer transition-all hover:shadow-md border-2 ${
                hoveredType === component.type ? component.color : 'border-gray-200'
              }`}
              onMouseEnter={() => setHoveredType(component.type)}
              onMouseLeave={() => setHoveredType(null)}
              onClick={() => handleAddComponent(component.type)}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${component.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm mb-1">{component.name}</h3>
                  <p className="text-xs text-muted-foreground leading-tight">
                    {component.description}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-sm font-medium text-blue-900 mb-2">💡 טיפ</h3>
        <p className="text-xs text-blue-700 leading-relaxed">
          לחץ על component כדי להוסיף אותו לדף. לאחר מכן תוכל לערוך אותו בפאנל הימני.
        </p>
      </div>
    </div>
  );
}
