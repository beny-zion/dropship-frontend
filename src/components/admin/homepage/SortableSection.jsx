import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GripVertical, Trash2, Eye, EyeOff, Settings } from 'lucide-react';
import { toggleSectionVisibility } from '@/lib/api/homepage';

export default function SortableSection({ section, isSelected, onClick, onDelete, previewMode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getSectionTypeLabel = (type) => {
    const labels = {
      hero_image: 'Hero Image',
      hero_banner: 'Hero Banner',
      category_grid: 'Category Grid',
      product_carousel: 'Product Carousel',
      promotional_banner: 'Promotional Banner',
      custom_component: 'Custom Component',
      text_block: 'Text Block',
      video_section: 'Video Section'
    };
    return labels[type] || type;
  };

  const getSectionPreview = () => {
    switch (section.type) {
      case 'hero_image':
        const heroImage = section.content?.heroImage;
        const hasDesktop = heroImage?.desktopImage?.url;
        const hasMobile = heroImage?.mobileImage?.url;
        return (
          <div className="space-y-2">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded h-24 flex items-center justify-center text-white relative overflow-hidden">
              {hasDesktop ? (
                <img
                  src={heroImage.desktopImage.url}
                  alt="Desktop preview"
                  className="w-full h-full object-cover opacity-80"
                />
              ) : (
                <span className="text-sm">🖥️ Desktop Image</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <span>🖥️</span>
                <span className={hasDesktop ? 'text-green-600' : 'text-gray-400'}>
                  {hasDesktop ? '✓ Desktop' : 'ללא תמונה'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span>📱</span>
                <span className={hasMobile ? 'text-green-600' : 'text-gray-400'}>
                  {hasMobile ? '✓ Mobile' : 'ללא תמונה'}
                </span>
              </div>
            </div>
          </div>
        );
      case 'hero_banner':
        return (
          <div className="bg-gradient-to-r from-gray-700 to-gray-900 rounded h-32 flex items-center justify-center text-white">
            <span className="text-sm">
              {section.content?.heroBanner?.text?.he?.title || 'Hero Banner'}
            </span>
          </div>
        );
      case 'category_grid':
        return (
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 rounded h-16"></div>
            ))}
          </div>
        );
      case 'product_carousel':
        return (
          <div className="flex gap-2 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 rounded h-24 w-24 flex-shrink-0"></div>
            ))}
          </div>
        );
      case 'promotional_banner':
        return (
          <div className="bg-gradient-to-r from-orange-400 to-pink-500 rounded h-20 flex items-center justify-center text-white">
            <span className="text-sm">
              {section.content?.promotionalBanner?.text?.he?.headline || 'Promo Banner'}
            </span>
          </div>
        );
      default:
        return (
          <div className="bg-gray-100 rounded h-16 flex items-center justify-center text-gray-400">
            <span className="text-sm">{getSectionTypeLabel(section.type)}</span>
          </div>
        );
    }
  };

  if (previewMode) {
    return (
      <div ref={setNodeRef} className="mb-2">
        {getSectionPreview()}
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} className="mb-3">
      <Card
        className={`p-4 cursor-pointer transition-all hover:shadow-md ${
          isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''
        } ${!section.isActive ? 'opacity-60' : ''}`}
        onClick={onClick}
      >
        <div className="flex items-start gap-3">
          {/* Drag Handle */}
          <button
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 mt-1"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5" />
          </button>

          {/* Preview */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{getSectionTypeLabel(section.type)}</Badge>
              {!section.isActive && (
                <Badge variant="secondary">מושבת</Badge>
              )}
              {section.schedule?.enabled && (
                <Badge variant="secondary">מתוזמן</Badge>
              )}
            </div>
            {getSectionPreview()}
          </div>

          {/* Actions */}
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
              title="ערוך"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                // Toggle visibility - would need to call API here
              }}
              title={section.isActive ? 'השבת' : 'הפעל'}
            >
              {section.isActive ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-destructive hover:text-destructive"
              title="מחק"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
