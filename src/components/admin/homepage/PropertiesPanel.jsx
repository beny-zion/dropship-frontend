import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { X, Save } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CategorySelector from './CategorySelector';
import ImageUpload from './ImageUpload';

export default function PropertiesPanel({ section, onUpdate, onClose }) {
  const [editedSection, setEditedSection] = useState(section);
  const [saving, setSaving] = useState(false);

  // Update local state when section prop changes
  useEffect(() => {
    setEditedSection(section);
  }, [section]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await onUpdate(editedSection);
      // Don't close automatically - let user see the success message
    } catch (err) {
      // Error is handled in parent component
    } finally {
      setSaving(false);
    }
  };

  const updateContent = (path, value) => {
    const pathParts = path.split('.');
    const newSection = { ...editedSection };
    let current = newSection;

    for (let i = 0; i < pathParts.length - 1; i++) {
      if (!current[pathParts[i]]) {
        current[pathParts[i]] = {};
      }
      current = current[pathParts[i]];
    }

    current[pathParts[pathParts.length - 1]] = value;
    setEditedSection(newSection);
  };

  const renderHeroBannerEditor = () => {
    const heroBanner = editedSection.content?.heroBanner || {};
    const heText = heroBanner.text?.he || {};
    const enText = heroBanner.text?.en || {};

    return (
      <div className="space-y-4 sm:space-y-6">
        {/* GUESS Typography Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3 text-xs sm:text-sm text-blue-800" dir="rtl">
          <p className="font-semibold mb-1">💡 סגנון טיפוגרפיה GUESS</p>
          <p className="text-xs">הטקסטים מעוצבים אוטומטית בסגנון GUESS עם פונטים דינמיים ו-letter-spacing מותאם</p>
        </div>

        <Tabs defaultValue="he" dir="rtl">
          <TabsList className="grid w-full grid-cols-2 text-xs sm:text-sm">
            <TabsTrigger value="he">עברית</TabsTrigger>
            <TabsTrigger value="en">English</TabsTrigger>
          </TabsList>

          <TabsContent value="he" className="space-y-4">
            <div>
              <Label>כותרת</Label>
              <Input
                value={heText.title || ''}
                onChange={(e) => updateContent('content.heroBanner.text.he.title', e.target.value)}
                placeholder="כותרת ראשית"
              />
            </div>
            <div>
              <Label>כותרת משנה</Label>
              <Textarea
                value={heText.subtitle || ''}
                onChange={(e) => updateContent('content.heroBanner.text.he.subtitle', e.target.value)}
                placeholder="טקסט משני"
                rows={3}
              />
            </div>
            <div>
              <Label>טקסט כפתור</Label>
              <Input
                value={heText.ctaText || ''}
                onChange={(e) => updateContent('content.heroBanner.text.he.ctaText', e.target.value)}
                placeholder="לחץ כאן"
              />
            </div>
          </TabsContent>

          <TabsContent value="en" className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={enText.title || ''}
                onChange={(e) => updateContent('content.heroBanner.text.en.title', e.target.value)}
                placeholder="Main Title"
              />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Textarea
                value={enText.subtitle || ''}
                onChange={(e) => updateContent('content.heroBanner.text.en.subtitle', e.target.value)}
                placeholder="Secondary Text"
                rows={3}
              />
            </div>
            <div>
              <Label>CTA Text</Label>
              <Input
                value={enText.ctaText || ''}
                onChange={(e) => updateContent('content.heroBanner.text.en.ctaText', e.target.value)}
                placeholder="Click Here"
              />
            </div>
          </TabsContent>
        </Tabs>

        <Separator />

        <div className="space-y-4">
          <h3 className="font-medium">תמונות</h3>

          <ImageUpload
            label="תמונה Desktop"
            value={heroBanner.images?.[0]?.desktop?.url || ''}
            onChange={(url) => {
              const newImages = [...(heroBanner.images || [{ desktop: {}, mobile: {} }])];
              if (!newImages[0]) newImages[0] = { desktop: {}, mobile: {} };
              newImages[0].desktop = { ...newImages[0].desktop, url };
              updateContent('content.heroBanner.images', newImages);
            }}
            recommendedSize="תמונה רחבה למסכי Desktop"
            isHero={true}
          />

          <ImageUpload
            label="תמונה Mobile"
            value={heroBanner.images?.[0]?.mobile?.url || ''}
            onChange={(url) => {
              const newImages = [...(heroBanner.images || [{ desktop: {}, mobile: {} }])];
              if (!newImages[0]) newImages[0] = { desktop: {}, mobile: {} };
              newImages[0].mobile = { ...newImages[0].mobile, url };
              updateContent('content.heroBanner.images', newImages);
            }}
            recommendedSize="תמונה אנכית למסכי Mobile"
            isHero={true}
          />

          <div>
            <Label>קישור</Label>
            <Input
              value={heroBanner.images?.[0]?.link || ''}
              onChange={(e) => {
                const newImages = [...(heroBanner.images || [{ desktop: {}, mobile: {} }])];
                if (!newImages[0]) newImages[0] = { desktop: {}, mobile: {} };
                newImages[0].link = e.target.value;
                updateContent('content.heroBanner.images', newImages);
              }}
              placeholder="/products"
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="font-medium">עיצוב</h3>
          <div>
            <Label>גובה</Label>
            <Input
              value={heroBanner.styling?.height || '600px'}
              onChange={(e) => updateContent('content.heroBanner.styling.height', e.target.value)}
              placeholder="600px"
            />
          </div>
          <div>
            <Label>צבע טקסט</Label>
            <Input
              type="color"
              value={heroBanner.styling?.textColor || '#ffffff'}
              onChange={(e) => updateContent('content.heroBanner.styling.textColor', e.target.value)}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderCategoryGridEditor = () => {
    const categoryGrid = editedSection.content?.categoryGrid || {};
    const displayMode = categoryGrid.displayMode || 'all';

    return (
      <div className="space-y-4 sm:space-y-6">
        {/* GUESS Typography Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3 text-xs sm:text-sm text-blue-800" dir="rtl">
          <p className="font-semibold mb-1">💡 סגנון עיצוב מחודש</p>
          <p className="text-xs">הקטגוריות מוצגות בגריד 2 עמודות עם כרטיסים יפים בסגנון GUESS. הכותרת והטקסט מעוצבים אוטומטית.</p>
        </div>

        <Tabs defaultValue="he" dir="rtl">
          <TabsList className="grid w-full grid-cols-2 text-xs sm:text-sm">
            <TabsTrigger value="he">עברית</TabsTrigger>
            <TabsTrigger value="en">English</TabsTrigger>
          </TabsList>

          <TabsContent value="he" className="space-y-4">
            <div>
              <Label>כותרת</Label>
              <Input
                value={categoryGrid.title?.he || ''}
                onChange={(e) => updateContent('content.categoryGrid.title.he', e.target.value)}
                placeholder="קטגוריות מובילות"
              />
            </div>
          </TabsContent>

          <TabsContent value="en" className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={categoryGrid.title?.en || ''}
                onChange={(e) => updateContent('content.categoryGrid.title.en', e.target.value)}
                placeholder="Top Categories"
              />
            </div>
          </TabsContent>
        </Tabs>

        <Separator />

        <div className="space-y-4">
          <h3 className="font-medium">הגדרות תצוגה</h3>

          {/* Display Mode Selector */}
          <div>
            <Label>מצב תצוגה</Label>
            <select
              className="w-full border rounded-md p-2 mt-1"
              value={displayMode}
              onChange={(e) => updateContent('content.categoryGrid.displayMode', e.target.value)}
            >
              <option value="all">כל הקטגוריות הפעילות</option>
              <option value="selected">קטגוריות נבחרות</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {displayMode === 'all'
                ? 'יציג את כל הקטגוריות הפעילות במערכת'
                : 'בחר קטגוריות ספציפיות להצגה - סדר הבחירה הוא סדר התצוגה'
              }
            </p>
          </div>

          {/* Category Selector - Only show when displayMode is 'selected' */}
          {displayMode === 'selected' && (
            <div>
              <Label className="mb-2 block">בחירת קטגוריות</Label>
              <CategorySelector
                selectedCategoryIds={categoryGrid.categories || []}
                onChange={(selectedIds) => updateContent('content.categoryGrid.categories', selectedIds)}
              />
              {/* Selected Count Indicator */}
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">
                    קטגוריות שיוצגו למשתמשים:
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    {categoryGrid.categories?.length || 0}
                  </span>
                </div>
                <p className="text-xs text-blue-700 mt-1">
                  {categoryGrid.categories?.length > 0
                    ? 'הקטגוריות יופיעו בסדר שבחרת אותן'
                    : 'בחר קטגוריות כדי להתחיל'
                  }
                </p>
              </div>
            </div>
          )}

          {/* Limit Field - Only show when displayMode is 'all' */}
          {displayMode === 'all' && (
            <div>
              <Label>מקסימום קטגוריות להצגה</Label>
              <Input
                type="number"
                min="0"
                max="20"
                value={categoryGrid.limit || 0}
                onChange={(e) => updateContent('content.categoryGrid.limit', parseInt(e.target.value))}
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                כמה קטגוריות להציג מתוך כל הקטגוריות הפעילות.
                <br />
                0 = ללא הגבלה (הצג הכל)
              </p>
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="font-medium">Layout (לא רלוונטי לעיצוב באנר)</h3>
          <div className="grid grid-cols-3 gap-2 opacity-50">
            <div>
              <Label className="text-xs">Desktop</Label>
              <Input
                type="number"
                min="1"
                max="6"
                value={categoryGrid.layout?.columns?.desktop || 4}
                onChange={(e) => updateContent('content.categoryGrid.layout.columns.desktop', parseInt(e.target.value))}
                disabled
              />
            </div>
            <div>
              <Label className="text-xs">Tablet</Label>
              <Input
                type="number"
                min="1"
                max="4"
                value={categoryGrid.layout?.columns?.tablet || 2}
                onChange={(e) => updateContent('content.categoryGrid.layout.columns.tablet', parseInt(e.target.value))}
                disabled
              />
            </div>
            <div>
              <Label className="text-xs">Mobile</Label>
              <Input
                type="number"
                min="1"
                max="2"
                value={categoryGrid.layout?.columns?.mobile || 1}
                onChange={(e) => updateContent('content.categoryGrid.layout.columns.mobile', parseInt(e.target.value))}
                disabled
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProductCarouselEditor = () => {
    const carousel = editedSection.content?.productCarousel || {};

    return (
      <div className="space-y-4 sm:space-y-6">
        {/* GUESS Typography Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3 text-xs sm:text-sm text-blue-800" dir="rtl">
          <p className="font-semibold mb-1">💡 סגנון טיפוגרפיה GUESS</p>
          <p className="text-xs">הכותרת ושמות המוצרים מעוצבים אוטומטית בסגנון GUESS עם אפקט overlay מקצועי</p>
        </div>

        <Tabs defaultValue="he" dir="rtl">
          <TabsList className="grid w-full grid-cols-2 text-xs sm:text-sm">
            <TabsTrigger value="he">עברית</TabsTrigger>
            <TabsTrigger value="en">English</TabsTrigger>
          </TabsList>

          <TabsContent value="he" className="space-y-4">
            <div>
              <Label>כותרת</Label>
              <Input
                value={carousel.title?.he || ''}
                onChange={(e) => updateContent('content.productCarousel.title.he', e.target.value)}
                placeholder="מוצרים מומלצים"
              />
            </div>
          </TabsContent>

          <TabsContent value="en" className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={carousel.title?.en || ''}
                onChange={(e) => updateContent('content.productCarousel.title.en', e.target.value)}
                placeholder="Featured Products"
              />
            </div>
          </TabsContent>
        </Tabs>

        <Separator />

        <div className="space-y-4">
          <h3 className="font-medium">הגדרות</h3>
          <div>
            <Label>מקור מוצרים</Label>
            <select
              className="w-full border rounded p-2"
              value={carousel.productSource || 'featured'}
              onChange={(e) => updateContent('content.productCarousel.productSource', e.target.value)}
            >
              <option value="featured">מוצרים מומלצים</option>
              <option value="new">מוצרים חדשים</option>
              <option value="bestseller">רבי מכר</option>
            </select>
          </div>
          <div>
            <Label>מקסימום מוצרים</Label>
            <Input
              type="number"
              min="1"
              max="50"
              value={carousel.limit || 12}
              onChange={(e) => updateContent('content.productCarousel.limit', parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderHeroImageEditor = () => {
    const heroImage = editedSection.content?.heroImage || {};

    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Info Box */}
        <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-2 sm:p-3 text-xs sm:text-sm text-cyan-800" dir="rtl">
          <p className="font-semibold mb-1">📸 תמונת Hero רספונסיבית</p>
          <p className="text-xs">תמונה נקייה ללא טקסט או כפתורים. העלה 2 תמונות בגדלים מותאמים למסכים שונים</p>
        </div>

        <Separator />

        {/* Desktop Image */}
        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            🖥️ תמונה למסך מחשב
          </h3>

          <ImageUpload
            label="תמונה Desktop"
            value={heroImage.desktopImage?.url || ''}
            onChange={(url) => updateContent('content.heroImage.desktopImage.url', url)}
            recommendedSize="גודל מומלץ: 2600×896 פיקסלים (יחס רחב למסכי Desktop)"
            isHero={true}
          />

          <div>
            <Label>טקסט חלופי (ALT) - Desktop</Label>
            <Input
              value={heroImage.desktopImage?.alt || ''}
              onChange={(e) => updateContent('content.heroImage.desktopImage.alt', e.target.value)}
              placeholder="תיאור התמונה למנועי חיפוש"
            />
          </div>
        </div>

        <Separator />

        {/* Mobile Image */}
        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            📱 תמונה למובייל
          </h3>

          <ImageUpload
            label="תמונה Mobile"
            value={heroImage.mobileImage?.url || ''}
            onChange={(url) => updateContent('content.heroImage.mobileImage.url', url)}
            recommendedSize="גודל מומלץ: 1080×1350 פיקסלים (יחס 4:5 למסכי סמארטפון)"
            isHero={true}
          />

          <div>
            <Label>טקסט חלופי (ALT) - Mobile</Label>
            <Input
              value={heroImage.mobileImage?.alt || ''}
              onChange={(e) => updateContent('content.heroImage.mobileImage.alt', e.target.value)}
              placeholder="תיאור התמונה למנועי חיפוש"
            />
          </div>
        </div>

        <Separator />

        {/* Link Settings */}
        <div className="space-y-4">
          <h3 className="font-medium">🔗 קישור (אופציונלי)</h3>

          <div>
            <Label>קישור ליעד</Label>
            <Input
              value={heroImage.link || ''}
              onChange={(e) => updateContent('content.heroImage.link', e.target.value)}
              placeholder="/products או https://example.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              אם מוזן קישור, התמונה תהיה לחיצה ותוביל ליעד
            </p>
          </div>

          {heroImage.link && (
            <div className="flex items-center justify-between">
              <Label>פתח בטאב חדש</Label>
              <Switch
                checked={heroImage.openInNewTab || false}
                onCheckedChange={(checked) => updateContent('content.heroImage.openInNewTab', checked)}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPromotionalBannerEditor = () => {
    const banner = editedSection.content?.promotionalBanner || {};
    const heText = banner.text?.he || {};

    return (
      <div className="space-y-4 sm:space-y-6">
        {/* GUESS Typography Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3 text-xs sm:text-sm text-blue-800" dir="rtl">
          <p className="font-semibold mb-1">💡 סגנון טיפוגרפיה GUESS</p>
          <p className="text-xs">הטקסטים והכפתורים מעוצבים אוטומטית בסגנון GUESS עם אפקט shadow וכפתורים מעוצבים</p>
        </div>

        <Tabs defaultValue="he" dir="rtl">
          <TabsList className="grid w-full grid-cols-2 text-xs sm:text-sm">
            <TabsTrigger value="he">עברית</TabsTrigger>
            <TabsTrigger value="en">English</TabsTrigger>
          </TabsList>

          <TabsContent value="he" className="space-y-4">
            <div>
              <Label>כותרת</Label>
              <Input
                value={heText.headline || ''}
                onChange={(e) => updateContent('content.promotionalBanner.text.he.headline', e.target.value)}
                placeholder="מבצע ענק!"
              />
            </div>
            <div>
              <Label>כותרת משנה</Label>
              <Input
                value={heText.subheadline || ''}
                onChange={(e) => updateContent('content.promotionalBanner.text.he.subheadline', e.target.value)}
                placeholder="עד 70% הנחה"
              />
            </div>
            <div>
              <Label>CTA</Label>
              <Input
                value={heText.cta || ''}
                onChange={(e) => updateContent('content.promotionalBanner.text.he.cta', e.target.value)}
                placeholder="לחץ לפרטים"
              />
            </div>
          </TabsContent>
        </Tabs>

        <Separator />

        <div className="space-y-4">
          <h3 className="font-medium">תמונה וקישור</h3>
          <div>
            <Label>URL תמונה</Label>
            <Input
              value={banner.image?.desktop?.url || ''}
              onChange={(e) => updateContent('content.promotionalBanner.image.desktop.url', e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div>
            <Label>קישור</Label>
            <Input
              value={banner.link || ''}
              onChange={(e) => updateContent('content.promotionalBanner.link', e.target.value)}
              placeholder="/sale"
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="font-medium">תזמון</h3>
          <div className="flex items-center justify-between">
            <Label>הפעל תזמון</Label>
            <Switch
              checked={editedSection.schedule?.enabled || false}
              onCheckedChange={(checked) => updateContent('schedule.enabled', checked)}
            />
          </div>
          {editedSection.schedule?.enabled && (
            <>
              <div>
                <Label>תאריך התחלה</Label>
                <Input
                  type="datetime-local"
                  value={editedSection.schedule.startDate || ''}
                  onChange={(e) => updateContent('schedule.startDate', e.target.value)}
                />
              </div>
              <div>
                <Label>תאריך סיום</Label>
                <Input
                  type="datetime-local"
                  value={editedSection.schedule.endDate || ''}
                  onChange={(e) => updateContent('schedule.endDate', e.target.value)}
                />
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b flex items-center justify-between bg-white sticky top-0 z-10">
        <h2 className="text-sm sm:text-base font-semibold">עריכת Section</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="flex-shrink-0">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4">
        {/* General Settings */}
        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          <div className="flex items-center justify-between">
            <Label className="text-sm">פעיל</Label>
            <Switch
              checked={editedSection.isActive}
              onCheckedChange={(checked) => setEditedSection({ ...editedSection, isActive: checked })}
            />
          </div>
        </div>

        <Separator className="my-4 sm:my-6" />

        {/* Type-specific editors */}
        {section.type === 'hero_image' && renderHeroImageEditor()}
        {section.type === 'hero_banner' && renderHeroBannerEditor()}
        {section.type === 'category_grid' && renderCategoryGridEditor()}
        {section.type === 'product_carousel' && renderProductCarouselEditor()}
        {section.type === 'promotional_banner' && renderPromotionalBannerEditor()}
      </div>

      {/* Footer */}
      <div className="p-3 sm:p-4 border-t bg-white sticky bottom-0">
        <Button onClick={handleSave} className="w-full gap-2 text-sm" disabled={saving} size="sm">
          <Save className="h-4 w-4" />
          {saving ? 'שומר...' : 'שמור שינויים'}
        </Button>
      </div>
    </div>
  );
}
