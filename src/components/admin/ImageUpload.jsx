'use client';

import { useState } from 'react';
import { Upload, Link as LinkIcon, X, Image as ImageIcon, Loader2, Star, Trash2, Eye } from 'lucide-react';
import Image from 'next/image';

/**
 * קומפוננט להעלאת תמונות - תומך בשתי שיטות:
 * 1. העלאה ישירה דרך Cloudinary
 * 2. הדבקת לינק לתמונה
 *
 * הערה: התמונות מוצגות בתצוגה מקדימה מקומית ומועלות לקלאודינרי רק בשמירה
 */
export default function ImageUpload({
  images = [],
  onChange,
  maxImages = 5
}) {
  const [uploadMethod, setUploadMethod] = useState('upload'); // 'upload' or 'url'
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // הבטחה ש-images תמיד יהיה מערך
  const safeImages = Array.isArray(images) ? images : [];

  // מציאת התמונה הראשית
  const primaryImageIndex = safeImages.findIndex(img => img.isPrimary);

  /**
   * המרת קובץ ל-base64
   */
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  /**
   * טיפול בהעלאת קובץ - תצוגה מקדימה מקומית בלבד
   * התמונה תועלה לקלאודינרי רק בעת שמירת המוצר
   */
  const handleFileUpload = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    // בדיקת מספר תמונות מקסימלי
    if (safeImages.length + files.length > maxImages) {
      setError(`ניתן להעלות עד ${maxImages} תמונות בלבד`);
      return;
    }

    setUploading(true);
    setError('');

    try {
      const newImages = [];

      for (const file of files) {
        // בדיקת סוג קובץ
        if (!file.type.startsWith('image/')) {
          setError(`הקובץ ${file.name} אינו תמונה`);
          continue;
        }

        // בדיקת גודל קובץ (מקסימום 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError(`הקובץ ${file.name} גדול מדי (מקסימום 5MB)`);
          continue;
        }

        // המרה ל-base64 לתצוגה מקדימה
        const base64 = await fileToBase64(file);

        // שמירה עם סימון שזה תמונה חדשה שטרם הועלתה
        newImages.push({
          url: base64, // URL זמני (base64) לתצוגה מקדימה
          alt: file.name.replace(/\.[^/.]+$/, ''), // שם קובץ ללא סיומת
          isPrimary: safeImages.length === 0 && newImages.length === 0, // רק אם אין תמונות
          isNew: true, // סימון שזו תמונה חדשה שטרם הועלתה
          fileData: base64 // שמירת ה-base64 להעלאה מאוחרת
        });
      }

      // עדכון רשימת התמונות
      onChange([...safeImages, ...newImages]);

      // איפוס ה-input כדי לאפשר בחירה חוזרת של אותם קבצים
      e.target.value = '';
    } catch (err) {
      console.error('Error processing images:', err);
      setError('שגיאה בעיבוד התמונות');
    } finally {
      setUploading(false);
    }
  };

  /**
   * הוספת תמונה דרך URL - תצוגה מקדימה מיידית
   */
  const handleUrlAdd = async () => {
    if (!imageUrl || !imageUrl.trim()) {
      setError('נא להזין URL של תמונה');
      return;
    }

    // בדיקת מספר תמונות מקסימלי
    if (safeImages.length >= maxImages) {
      setError(`ניתן להעלות עד ${maxImages} תמונות בלבד`);
      return;
    }

    // בדיקה בסיסית של URL
    try {
      new URL(imageUrl);
    } catch (e) {
      setError('URL לא תקין');
      return;
    }

    setError('');

    // הוספת התמונה לרשימה עם URL חיצוני
    onChange([...safeImages, {
      url: imageUrl,
      alt: '',
      isPrimary: safeImages.length === 0, // רק אם אין תמונות
      isExternalUrl: true // סימון שזה URL חיצוני
    }]);
    setImageUrl('');
  };

  /**
   * מחיקת תמונה
   */
  const handleRemoveImage = (index) => {
    const wasPrimary = safeImages[index].isPrimary;
    const newImages = safeImages.filter((_, i) => i !== index);

    // אם מחקנו את התמונה הראשית, נעביר את הסטטוס לתמונה הראשונה
    if (wasPrimary && newImages.length > 0) {
      newImages[0].isPrimary = true;
    }

    onChange(newImages);
  };

  /**
   * הגדרת תמונה כראשית
   */
  const handleSetPrimary = (index) => {
    const newImages = safeImages.map((img, i) => ({
      ...img,
      isPrimary: i === index
    }));
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* כותרת */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          תמונות המוצר
        </label>
        <p className="text-sm text-gray-500">
          העלה עד {maxImages} תמונות. לחץ על כוכב כדי לבחור תמונה ראשית.
        </p>
      </div>

      {/* תצוגת תמונות שהועלו - גלריה */}
      {safeImages.length > 0 && (
        <div className="space-y-4">
          {/* תמונה ראשית גדולה */}
          <div className="border-2 border-blue-500 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 text-blue-600 fill-blue-600" />
              <span className="text-sm font-semibold text-blue-900">תמונה ראשית</span>
            </div>

            {primaryImageIndex !== -1 ? (
              <div className="relative aspect-video bg-white rounded-lg overflow-hidden shadow-md">
                {safeImages[primaryImageIndex].url.startsWith('data:') ? (
                  // תמונת base64 - תצוגה מקדימה
                  <img
                    src={safeImages[primaryImageIndex].url}
                    alt={safeImages[primaryImageIndex].alt || 'תמונה ראשית'}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  // תמונה מ-URL חיצוני או Cloudinary
                  <Image
                    src={safeImages[primaryImageIndex].url}
                    alt={safeImages[primaryImageIndex].alt || 'תמונה ראשית'}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                )}
                {/* תג תצוגה מקדימה לתמונות חדשות */}
                {safeImages[primaryImageIndex].isNew && (
                  <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 z-10">
                    <Eye className="w-3 h-3" />
                    <span>תצוגה מקדימה</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(primaryImageIndex)}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg transition-all z-10"
                  title="מחק תמונה"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="relative aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <ImageIcon className="w-16 h-16 mx-auto mb-2" />
                  <p className="text-sm">אין תמונה ראשית</p>
                </div>
              </div>
            )}
          </div>

          {/* גלריית תמונות קטנות */}
          {safeImages.length > 1 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-gray-700">גלריית תמונות</span>
                <span className="text-xs text-gray-500">({safeImages.length} תמונות)</span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                {safeImages.map((image, index) => (
                  <div
                    key={index}
                    className={`relative group rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      image.isPrimary
                        ? 'border-blue-500 ring-2 ring-blue-200 scale-105'
                        : 'border-gray-200 hover:border-blue-300 hover:scale-105'
                    }`}
                    onClick={() => handleSetPrimary(index)}
                    title={image.isPrimary ? 'תמונה ראשית' : 'לחץ להגדרה כתמונה ראשית'}
                  >
                    {/* תמונה */}
                    <div className="relative aspect-square bg-gray-100">
                      {image.url.startsWith('data:') ? (
                        // תמונת base64 - תצוגה מקדימה
                        <img
                          src={image.url}
                          alt={image.alt || `תמונה ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        // תמונה מ-URL חיצוני או Cloudinary
                        <Image
                          src={image.url}
                          alt={image.alt || `תמונה ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 25vw, (max-width: 768px) 20vw, 15vw"
                        />
                      )}
                    </div>

                    {/* overlay עם כפתורים */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        {!image.isPrimary && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetPrimary(index);
                            }}
                            className="p-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 shadow-lg"
                            title="הגדר כראשית"
                          >
                            <Star className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(index);
                          }}
                          className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg"
                          title="מחק"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* תג תמונה ראשית */}
                    {image.isPrimary && (
                      <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-white" />
                        <span className="text-[10px]">ראשית</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* בחירת שיטת העלאה */}
      {safeImages.length < maxImages && (
        <>
          <div className="flex gap-2 border-b border-gray-200">
            <button
              type="button"
              onClick={() => setUploadMethod('upload')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                uploadMethod === 'upload'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Upload className="w-4 h-4 inline-block ml-1" />
              העלאה מהמחשב
            </button>
            <button
              type="button"
              onClick={() => setUploadMethod('url')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                uploadMethod === 'url'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <LinkIcon className="w-4 h-4 inline-block ml-1" />
              הוספת לינק
            </button>
          </div>

          {/* שגיאות */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <X className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* אזור העלאה */}
          {uploadMethod === 'upload' ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors bg-gray-50">
              <input
                type="file"
                id="image-upload"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                disabled={!!(uploading || safeImages.length >= maxImages)}
                className="hidden"
              />
              <label
                htmlFor="image-upload"
                className={`flex flex-col items-center justify-center cursor-pointer ${
                  uploading || safeImages.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-2" />
                    <p className="text-sm text-gray-600">מעלה תמונות...</p>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-1 font-medium">
                      לחץ לבחירת תמונות או גרור ושחרר כאן
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, WEBP עד 5MB • {maxImages - safeImages.length} תמונות נותרו
                    </p>
                  </>
                )}
              </label>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                disabled={uploading || safeImages.length >= maxImages}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleUrlAdd();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleUrlAdd}
                disabled={!!(uploading || !imageUrl || !imageUrl.trim() || safeImages.length >= maxImages)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {uploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'הוסף'
                )}
              </button>
            </div>
          )}
        </>
      )}

      {/* הודעה כאשר הגענו למקסימום תמונות */}
      {safeImages.length >= maxImages && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm">
          הגעת למספר המקסימלי של {maxImages} תמונות. מחק תמונה כדי להוסיף חדשה.
        </div>
      )}
    </div>
  );
}
