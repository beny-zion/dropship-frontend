'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, ExternalLink, Check, X, Save, Loader2, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { adminApi } from '@/lib/api/admin';

export default function ProductInventoryCard({ product }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Product level availability
  const [productAvailable, setProductAvailable] = useState(product.stock?.available ?? true);

  // Variants availability - indexed by SKU
  const [variantsAvailability, setVariantsAvailability] = useState({});

  // Checklist state - track if this product was checked in current session
  const [isChecked, setIsChecked] = useState(false);
  const [lastCheckedTime, setLastCheckedTime] = useState(null);

  const queryClient = useQueryClient();

  // Load checklist state from localStorage
  useEffect(() => {
    const checklistKey = `inventory-check-${product._id}`;
    const savedCheck = localStorage.getItem(checklistKey);

    if (savedCheck) {
      const checkData = JSON.parse(savedCheck);
      setIsChecked(checkData.checked);
      setLastCheckedTime(checkData.timestamp);
    }
  }, [product._id]);

  // Initialize variants state from product data
  useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      const initialState = {};
      product.variants.forEach(variant => {
        initialState[variant.sku] = variant.stock?.available ?? true;
      });
      setVariantsAvailability(initialState);
    }
  }, [product._id]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const response = await adminApi.updateProductAvailability(product._id, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('✓ הזמינות עודכנה בהצלחה');
      setHasChanges(false);
      queryClient.invalidateQueries(['admin', 'products', 'inventory']);
    },
    onError: (error) => {
      toast.error('שגיאה בעדכון הזמינות', {
        description: error.response?.data?.message || error.message
      });
    }
  });

  // Handle save
  const handleSave = () => {
    const variantsData = Object.keys(variantsAvailability).map(sku => ({
      sku,
      available: variantsAvailability[sku]
    }));

    updateMutation.mutate({
      productAvailable,
      variants: variantsData
    });
  };

  // Toggle product availability
  const toggleProductAvailability = () => {
    setProductAvailable(prev => !prev);
    setHasChanges(true);
  };

  // Toggle single variant availability
  const toggleVariantAvailability = (sku) => {
    setVariantsAvailability(prev => ({
      ...prev,
      [sku]: !prev[sku]
    }));
    setHasChanges(true);
  };

  // Toggle all variants of a specific color
  const toggleColorAvailability = (colorVariants) => {
    const newAvailability = !colorVariants.every(v => variantsAvailability[v.sku]);

    setVariantsAvailability(prev => {
      const updated = { ...prev };
      colorVariants.forEach(variant => {
        updated[variant.sku] = newAvailability;
      });
      return updated;
    });
    setHasChanges(true);
  };

  // Mark product as checked
  const markAsChecked = () => {
    const timestamp = new Date().toISOString();
    const checkData = {
      checked: true,
      timestamp,
      productId: product._id,
      productName: product.name_he
    };

    // Save to localStorage
    const checklistKey = `inventory-check-${product._id}`;
    localStorage.setItem(checklistKey, JSON.stringify(checkData));

    setIsChecked(true);
    setLastCheckedTime(timestamp);

    toast.success('✓ מוצר סומן כנבדק', {
      description: 'הבדיקה נשמרה בהצלחה'
    });
  };

  // Unmark product (for corrections)
  const unmarkAsChecked = () => {
    const checklistKey = `inventory-check-${product._id}`;
    localStorage.removeItem(checklistKey);

    setIsChecked(false);
    setLastCheckedTime(null);

    toast.info('ביטול סימון בדיקה');
  };

  // Open supplier link in popup and auto-mark as checking
  const openSupplierLink = () => {
    const link = product.links?.supplierUrl || product.supplier?.url;

    if (!link) {
      toast.warning('אין קישור ספק למוצר זה');
      return;
    }

    const width = 1200;
    const height = 800;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    const popup = window.open(
      link,
      `supplier-${product._id}`,
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    if (popup) {
      toast.info('🔍 חלון בדיקת ספק נפתח', {
        description: 'סמן זמינות ושמור כשתסיים',
        duration: 4000
      });

      // Track window closure
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);

          // Auto-expand product if not already expanded
          if (!isExpanded) {
            setIsExpanded(true);
          }

          toast.info('✓ חלון נסגר - עדכן זמינות למטה', {
            duration: 3000
          });
        }
      }, 1000);
    } else {
      toast.error('לא הצלחנו לפתוח חלון - בדוק חוסם פופאפים');
    }
  };

  // Group variants by color
  const variantsByColor = {};
  const hasVariants = product.variants && product.variants.length > 0;

  if (hasVariants) {
    product.variants.forEach(variant => {
      const color = variant.color || 'ללא צבע';
      if (!variantsByColor[color]) {
        variantsByColor[color] = [];
      }
      variantsByColor[color].push(variant);
    });
  }

  const colorGroups = Object.entries(variantsByColor);

  // Calculate availability stats
  const totalVariants = product.variants?.length || 0;
  const availableVariants = hasVariants
    ? product.variants.filter(v => variantsAvailability[v.sku]).length
    : 0;

  // Format last checked time
  const formatCheckTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all ${
      isChecked
        ? 'border-green-400 bg-green-50'
        : !productAvailable
          ? 'border-red-300 bg-red-50'
          : 'bg-white border-neutral-200'
    }`}>
      {/* Header */}
      <div className="p-4 bg-white">
        <div className="flex items-start gap-4">
          {/* Checklist Checkbox */}
          <button
            onClick={isChecked ? unmarkAsChecked : markAsChecked}
            className={`flex-shrink-0 mt-1 w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
              isChecked
                ? 'bg-green-500 border-green-600 text-white'
                : 'border-neutral-300 hover:border-green-400 text-transparent hover:text-green-400'
            }`}
            title={isChecked ? 'בוטל סימון (לחץ לביטול)' : 'סמן כנבדק'}
          >
            {isChecked ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>

          {/* Product Image */}
          {product.images && product.images.length > 0 && (
            <img
              src={product.images[0].url || product.images[0]}
              alt={product.name_he || product.name_en || 'Product'}
              className="w-20 h-20 object-cover rounded-lg border border-neutral-200 flex-shrink-0"
            />
          )}

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2">
              <h3 className="font-semibold text-neutral-900 text-lg mb-1 truncate flex-1">
                {product.name_he || product.name_en}
              </h3>
              {isChecked && (
                <span className="flex-shrink-0 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  ✓ נבדק
                </span>
              )}
            </div>

            {product.category && (
              <p className="text-xs text-neutral-500 mb-2">
                {product.category.name?.he || product.category.name}
              </p>
            )}

            {isChecked && lastCheckedTime && (
              <p className="text-xs text-green-600 mb-1">
                נבדק ב: {formatCheckTime(lastCheckedTime)}
              </p>
            )}

            {hasVariants && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-neutral-600">
                  {availableVariants} מתוך {totalVariants} ווריאנטים זמינים
                </span>
                <span className="text-xs text-neutral-400">
                  ({colorGroups.length} צבעים)
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Supplier Link Button */}
            {(product.links?.supplierUrl || product.supplier?.url) && (
              <Button
                onClick={openSupplierLink}
                variant="outline"
                size="sm"
                className="flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                בדוק ספק
              </Button>
            )}

            {/* Product Availability Toggle */}
            <button
              onClick={toggleProductAvailability}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-1.5 ${
                productAvailable
                  ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                  : 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300'
              }`}
            >
              {productAvailable ? (
                <>
                  <Check className="w-4 h-4" />
                  זמין
                </>
              ) : (
                <>
                  <X className="w-4 h-4" />
                  לא זמין
                </>
              )}
            </button>

            {/* Expand/Collapse Button */}
            {hasVariants && (
              <Button
                onClick={() => setIsExpanded(!isExpanded)}
                variant="outline"
                size="sm"
                className="flex items-center gap-1.5"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    סגור
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    הרחב
                  </>
                )}
              </Button>
            )}

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={!hasChanges || updateMutation.isPending}
              size="sm"
              className={`flex items-center gap-1.5 ${
                hasChanges
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
              }`}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  שומר...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  שמור
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Variants Section (Expanded) */}
      {isExpanded && hasVariants && (
        <div className="p-4 bg-neutral-50 border-t border-neutral-200">
          <p className="text-sm font-medium text-neutral-700 mb-3">צבעים ומידות:</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {colorGroups.map(([color, variants]) => {
              const allAvailable = variants.every(v => variantsAvailability[v.sku]);
              const someAvailable = variants.some(v => variantsAvailability[v.sku]);
              const availableCount = variants.filter(v => variantsAvailability[v.sku]).length;

              return (
                <div key={color} className="bg-white border border-neutral-200 rounded-lg p-3">
                  {/* Color Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-neutral-900">{color}</div>
                      {allAvailable ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : someAvailable ? (
                        <div className="w-4 h-4 rounded-full bg-yellow-400" />
                      ) : (
                        <X className="w-4 h-4 text-red-600" />
                      )}
                    </div>

                    <button
                      onClick={() => toggleColorAvailability(variants)}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        allAvailable
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      {availableCount}/{variants.length}
                    </button>
                  </div>

                  {/* Sizes Grid */}
                  <div className="flex flex-wrap gap-1.5">
                    {variants.map((variant) => {
                      const isAvailable = variantsAvailability[variant.sku];

                      return (
                        <button
                          key={variant.sku}
                          onClick={() => toggleVariantAvailability(variant.sku)}
                          className={`px-2.5 py-1.5 rounded text-xs font-medium border transition-all ${
                            isAvailable
                              ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100'
                              : 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100'
                          }`}
                          title={variant.sku}
                        >
                          {variant.size || 'רגיל'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Changes indicator */}
      {hasChanges && (
        <div className="px-4 py-2 bg-yellow-50 border-t border-yellow-200 text-center">
          <p className="text-xs text-yellow-800 font-medium">
            ⚠ יש שינויים שלא נשמרו - לחץ "שמור" לעדכון
          </p>
        </div>
      )}

      {/* Quick check reminder */}
      {!isChecked && isExpanded && (
        <div className="px-4 py-2 bg-blue-50 border-t border-blue-200 text-center">
          <p className="text-xs text-blue-800 font-medium">
            💡 אל תשכח לסמן את המוצר כנבדק אחרי שמירת השינויים
          </p>
        </div>
      )}
    </div>
  );
}
