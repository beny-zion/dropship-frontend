'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, ExternalLink, Check, X, Save, Loader2, CheckCircle2, Circle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { productAvailabilityApi } from '@/lib/api/productAvailability';

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
  const [checkedByName, setCheckedByName] = useState(null);

  const queryClient = useQueryClient();

  // Initialize checklist state from product data (already loaded from server)
  useEffect(() => {
    const lastChecked = product.inventoryChecks?.lastChecked;

    if (lastChecked) {
      setIsChecked(true);
      setLastCheckedTime(lastChecked.timestamp);
      setCheckedByName(lastChecked.checkedByName);
    }
  }, [product._id, product.inventoryChecks]);

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

  // Update mutation using new centralized API
  const updateMutation = useMutation({
    mutationFn: async (data) => {
      console.log('🟢 [ProductInventoryCard] ===== התחלה =====');
      console.log('🟢 [ProductInventoryCard] Product ID:', product._id);
      console.log('🟢 [ProductInventoryCard] Has variants:', hasVariants);
      console.log('🟢 [ProductInventoryCard] Data received:', data);

      // If product has no variants, use simple update
      if (!hasVariants) {
        console.log('🟢 [ProductInventoryCard] No variants - using checkAndUpdate');
        const payload = {
          available: data.productAvailable,
          notes: 'בדיקה ידנית מעמוד Inventory Check'
        };
        console.log('🟢 [ProductInventoryCard] Payload:', payload);

        const response = await productAvailabilityApi.checkAndUpdate(product._id, payload);
        console.log('🟢 [ProductInventoryCard] Response:', response);
        return response;
      }

      // ✅ For products with variants - use BATCH UPDATE! (much faster!)
      console.log('🟢 [ProductInventoryCard] Has variants - using BATCH UPDATE');

      // Prepare batch payload
      const changedVariants = [];
      for (const variant of data.variants) {
        const originalVariant = product.variants.find(v => v.sku === variant.sku);
        if (originalVariant && originalVariant.stock?.available !== variant.available) {
          changedVariants.push({
            sku: variant.sku,
            available: variant.available
          });
        }
      }

      const batchPayload = {
        reason: 'עדכון זמינות מעמוד Inventory Check',
        source: 'inventory_check'
      };

      // Add product update if changed
      if (data.productAvailable !== product.stock?.available) {
        batchPayload.product = {
          available: data.productAvailable
        };
      }

      // Add variants if any changed
      if (changedVariants.length > 0) {
        batchPayload.variants = changedVariants;
      }

      console.log('🟢 [ProductInventoryCard] Batch payload:', {
        productChanged: !!batchPayload.product,
        variantsChanged: changedVariants.length
      });

      // Single API call for everything!
      const response = await productAvailabilityApi.batchUpdate(product._id, batchPayload);
      console.log('🟢 [ProductInventoryCard] Batch update completed!');
      console.log('  - Stats:', response.data?.stats);

      return response;
    },
    onSuccess: (response) => {
      // Response structure: { success: true, data: { ... } }
      const data = response.data || response;

      // Check if this is a batch response
      if (data.stats) {
        const { totalVariants, successfulVariants, failedVariants } = data.stats;
        if (totalVariants > 0) {
          toast.success(
            <div className="space-y-1">
              <p className="font-semibold">✓ הזמינות עודכנה בהצלחה</p>
              <p className="text-sm">
                🚀 {successfulVariants} ווריאנטים עודכנו בקריאה אחת!
                {failedVariants > 0 && ` (${failedVariants} נכשלו)`}
              </p>
            </div>,
            { duration: 5000 }
          );
        } else {
          toast.success('✓ המוצר עודכן בהצלחה');
        }
      }
      // Check for cascade effects (from product update)
      else if (data.product?.cascadeResult?.cascaded) {
        const affectedCount = data.product.cascadeResult.affectedVariants?.length || 0;
        toast.success(
          <div className="space-y-1">
            <p className="font-semibold">✓ הזמינות עודכנה בהצלחה</p>
            <p className="text-sm">🌊 {affectedCount} ווריאנטים עודכנו אוטומטית</p>
          </div>,
          { duration: 6000 }
        );
      } else {
        toast.success('✓ הזמינות עודכנה בהצלחה');
      }

      // Check for price changes
      if (data.priceChangeDetected?.isSignificant) {
        const { priceDiff, previousPrice, newPrice } = data.priceChangeDetected;
        toast.warning(
          <div className="space-y-1">
            <p className="font-semibold flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              שינוי מחיר משמעותי זוהה!
            </p>
            <p className="text-sm">
              המחיר עלה ב-{priceDiff.toFixed(1)}% (מ-₪{previousPrice.toFixed(0)} ל-₪{newPrice.toFixed(0)})
            </p>
          </div>,
          { duration: 8000 }
        );
      }

      // Show affected orders/carts
      if (data.affectedOrders?.length > 0 || data.affectedCarts?.length > 0) {
        const ordersCount = data.affectedOrders?.length || 0;
        const cartsCount = data.affectedCarts?.length || 0;
        toast.info(
          <div className="space-y-1">
            <p className="font-semibold">📦 עדכון נוסף</p>
            <p className="text-sm">
              {ordersCount > 0 && `${ordersCount} הזמנות `}
              {ordersCount > 0 && cartsCount > 0 && 'ו-'}
              {cartsCount > 0 && `${cartsCount} עגלות `}
              עודכנו
            </p>
          </div>,
          { duration: 5000 }
        );
      }

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

  // Mark product as checked - save to server
  const markAsChecked = async () => {
    console.log('🔵 [markAsChecked] Starting...');

    const timestamp = new Date().toISOString();
    const hasVariants = product.variants && product.variants.length > 0;

    // Determine result based on current availability
    let result = 'available';
    if (hasVariants) {
      const allVariants = Object.values(variantsAvailability);
      const anyAvailable = allVariants.some(v => v);
      const allAvailable = allVariants.every(v => v);

      if (!anyAvailable) {
        result = 'unavailable';
      } else if (!allAvailable) {
        result = 'partial';
      }
    } else {
      result = productAvailable ? 'available' : 'unavailable';
    }

    // Create variants snapshot
    const variantsSnapshot = hasVariants
      ? product.variants.map(v => ({
          sku: v.sku,
          available: variantsAvailability[v.sku] ?? true
        }))
      : [];

    try {
      const response = await productAvailabilityApi.recordInventoryCheck(product._id, {
        result,
        notes: 'בדיקה ידנית מעמוד Inventory Check',
        variantsSnapshot
      });

      console.log('✅ [markAsChecked] Saved to server:', response);

      setIsChecked(true);
      setLastCheckedTime(timestamp);
      setCheckedByName(response.data?.lastChecked?.checkedByName || 'אתה');

      toast.success('✓ מוצר סומן כנבדק', {
        description: 'הבדיקה נשמרה בשרת בהצלחה'
      });
    } catch (error) {
      console.error('❌ [markAsChecked] Error:', error);
      toast.error('שגיאה בשמירת בדיקת זמינות', {
        description: error.response?.data?.message || error.message
      });
    }
  };

  // Unmark product (for corrections) - currently just clears local state
  // We keep history on server, but allow user to re-check
  const unmarkAsChecked = () => {
    setIsChecked(false);
    setLastCheckedTime(null);
    setCheckedByName(null);

    toast.info('ביטול סימון בדיקה', {
      description: 'ניתן לסמן שוב את המוצר כנבדק'
    });
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
            <div className="flex items-start gap-2 mb-2">
              <h3 className="font-semibold text-neutral-900 text-lg truncate flex-1">
                {product.name_he || product.name_en}
              </h3>
              {isChecked && (
                <span className="flex-shrink-0 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  ✓ נבדק
                </span>
              )}
            </div>

            {/* Single Availability Status */}
            <div className="mb-2">
              <span className={`inline-block px-3 py-1.5 text-sm font-semibold rounded-lg border-2 ${
                productAvailable
                  ? 'bg-green-100 text-green-800 border-green-400'
                  : 'bg-red-100 text-red-800 border-red-400'
              }`}>
                {productAvailable ? '✓ זמין' : '✗ לא זמין'}
              </span>
            </div>

            {product.category && (
              <p className="text-xs text-neutral-500 mb-2">
                קטגוריה: {product.category.name?.he || product.category.name}
              </p>
            )}

            {isChecked && lastCheckedTime && (
              <p className="text-xs text-green-600 mb-1">
                נבדק ב: {formatCheckTime(lastCheckedTime)}
                {checkedByName && <span className="text-neutral-500"> על ידי {checkedByName}</span>}
              </p>
            )}

            {hasVariants ? (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-neutral-600">
                  🎨 {colorGroups.length} צבעים
                </span>
                <span className="text-neutral-400">|</span>
                <span className="text-neutral-600">
                  📏 {availableVariants}/{totalVariants} מידות זמינות
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-neutral-500 italic">
                  📦 מוצר פשוט (אין ווריאנטים)
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

      {/* Variants Section (Expanded) - צבעים ומידות */}
      {isExpanded && hasVariants && (
        <div className="p-4 bg-neutral-50 border-t border-neutral-200">
          <div className="flex items-center gap-2 mb-4">
            <p className="text-sm font-semibold text-neutral-800">🎨 צבעים → 📏 מידות</p>
            <p className="text-xs text-neutral-500">לחץ על כפתור צבע להחלפת כל המידות שלו</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {colorGroups.map(([color, variants]) => {
              const allAvailable = variants.every(v => variantsAvailability[v.sku]);
              const someAvailable = variants.some(v => variantsAvailability[v.sku]);
              const availableCount = variants.filter(v => variantsAvailability[v.sku]).length;

              return (
                <div
                  key={color}
                  className={`bg-white rounded-lg p-3 border-2 transition-all ${
                    allAvailable
                      ? 'border-green-300 shadow-sm'
                      : someAvailable
                        ? 'border-yellow-300 shadow-sm'
                        : 'border-red-300'
                  }`}
                >
                  {/* Color Header */}
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-200">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🎨</span>
                      <div className="font-semibold text-neutral-900">{color}</div>
                      {allAvailable ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : someAvailable ? (
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      ) : (
                        <X className="w-4 h-4 text-red-600" />
                      )}
                    </div>

                    <button
                      onClick={() => toggleColorAvailability(variants)}
                      disabled={!productAvailable}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors border ${
                        allAvailable
                          ? 'bg-green-100 text-green-700 hover:bg-green-200 border-green-300'
                          : 'bg-red-100 text-red-700 hover:bg-red-200 border-red-300'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      title={!productAvailable ? 'המוצר הראשי לא זמין' : 'החלף זמינות כל המידות'}
                    >
                      {availableCount}/{variants.length}
                    </button>
                  </div>

                  {/* Parent unavailable warning */}
                  {!productAvailable && (
                    <div className="mb-2 p-2 bg-amber-50 border border-amber-300 rounded text-xs text-amber-700">
                      ⚠️ המוצר הראשי לא זמין - כל הצבעים והמידות לא זמינים אוטומטית
                    </div>
                  )}

                  {/* Sizes Grid */}
                  <div>
                    <p className="text-xs text-neutral-500 mb-2">📏 מידות:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {variants.map((variant) => {
                        const isAvailable = variantsAvailability[variant.sku];

                        return (
                          <button
                            key={variant.sku}
                            onClick={() => toggleVariantAvailability(variant.sku)}
                            disabled={!productAvailable}
                            className={`px-3 py-2 rounded-md text-xs font-medium border-2 transition-all ${
                              isAvailable
                                ? 'bg-green-50 border-green-400 text-green-800 hover:bg-green-100 hover:border-green-500'
                                : 'bg-red-50 border-red-400 text-red-800 hover:bg-red-100 hover:border-red-500'
                            } disabled:opacity-40 disabled:cursor-not-allowed`}
                            title={`SKU: ${variant.sku}${!productAvailable ? ' (מוצר ראשי לא זמין)' : ''}`}
                          >
                            {variant.size || 'רגיל'}
                          </button>
                        );
                      })}
                    </div>
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
