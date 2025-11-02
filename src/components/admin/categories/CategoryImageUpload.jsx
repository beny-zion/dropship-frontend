'use client';

import { useState } from 'react';
import { uploadCategoryImage } from '@/lib/api/categories';
import { Button } from '@/components/ui/button';
import { X, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function CategoryImageUpload({ category, onClose, onSuccess }) {
  const [imageType, setImageType] = useState('main');
  const [mediaType, setMediaType] = useState('image');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [alt, setAlt] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);

      // Auto-detect media type
      if (selectedFile.type.startsWith('video/')) {
        setMediaType('video');
      } else if (selectedFile.name.match(/\.gif$/i)) {
        setMediaType('gif');
      } else {
        setMediaType('image');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error('נא לבחור קובץ');
      return;
    }

    setUploading(true);

    try {
      const response = await uploadCategoryImage(
        category._id,
        file,
        imageType,
        mediaType,
        alt || category.name.he
      );

      if (response.success) {
        toast.success('התמונה הועלתה בהצלחה');
        onSuccess();
      }
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(err.response?.data?.message || 'שגיאה בהעלאת התמונה');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">העלאת תמונה</h2>
            <p className="text-sm text-gray-500 mt-1">{category.name.he}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Image Type Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">סוג תמונה</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="imageType"
                  value="main"
                  checked={imageType === 'main'}
                  onChange={(e) => setImageType(e.target.value)}
                  className="w-4 h-4"
                />
                <span>תמונה ראשית</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="imageType"
                  value="promotional"
                  checked={imageType === 'promotional'}
                  onChange={(e) => setImageType(e.target.value)}
                  className="w-4 h-4"
                />
                <span>תמונה פרסומית</span>
              </label>
            </div>
          </div>

          {/* Media Type Selection (only for promotional) */}
          {imageType === 'promotional' && (
            <div>
              <label className="block text-sm font-medium mb-3">סוג מדיה</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="mediaType"
                    value="image"
                    checked={mediaType === 'image'}
                    onChange={(e) => setMediaType(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span>תמונה</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="mediaType"
                    value="gif"
                    checked={mediaType === 'gif'}
                    onChange={(e) => setMediaType(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span>GIF</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="mediaType"
                    value="video"
                    checked={mediaType === 'video'}
                    onChange={(e) => setMediaType(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span>וידאו</span>
                </label>
              </div>
            </div>
          )}

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">בחר קובץ *</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept={mediaType === 'video' ? 'video/*' : 'image/*'}
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload size={48} className="text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  לחץ לבחירת קובץ או גרור לכאן
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  {mediaType === 'video' ? 'MP4, MOV (עד 50MB)' : 'JPG, PNG, GIF, WebP (עד 50MB)'}
                </span>
              </label>
            </div>
          </div>

          {/* Preview */}
          {preview && (
            <div>
              <label className="block text-sm font-medium mb-2">תצוגה מקדימה</label>
              <div className="border rounded-lg overflow-hidden">
                {mediaType === 'video' ? (
                  <video
                    src={preview}
                    controls
                    className="w-full max-h-64 object-contain bg-gray-100"
                  />
                ) : (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full max-h-64 object-contain bg-gray-100"
                  />
                )}
              </div>
            </div>
          )}

          {/* Alt Text */}
          <div>
            <label className="block text-sm font-medium mb-2">טקסט חלופי (Alt)</label>
            <input
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder={category.name.he}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={uploading}>
              ביטול
            </Button>
            <Button type="submit" disabled={!file || uploading}>
              {uploading ? 'מעלה...' : 'העלה תמונה'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
