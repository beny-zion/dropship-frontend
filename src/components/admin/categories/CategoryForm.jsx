'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function CategoryForm({ category, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    name: { he: '', en: '' },
    description: { he: '', en: '' },
    promotionalText: { he: '', en: '' },
    styling: {
      backgroundColor: '#ffffff',
      textColor: '#000000',
      gradientColors: [],
    },
    displayOrder: 0,
    isActive: true,
    validFrom: null,
    validTo: null,
    seo: {
      metaTitle: { he: '', en: '' },
      metaDescription: { he: '', en: '' },
      keywords: [],
    },
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || { he: '', en: '' },
        description: category.description || { he: '', en: '' },
        promotionalText: category.promotionalText || { he: '', en: '' },
        styling: category.styling || {
          backgroundColor: '#ffffff',
          textColor: '#000000',
          gradientColors: [],
        },
        displayOrder: category.displayOrder || 0,
        isActive: category.isActive !== undefined ? category.isActive : true,
        validFrom: category.validFrom || null,
        validTo: category.validTo || null,
        seo: category.seo || {
          metaTitle: { he: '', en: '' },
          metaDescription: { he: '', en: '' },
          keywords: [],
        },
      });
    }
  }, [category]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value, lang = null, nested = null) => {
    setFormData((prev) => {
      if (nested) {
        return {
          ...prev,
          [nested]: {
            ...prev[nested],
            [field]: lang ? { ...prev[nested][field], [lang]: value } : value,
          },
        };
      }
      if (lang) {
        return {
          ...prev,
          [field]: {
            ...prev[field],
            [lang]: value,
          },
        };
      }
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-3xl w-full my-8">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">
            {category ? 'עריכת קטגוריה' : 'קטגוריה חדשה'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                שם הקטגוריה (עברית) *
              </label>
              <input
                type="text"
                required
                value={formData.name.he}
                onChange={(e) => handleChange('name', e.target.value, 'he')}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                שם הקטגוריה (אנגלית)
              </label>
              <input
                type="text"
                value={formData.name.en}
                onChange={(e) => handleChange('name', e.target.value, 'en')}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Description */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                תיאור (עברית)
              </label>
              <textarea
                value={formData.description.he}
                onChange={(e) => handleChange('description', e.target.value, 'he')}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                תיאור (אנגלית)
              </label>
              <textarea
                value={formData.description.en}
                onChange={(e) => handleChange('description', e.target.value, 'en')}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Promotional Text */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                טקסט פרסומי (עברית)
              </label>
              <input
                type="text"
                value={formData.promotionalText.he}
                onChange={(e) => handleChange('promotionalText', e.target.value, 'he')}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                טקסט פרסומי (אנגלית)
              </label>
              <input
                type="text"
                value={formData.promotionalText.en}
                onChange={(e) => handleChange('promotionalText', e.target.value, 'en')}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Styling */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                צבע רקע
              </label>
              <input
                type="color"
                value={formData.styling.backgroundColor}
                onChange={(e) => handleChange('backgroundColor', e.target.value, null, 'styling')}
                className="w-full h-10 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                צבע טקסט
              </label>
              <input
                type="color"
                value={formData.styling.textColor}
                onChange={(e) => handleChange('textColor', e.target.value, null, 'styling')}
                className="w-full h-10 border rounded-lg"
              />
            </div>
          </div>

          {/* Display Order & Status */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                סדר תצוגה
              </label>
              <input
                type="number"
                value={formData.displayOrder}
                onChange={(e) => handleChange('displayOrder', parseInt(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                  className="w-5 h-5"
                />
                <span className="text-sm font-medium">קטגוריה פעילה</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              ביטול
            </Button>
            <Button type="submit">
              {category ? 'עדכן קטגוריה' : 'צור קטגוריה'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
