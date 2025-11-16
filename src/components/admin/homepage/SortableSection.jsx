import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GripVertical, Trash2, Eye, EyeOff, Settings } from 'lucide-react';

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
          <div className="space-y-0.5 sm:space-y-1 lg:space-y-1.5">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded h-10 sm:h-12 md:h-14 lg:h-16 xl:h-20 2xl:h-24 flex items-center justify-center text-white relative overflow-hidden">
              {hasDesktop ? (
                <img
                  src={heroImage.desktopImage.url}
                  alt="Desktop preview"
                  className="w-full h-full object-cover opacity-80"
                />
              ) : (
                <span className="text-xs xl:text-sm">🖥️ Desktop</span>
              )}
            </div>
            <div className="flex gap-1.5 text-[10px] sm:text-xs lg:text-sm text-gray-600">
              <span className={hasDesktop ? 'text-green-600 font-medium' : 'text-gray-400'}>
                {hasDesktop ? '✓ Desktop' : '✗ Desktop'}
              </span>
              <span className={hasMobile ? 'text-green-600 font-medium' : 'text-gray-400'}>
                {hasMobile ? '✓ Mobile' : '✗ Mobile'}
              </span>
            </div>
          </div>
        );
      case 'hero_banner':
        return (
          <div className="bg-gradient-to-r from-gray-700 to-gray-900 rounded h-10 sm:h-12 md:h-14 lg:h-16 xl:h-20 2xl:h-24 flex items-center justify-center text-white px-2">
            <span className="text-[10px] sm:text-xs md:text-sm lg:text-base truncate max-w-full">
              {section.content?.heroBanner?.text?.he?.title || 'Hero Banner'}
            </span>
          </div>
        );
      case 'category_grid':
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-0.5 sm:gap-1 md:gap-1.5 lg:gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 rounded h-6 sm:h-8 md:h-10 lg:h-12 xl:h-14"></div>
            ))}
          </div>
        );
      case 'product_carousel':
        return (
          <div className="flex gap-0.5 sm:gap-1 md:gap-1.5 lg:gap-2 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 rounded h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 xl:h-20 xl:w-20 flex-shrink-0"></div>
            ))}
          </div>
        );
      case 'promotional_banner':
        return (
          <div className="bg-gradient-to-r from-orange-400 to-pink-500 rounded h-8 sm:h-10 md:h-12 lg:h-14 xl:h-16 2xl:h-20 flex items-center justify-center text-white px-2">
            <span className="text-[10px] sm:text-xs md:text-sm lg:text-base truncate max-w-full">
              {section.content?.promotionalBanner?.text?.he?.headline || 'Promo Banner'}
            </span>
          </div>
        );
      default:
        return (
          <div className="bg-gray-100 rounded h-8 sm:h-10 md:h-12 lg:h-14 xl:h-16 flex items-center justify-center text-gray-400">
            <span className="text-[10px] sm:text-xs md:text-sm lg:text-base">{getSectionTypeLabel(section.type)}</span>
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
    <div ref={setNodeRef} style={style} className="mb-1 sm:mb-1.5 lg:mb-2">
      <Card
        className={`p-1 sm:p-1.5 md:p-2 lg:p-3 xl:p-4 cursor-pointer transition-all hover:shadow-md ${
          isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''
        } ${!section.isActive ? 'opacity-60' : ''}`}
        onClick={onClick}
      >
        <div className="flex items-start gap-1 sm:gap-1.5 lg:gap-2">
          {/* Drag Handle */}
          <button
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 mt-0.5 flex-shrink-0"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 lg:h-5 lg:w-5" />
          </button>

          {/* Preview */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-0.5 sm:gap-1 md:gap-1.5 lg:gap-2 mb-0.5 sm:mb-1 md:mb-1.5 lg:mb-2 flex-wrap">
              <Badge variant="outline" className="text-[9px] sm:text-[10px] lg:text-xs px-1 sm:px-1.5 lg:px-2 py-0 sm:py-0.5">{getSectionTypeLabel(section.type)}</Badge>
              {!section.isActive && (
                <Badge variant="secondary" className="text-[9px] sm:text-[10px] lg:text-xs px-1 sm:px-1.5 lg:px-2 py-0 sm:py-0.5">מושבת</Badge>
              )}
              {section.schedule?.enabled && (
                <Badge variant="secondary" className="text-[9px] sm:text-[10px] lg:text-xs px-1 sm:px-1.5 lg:px-2 py-0 sm:py-0.5">מתוזמן</Badge>
              )}
            </div>
            {getSectionPreview()}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-0.5 sm:gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 xl:h-9 xl:w-9"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
              title="ערוך"
            >
              <Settings className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 lg:h-4 lg:w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 xl:h-9 xl:w-9"
              onClick={(e) => {
                e.stopPropagation();
                // Toggle visibility - would need to call API here
              }}
              title={section.isActive ? 'השבת' : 'הפעל'}
            >
              {section.isActive ? (
                <Eye className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 lg:h-4 lg:w-4" />
              ) : (
                <EyeOff className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 lg:h-4 lg:w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 xl:h-9 xl:w-9 text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              title="מחק"
            >
              <Trash2 className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 lg:h-4 lg:w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
