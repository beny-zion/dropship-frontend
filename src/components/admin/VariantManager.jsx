'use client';

import { useState } from 'react';
import { Plus, Trash2, Copy, Image as ImageIcon, Wand2 } from 'lucide-react';

export default function VariantManager({ variants = [], onChange }) {
  const [editingIndex, setEditingIndex] = useState(null);
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [bulkColors, setBulkColors] = useState('');
  const [bulkSizes, setBulkSizes] = useState('');
  const [baseSKU, setBaseSKU] = useState('');

  const handleAddVariant = () => {
    const newVariant = {
      sku: '',
      color: '',
      size: '',
      images: [],
      stock: {
        available: true,
        quantity: null
      },
      additionalCost: {
        usd: 0,
        ils: 0
      },
      supplierLink: '',
      barcode: '',
      weight: ''
    };
    onChange([...variants, newVariant]);
    setEditingIndex(variants.length);
  };

  const handleDuplicateVariant = (index) => {
    const variantToCopy = { ...variants[index] };
    variantToCopy.sku = `${variantToCopy.sku}-COPY`;
    onChange([...variants, variantToCopy]);
  };

  const handleRemoveVariant = (index) => {
    const newVariants = variants.filter((_, i) => i !== index);
    onChange(newVariants);
  };

  const handleUpdateVariant = (index, field, value) => {
    const newVariants = [...variants];

    // Handle nested fields
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      newVariants[index][parent] = {
        ...newVariants[index][parent],
        [child]: value
      };
    } else {
      newVariants[index][field] = value;
    }

    onChange(newVariants);
  };

  // המרת קובץ ל-base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleImageUpload = async (index, files) => {
    try {
      const imagePromises = Array.from(files).map(async (file) => {
        const base64 = await fileToBase64(file);
        return {
          url: base64, // תצוגה מקדימה
          alt: file.name.replace(/\.[^/.]+$/, ''),
          isPrimary: false,
          isNew: true, // סימון שזו תמונה חדשה
          fileData: base64 // נתונים להעלאה
        };
      });

      const imageUrls = await Promise.all(imagePromises);

      const newVariants = [...variants];
      const currentColor = newVariants[index].color;

      // עדכן את התמונות לווריאנט הנוכחי
      newVariants[index].images = [...(newVariants[index].images || []), ...imageUrls];

      // אם יש צבע, שכפל את התמונות לכל הווריאנטים עם אותו צבע
      if (currentColor) {
        newVariants.forEach((variant, i) => {
          if (i !== index && variant.color === currentColor) {
            variant.images = newVariants[index].images;
          }
        });
      }

      onChange(newVariants);
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('שגיאה בעיבוד התמונות');
    }
  };

  const handleRemoveImage = (variantIndex, imageIndex) => {
    const newVariants = [...variants];
    const currentColor = newVariants[variantIndex].color;

    // מחק את התמונה מהווריאנט הנוכחי
    newVariants[variantIndex].images = newVariants[variantIndex].images.filter((_, i) => i !== imageIndex);

    // אם יש צבע, מחק גם מכל הווריאנטים עם אותו צבע
    if (currentColor) {
      newVariants.forEach((variant, i) => {
        if (i !== variantIndex && variant.color === currentColor) {
          variant.images = newVariants[variantIndex].images;
        }
      });
    }

    onChange(newVariants);
  };

  const handleSetPrimaryImage = (variantIndex, imageIndex) => {
    const newVariants = [...variants];
    const currentColor = newVariants[variantIndex].color;

    // עדכן תמונה ראשית בווריאנט הנוכחי
    newVariants[variantIndex].images = newVariants[variantIndex].images.map((img, i) => ({
      ...img,
      isPrimary: i === imageIndex
    }));

    // אם יש צבע, עדכן גם בכל הווריאנטים עם אותו צבע
    if (currentColor) {
      newVariants.forEach((variant, i) => {
        if (i !== variantIndex && variant.color === currentColor) {
          variant.images = newVariants[variantIndex].images;
        }
      });
    }

    onChange(newVariants);
  };

  // יצירה מהירה של ווריאנטים לפי צבעים ומידות
  const handleBulkCreate = () => {
    if (!baseSKU) {
      alert('נא להזין SKU בסיס');
      return;
    }

    const colors = bulkColors.split(',').map(c => c.trim()).filter(Boolean);
    const sizes = bulkSizes.split(',').map(s => s.trim()).filter(Boolean);

    if (colors.length === 0 && sizes.length === 0) {
      alert('נא להזין לפחות צבע אחד או מידה אחת');
      return;
    }

    const newVariants = [];

    // אם יש גם צבעים וגם מידות, צור כל שילוב אפשרי
    if (colors.length > 0 && sizes.length > 0) {
      colors.forEach(color => {
        sizes.forEach(size => {
          newVariants.push({
            sku: `${baseSKU}-${color.toUpperCase()}-${size.toUpperCase()}`,
            color: color,
            size: size,
            images: [],
            stock: {
              available: true,
              quantity: null
            },
            additionalCost: {
              usd: 0,
              ils: 0
            },
            supplierLink: '',
            barcode: '',
            weight: ''
          });
        });
      });
    }
    // אם יש רק צבעים
    else if (colors.length > 0) {
      colors.forEach(color => {
        newVariants.push({
          sku: `${baseSKU}-${color.toUpperCase()}`,
          color: color,
          size: '',
          images: [],
          stock: {
            available: true,
            quantity: null
          },
          additionalCost: {
            usd: 0,
            ils: 0
          },
          supplierLink: '',
          barcode: '',
          weight: ''
        });
      });
    }
    // אם יש רק מידות
    else if (sizes.length > 0) {
      sizes.forEach(size => {
        newVariants.push({
          sku: `${baseSKU}-${size.toUpperCase()}`,
          color: '',
          size: size,
          images: [],
          stock: {
            available: true,
            quantity: null
          },
          additionalCost: {
            usd: 0,
            ils: 0
          },
          supplierLink: '',
          barcode: '',
          weight: ''
        });
      });
    }

    onChange([...variants, ...newVariants]);

    // איפוס הטופס
    setBulkColors('');
    setBulkSizes('');
    setBaseSKU('');
    setShowBulkAdd(false);
  };

  // קבלת צבעים ייחודיים
  const uniqueColors = [...new Set(variants.map(v => v.color).filter(Boolean))];

  // ספירת ווריאנטים פעילים
  const activeVariantsCount = variants.filter(v => v.stock?.available !== false).length;
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">ווריאנטים (צבעים ומידות)</h3>
          {variants.length > 0 && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition text-sm font-medium"
            >
              {variants.length} ווריאנטים | {activeVariantsCount} פעילים
              <span className="text-xs">{isExpanded ? '▼' : '◀'}</span>
            </button>
          )}
        </div>
        {isExpanded && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowBulkAdd(!showBulkAdd)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <Wand2 className="w-4 h-4" />
              הוספה מהירה
            </button>
            <button
              type="button"
              onClick={handleAddVariant}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" />
              הוסף ידני
            </button>
          </div>
        )}
      </div>

      {/* הסבר על תמונות */}
      {isExpanded && variants.length > 0 && uniqueColors.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <ImageIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">טיפ: העלאת תמונות לפי צבעים</p>
              <p>העלה תמונות רק לצבעים שונים (לא למידות). כל תמונה שתעלה לצבע תשמש אוטומטית לכל המידות של אותו צבע.</p>
              <p className="mt-1 text-xs">
                צבעים זמינים: <span className="font-medium">{uniqueColors.join(', ')}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* הוספה מהירה */}
      {isExpanded && showBulkAdd && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Wand2 className="w-5 h-5 text-green-700" />
            <h4 className="text-lg font-semibold text-green-900">יצירה מהירה של ווריאנטים</h4>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU בסיס *
              </label>
              <input
                type="text"
                value={baseSKU}
                onChange={(e) => setBaseSKU(e.target.value.toUpperCase())}
                placeholder="למשל: JACKET"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 font-mono"
              />
              <p className="text-xs text-gray-600 mt-1">
                זה ישמש כבסיס ל-SKU של כל הווריאנטים
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                צבעים (הפרד בפסיקים)
              </label>
              <input
                type="text"
                value={bulkColors}
                onChange={(e) => setBulkColors(e.target.value)}
                placeholder="למשל: שחור, לבן, אדום, כחול"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-600 mt-1">
                אם אין צבעים שונים, השאר ריק
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                מידות (הפרד בפסיקים)
              </label>
              <input
                type="text"
                value={bulkSizes}
                onChange={(e) => setBulkSizes(e.target.value)}
                placeholder="למשל: XS, S, M, L, XL, XXL"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-600 mt-1">
                אם אין מידות שונות, השאר ריק
              </p>
            </div>

            {/* תצוגה מקדימה */}
            {baseSKU && (bulkColors || bulkSizes) && (
              <div className="bg-white border border-green-200 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">תצוגה מקדימה:</p>
                <div className="text-sm text-gray-600 space-y-1">
                  {bulkColors && bulkSizes ? (
                    <>
                      <p className="font-semibold text-green-700">
                        ייווצרו {bulkColors.split(',').filter(Boolean).length * bulkSizes.split(',').filter(Boolean).length} ווריאנטים
                      </p>
                      <p className="text-xs">
                        לדוגמה: {baseSKU}-{bulkColors.split(',')[0]?.trim().toUpperCase()}-{bulkSizes.split(',')[0]?.trim().toUpperCase()}
                      </p>
                    </>
                  ) : bulkColors ? (
                    <>
                      <p className="font-semibold text-green-700">
                        ייווצרו {bulkColors.split(',').filter(Boolean).length} ווריאנטים (לפי צבעים)
                      </p>
                      <p className="text-xs">
                        לדוגמה: {baseSKU}-{bulkColors.split(',')[0]?.trim().toUpperCase()}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-green-700">
                        ייווצרו {bulkSizes.split(',').filter(Boolean).length} ווריאנטים (לפי מידות)
                      </p>
                      <p className="text-xs">
                        לדוגמה: {baseSKU}-{bulkSizes.split(',')[0]?.trim().toUpperCase()}
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleBulkCreate}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
              >
                צור ווריאנטים
              </button>
              <button
                type="button"
                onClick={() => setShowBulkAdd(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {variants.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500">אין ווריאנטים עדיין</p>
          <p className="text-sm text-gray-400 mt-2">לחץ על כפתור &quot;+&quot; כדי להוסיף</p>
          <div className="mt-4 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => setShowBulkAdd(!showBulkAdd)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <Wand2 className="w-4 h-4" />
              הוספה מהירה
            </button>
            <button
              type="button"
              onClick={handleAddVariant}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" />
              הוסף ידני
            </button>
          </div>
        </div>
      ) : isExpanded ? (
        <div className="space-y-4">
          {variants.map((variant, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    #{index + 1}
                  </div>
                  {variant.sku && (
                    <span className="text-sm text-gray-600 font-mono">{variant.sku}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleDuplicateVariant(index)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                    title="שכפל ווריאנט"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                    title="מחק ווריאנט"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* SKU */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU *
                  </label>
                  <input
                    type="text"
                    value={variant.sku}
                    onChange={(e) => handleUpdateVariant(index, 'sku', e.target.value.toUpperCase())}
                    placeholder="JACKET-CHOCOLATE-XS"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    required
                  />
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    צבע
                  </label>
                  <input
                    type="text"
                    value={variant.color || ''}
                    onChange={(e) => handleUpdateVariant(index, 'color', e.target.value)}
                    placeholder="CHOCOLATE"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    מידה
                  </label>
                  <input
                    type="text"
                    value={variant.size || ''}
                    onChange={(e) => handleUpdateVariant(index, 'size', e.target.value)}
                    placeholder="XS"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Supplier Link */}
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    קישור לרכישה אצל הספק (אופציונלי)
                  </label>
                  <input
                    type="url"
                    value={variant.supplierLink || ''}
                    onChange={(e) => handleUpdateVariant(index, 'supplierLink', e.target.value)}
                    placeholder="אופציונלי - קישור ישירות לווריאנט הספציפי"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    אין חובה למלא - ניתן להשתמש בקישור הכללי של הספק במקום
                  </p>
                </div>

                {/* Additional Cost */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    עלות נוספת (₪)
                  </label>
                  <input
                    type="number"
                    value={variant.additionalCost?.ils || 0}
                    onChange={(e) => handleUpdateVariant(index, 'additionalCost.ils', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Additional Cost USD */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    עלות נוספת ($)
                  </label>
                  <input
                    type="number"
                    value={variant.additionalCost?.usd || 0}
                    onChange={(e) => handleUpdateVariant(index, 'additionalCost.usd', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Stock Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    כמות במלאי
                  </label>
                  <input
                    type="number"
                    value={variant.stock?.quantity || ''}
                    onChange={(e) => handleUpdateVariant(index, 'stock.quantity', e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="ללא הגבלה"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>
              </div>

              {/* Stock Available Toggle */}
              <div className="mt-4 flex items-center">
                <input
                  type="checkbox"
                  id={`variant-available-${index}`}
                  checked={variant.stock?.available !== false}
                  onChange={(e) => handleUpdateVariant(index, 'stock.available', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor={`variant-available-${index}`} className="mr-2 text-sm text-gray-700">
                  זמין לרכישה
                </label>
              </div>

              {/* Images - רק אם זה הווריאנט הראשון עם הצבע הזה */}
              {variant.color && variants.findIndex(v => v.color === variant.color) === index && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    תמונות צבע: {variant.color}
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    תמונות אלו ישמשו לכל המידות של צבע {variant.color}
                  </p>

                  {/* אפשרות להוספת URL */}
                  <div className="mb-3 flex gap-2">
                    <input
                      type="url"
                      placeholder="או הדבק קישור לתמונה..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const url = e.target.value.trim();
                          if (url) {
                            try {
                              new URL(url);
                              const newVariants = [...variants];
                              const currentColor = newVariants[index].color;

                              // הוסף URL חיצוני
                              const newImage = {
                                url: url,
                                alt: `${variant.color}`,
                                isPrimary: !newVariants[index].images || newVariants[index].images.length === 0,
                                isExternalUrl: true
                              };

                              newVariants[index].images = [...(newVariants[index].images || []), newImage];

                              // שכפל לכל הווריאנטים עם אותו צבע
                              if (currentColor) {
                                newVariants.forEach((v, i) => {
                                  if (i !== index && v.color === currentColor) {
                                    v.images = newVariants[index].images;
                                  }
                                });
                              }

                              onChange(newVariants);
                              e.target.value = '';
                            } catch {
                              alert('URL לא תקין');
                            }
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm font-medium"
                      onClick={(e) => {
                        const input = e.target.previousElementSibling;
                        const url = input.value.trim();
                        if (url) {
                          try {
                            new URL(url);
                            const newVariants = [...variants];
                            const currentColor = newVariants[index].color;

                            const newImage = {
                              url: url,
                              alt: `${variant.color}`,
                              isPrimary: !newVariants[index].images || newVariants[index].images.length === 0,
                              isExternalUrl: true
                            };

                            newVariants[index].images = [...(newVariants[index].images || []), newImage];

                            if (currentColor) {
                              newVariants.forEach((v, i) => {
                                if (i !== index && v.color === currentColor) {
                                  v.images = newVariants[index].images;
                                }
                              });
                            }

                            onChange(newVariants);
                            input.value = '';
                          } catch {
                            alert('URL לא תקין');
                          }
                        }
                      }}
                    >
                      הוסף קישור
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-2">
                    {variant.images?.map((image, imgIndex) => (
                      <div key={imgIndex} className="relative group">
                        <img
                          src={image.url}
                          alt={image.alt || `Image ${imgIndex + 1}`}
                          className={`w-20 h-20 object-cover rounded border-2 ${
                            image.isPrimary ? 'border-blue-500' : 'border-gray-200'
                          }`}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1">
                          {!image.isPrimary && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryImage(index, imgIndex)}
                              className="px-2 py-1 bg-blue-600 text-white text-xs rounded"
                            >
                              ראשי
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index, imgIndex)}
                            className="px-2 py-1 bg-red-600 text-white text-xs rounded"
                          >
                            מחק
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload(index, e.target.files)}
                    className="hidden"
                    id={`variant-images-${index}`}
                  />
                  <label
                    htmlFor={`variant-images-${index}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4" />
                    העלה תמונות לצבע {variant.color}
                  </label>
                </div>
              )}

              {/* הצגת הודעה אם זה לא הווריאנט הראשון */}
              {variant.color && variants.findIndex(v => v.color === variant.color) !== index && (
                <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-sm text-gray-600">
                    תמונות לצבע <span className="font-medium">{variant.color}</span> מנוהלות בווריאנט הראשון עם צבע זה
                  </p>
                </div>
              )}

              {/* אם אין צבע, הצג הודעה */}
              {!variant.color && (
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm text-amber-800">
                    הזן צבע כדי להוסיף תמונות לווריאנט זה
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
