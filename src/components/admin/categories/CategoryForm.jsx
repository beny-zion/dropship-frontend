'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Upload, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';

export default function CategoryForm({ category, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    name: { he: '', en: '' },
    description: { he: '', en: '' },
    mainImage: { url: '', alt: '' },
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

  const [imageSource, setImageSource] = useState('url'); // 'url' or 'upload'
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || { he: '', en: '' },
        description: category.description || { he: '', en: '' },
        mainImage: category.mainImage || { url: '', alt: '' },
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
      if (category.mainImage?.url) {
        setImagePreview(category.mainImage.url);
      }
    }
  }, [category]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate image
    if (!formData.mainImage?.url && !imageFile) {
      alert('יש להעלות תמונה או להזין כתובת URL לתמונה');
      return;
    }

    onSubmit({ formData, imageFile });
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

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('יש לבחור קובץ תמונה בלבד');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('גודל התמונה חייב להיות קטן מ-10MB');
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUrl = (url) => {
    setFormData((prev) => ({
      ...prev,
      mainImage: {
        ...prev.mainImage,
        url,
      },
    }));
    setImagePreview(url);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData((prev) => ({
      ...prev,
      mainImage: {
        ...prev.mainImage,
        url: '',
      },
    }));
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Image Upload Section */}
          <div className="space-y-4 border-b pb-6">
            <label className="block text-sm font-medium mb-2">
              תמונה ראשית * <span className="text-red-500">(חובה)</span>
            </label>

            {/* Image Source Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setImageSource('url')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 ${
                  imageSource === 'url'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <LinkIcon size={18} />
                קישור לתמונה
              </button>
              <button
                type="button"
                onClick={() => setImageSource('upload')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 ${
                  imageSource === 'upload'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Upload size={18} />
                העלאת תמונה
              </button>
            </div>

            {/* URL Input */}
            {imageSource === 'url' && (
              <div>
                <input
                  type="url"
                  placeholder="הזן כתובת URL לתמונה"
                  value={formData.mainImage.url}
                  onChange={(e) => handleImageUrl(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  הדבק כתובת URL של תמונה באיכות גבוהה
                </p>
              </div>
            )}

            {/* File Upload */}
            {imageSource === 'upload' && (
              <div>
                <label className="w-full flex flex-col items-center px-4 py-6 bg-white border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                  <Upload size={40} className="text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600 text-center">
                    {imageFile ? imageFile.name : 'לחץ להעלאת תמונה'}
                  </span>
                  <span className="text-xs text-gray-400 mt-1">
                    PNG, JPG, WEBP עד 10MB
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative">
                <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="תצוגה מקדימה"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Alt Text */}
            <div>
              <label className="block text-sm font-medium mb-2">
                טקסט חלופי לתמונה (Alt)
              </label>
              <input
                type="text"
                placeholder="תיאור קצר של התמונה"
                value={formData.mainImage.alt}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    mainImage: { ...prev.mainImage, alt: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              ביטול
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              {category ? 'עדכן קטגוריה' : 'צור קטגוריה'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
