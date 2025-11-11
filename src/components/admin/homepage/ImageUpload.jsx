import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import apiClient from '@/lib/api/client';

export default function ImageUpload({
  label,
  value,
  onChange,
  recommendedSize,
  isHero = false, // האם זו תמונת Hero שצריכה איכות מקסימלית
  accept = 'image/jpeg,image/png,image/webp,image/svg+xml'
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || '');
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('נא לבחור קובץ תמונה בלבד');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('גודל הקובץ חורג מ-10MB. נא לבחור קובץ קטן יותר');
      return;
    }

    try {
      setUploading(true);

      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = async () => {
        const base64 = reader.result;

        // Upload to server
        const endpoint = isHero ? '/upload/hero-image' : '/upload/image';
        const response = await apiClient.post(endpoint, {
          fileData: base64
        });

        if (response.success) {
          const imageUrl = response.data.url;
          setPreview(imageUrl);
          onChange(imageUrl);

          // Show success message with file info
          const sizeKB = (file.size / 1024).toFixed(2);
          console.log(`✅ תמונה הועלתה בהצלחה: ${response.data.width}×${response.data.height}, ${sizeKB}KB, פורמט: ${response.data.format}`);
        }
      };

      reader.onerror = () => {
        alert('שגיאה בקריאת הקובץ');
        setUploading(false);
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('שגיאה בהעלאת התמונה: ' + (error.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUrlChange = (url) => {
    setPreview(url);
    onChange(url);
  };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>

      {/* URL Input */}
      <div className="space-y-2">
        <Input
          type="text"
          value={value || ''}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder="הכנס URL של תמונה או העלה מהמחשב"
          disabled={uploading}
        />
        {recommendedSize && (
          <p className="text-xs text-gray-500">{recommendedSize}</p>
        )}
      </div>

      {/* Upload Button */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex-1"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              מעלה...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              העלה מהמחשב
            </>
          )}
        </Button>

        {preview && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleRemove}
            disabled={uploading}
            title="הסר תמונה"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Preview */}
      {preview && (
        <div className="relative rounded-lg border-2 border-dashed border-gray-300 overflow-hidden">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover"
            onError={() => {
              console.error('Failed to load image preview');
            }}
          />
          <div className="absolute top-2 right-2">
            <div className="bg-green-500 text-white px-2 py-1 rounded text-xs">
              ✓ תמונה נטענה
            </div>
          </div>
        </div>
      )}

      {/* Info Box for Hero Images */}
      {isHero && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs">
          <p className="text-blue-800 font-medium mb-1">💡 טיפ לתמונות Hero:</p>
          <ul className="text-blue-700 space-y-1">
            <li>• התמונה תישמר ב<strong>איכות מקסימלית 100%</strong></li>
            <li>• Cloudinary ימיר אוטומטית ל-WebP/AVIF לביצועים</li>
            <li>• <strong>SVG נתמך</strong> - מעולה לגרפיקה ולוגואים</li>
            <li>• מומלץ: JPG/PNG באיכות גבוהה או SVG</li>
          </ul>
        </div>
      )}
    </div>
  );
}
