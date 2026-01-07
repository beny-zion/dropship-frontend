'use client';

import { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChevronDown, ChevronUp, Check, X, Save, Loader2,
  CheckCircle2, Circle, DollarSign, Calculator,
  SplitSquareHorizontal, Maximize2, ExternalLink, AlertTriangle,
  Copy, ClipboardCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { productAvailabilityApi } from '@/lib/api/productAvailability';

export default function ProductInventoryCard({ product, pricingConfig, onChecked, isSelected, onSelect }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [justCopied, setJustCopied] = useState(false);

  // Product level availability
  const [productAvailable, setProductAvailable] = useState(product.stock?.available ?? true);

  // Variants availability - indexed by SKU
  const [variantsAvailability, setVariantsAvailability] = useState({});

  // Checklist state
  const [isChecked, setIsChecked] = useState(false);
  const [lastCheckedTime, setLastCheckedTime] = useState(null);

  // Price update state
  const [newUsdCost, setNewUsdCost] = useState('');
  const [calculatedPrice, setCalculatedPrice] = useState(null);
  const [manualSellPrice, setManualSellPrice] = useState(''); // Manual override for sell price

  // Supplier window reference
  const supplierWindowRef = useRef(null);

  const queryClient = useQueryClient();

  // Get current USD cost from product - check multiple sources
  const currentUsdCost = product.originalPrice?.usd ||
    product.costBreakdown?.baseCost?.usd ||
    product.price?.usd || 0;

  // Get ILS cost if no USD available
  const currentIlsCost = product.originalPrice?.ils ||
    product.costBreakdown?.baseCost?.ils || 0;

  const currentSellPriceIls = product.price?.ils || 0;

  // Check if USD price is missing but ILS exists
  const needsUsdUpdate = currentUsdCost === 0 && currentIlsCost > 0;

  // Initialize checklist state from product data
  useEffect(() => {
    const lastChecked = product.inventoryChecks?.lastChecked;
    if (lastChecked) {
      setIsChecked(true);
      setLastCheckedTime(lastChecked.timestamp);
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

  // Calculate sell price when newUsdCost changes
  useEffect(() => {
    if (newUsdCost && !isNaN(parseFloat(newUsdCost)) && pricingConfig) {
      const usdCost = parseFloat(newUsdCost);
      const { usdToIls, multipliers } = pricingConfig;

      let multiplier;
      if (usdCost <= multipliers.tier1.maxPrice) {
        multiplier = multipliers.tier1.multiplier;
      } else if (usdCost <= multipliers.tier2.maxPrice) {
        multiplier = multipliers.tier2.multiplier;
      } else {
        multiplier = multipliers.tier3.multiplier;
      }

      const sellPriceUsd = Math.round(usdCost * multiplier * 100) / 100;
      // Use manual price if set, otherwise use calculated
      const sellPriceIls = manualSellPrice && !isNaN(parseFloat(manualSellPrice))
        ? parseFloat(manualSellPrice)
        : Math.round(sellPriceUsd * usdToIls);

      const priceDiffPercent = currentSellPriceIls > 0
        ? ((sellPriceIls - currentSellPriceIls) / currentSellPriceIls * 100).toFixed(1)
        : 0;

      setCalculatedPrice({
        usdCost,
        multiplier,
        sellPriceUsd,
        sellPriceIls,
        recommendedPriceIls: Math.round(sellPriceUsd * usdToIls), // Keep the recommended price
        isManualOverride: manualSellPrice && !isNaN(parseFloat(manualSellPrice)),
        priceDiffPercent,
        isIncrease: sellPriceIls > currentSellPriceIls
      });
    } else {
      setCalculatedPrice(null);
    }
  }, [newUsdCost, pricingConfig, currentSellPriceIls, manualSellPrice]);

  // Update availability mutation
  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const hasVariants = product.variants && product.variants.length > 0;

      if (!hasVariants) {
        return await productAvailabilityApi.checkAndUpdate(product._id, {
          available: data.productAvailable,
          notes: 'בדיקה ידנית מעמוד Inventory Check'
        });
      }

      // Batch update for variants
      const changedVariants = [];
      for (const variant of data.variants) {
        const originalVariant = product.variants.find(v => v.sku === variant.sku);
        if (originalVariant && originalVariant.stock?.available !== variant.available) {
          changedVariants.push({ sku: variant.sku, available: variant.available });
        }
      }

      const batchPayload = {
        reason: 'עדכון זמינות מעמוד Inventory Check',
        source: 'inventory_check'
      };

      if (data.productAvailable !== product.stock?.available) {
        batchPayload.product = { available: data.productAvailable };
      }

      if (changedVariants.length > 0) {
        batchPayload.variants = changedVariants;
      }

      return await productAvailabilityApi.batchUpdate(product._id, batchPayload);
    },
    onSuccess: () => {
      toast.success('✓ הזמינות עודכנה בהצלחה');
      setHasChanges(false);
      queryClient.invalidateQueries(['admin', 'products', 'inventory']);
    },
    onError: (error) => {
      toast.error('שגיאה בעדכון', { description: error.message });
    }
  });

  // Update price mutation
  const updatePriceMutation = useMutation({
    mutationFn: async ({ newUsdCost, confirmOnly, overrideSellPrice }) => {
      return await productAvailabilityApi.updatePrice(product._id, {
        newUsdCost: confirmOnly ? undefined : newUsdCost,
        confirmOnly,
        overrideSellPrice, // Manual override for sell price
        notes: confirmOnly ? 'אישור מחיר - ללא שינוי' : `עדכון מחיר ל-$${newUsdCost}${overrideSellPrice ? ` (מחיר מכירה ידני: ₪${overrideSellPrice})` : ''}`
      });
    },
    onSuccess: (response) => {
      const data = response.data;
      if (data.priceChanged) {
        toast.success(
          <div className="space-y-1">
            <p className="font-semibold">✓ מחיר עודכן בהצלחה</p>
            <p className="text-sm">
              ${data.previousCostUsd} → ${data.newCostUsd} ({data.priceDiffPercent}%)
            </p>
            <p className="text-sm">מחיר מכירה: ₪{data.newSellPriceIls}</p>
          </div>
        );
      } else {
        toast.success('✓ מחיר אושר - תאריך בדיקה עודכן');
      }

      setNewUsdCost('');
      setManualSellPrice('');
      setCalculatedPrice(null);
      setIsChecked(true);
      setLastCheckedTime(new Date().toISOString());

      if (onChecked) onChecked();

      queryClient.invalidateQueries(['admin', 'products', 'inventory']);
    },
    onError: (error) => {
      toast.error('שגיאה בעדכון מחיר', { description: error.message });
    }
  });

  // Handle save availability
  const handleSave = () => {
    const variantsData = Object.keys(variantsAvailability).map(sku => ({
      sku,
      available: variantsAvailability[sku]
    }));
    updateMutation.mutate({ productAvailable, variants: variantsData });
  };

  // Handle confirm price (no change)
  const handleConfirmPrice = () => {
    updatePriceMutation.mutate({ confirmOnly: true });
  };

  // Handle update price
  const handleUpdatePrice = () => {
    if (!newUsdCost || isNaN(parseFloat(newUsdCost))) {
      toast.error('יש להזין מחיר תקין');
      return;
    }
    const overrideSellPrice = manualSellPrice && !isNaN(parseFloat(manualSellPrice))
      ? parseFloat(manualSellPrice)
      : undefined;
    updatePriceMutation.mutate({
      newUsdCost: parseFloat(newUsdCost),
      confirmOnly: false,
      overrideSellPrice
    });
  };

  // Toggle functions
  const toggleProductAvailability = () => {
    setProductAvailable(prev => !prev);
    setHasChanges(true);
  };

  const toggleVariantAvailability = (sku) => {
    setVariantsAvailability(prev => ({ ...prev, [sku]: !prev[sku] }));
    setHasChanges(true);
  };

  const toggleColorAvailability = (colorVariants) => {
    const newAvailability = !colorVariants.every(v => variantsAvailability[v.sku]);
    setVariantsAvailability(prev => {
      const updated = { ...prev };
      colorVariants.forEach(variant => { updated[variant.sku] = newAvailability; });
      return updated;
    });
    setHasChanges(true);
  };

  // Mark as checked
  const markAsChecked = async () => {
    const hasVariants = product.variants && product.variants.length > 0;
    let result = 'available';

    if (hasVariants) {
      const allVariants = Object.values(variantsAvailability);
      const anyAvailable = allVariants.some(v => v);
      const allAvailable = allVariants.every(v => v);
      if (!anyAvailable) result = 'unavailable';
      else if (!allAvailable) result = 'partial';
    } else {
      result = productAvailable ? 'available' : 'unavailable';
    }

    try {
      await productAvailabilityApi.recordInventoryCheck(product._id, {
        result,
        notes: 'בדיקה ידנית'
      });

      setIsChecked(true);
      setLastCheckedTime(new Date().toISOString());
      if (onChecked) onChecked();
      toast.success('✓ מוצר סומן כנבדק');
    } catch (error) {
      toast.error('שגיאה בשמירת בדיקה', { description: error.message });
    }
  };

  // Get best available supplier link
  const getSupplierLink = () => {
    return product.links?.supplierUrl ||
           product.supplier?.url ||
           product.links?.amazon ||
           product.links?.affiliateUrl ||
           null;
  };

  // Open supplier in Split View
  const openInSplitView = () => {
    const link = getSupplierLink();

    if (!link) {
      toast.warning('אין קישור ספק למוצר זה');
      return;
    }

    const screenWidth = window.screen.availWidth;
    const screenHeight = window.screen.availHeight;
    const halfWidth = Math.floor(screenWidth / 2);

    // Move current window to left half
    try {
      window.moveTo(0, 0);
      window.resizeTo(halfWidth, screenHeight);
    } catch (e) {
      console.log('Could not resize current window:', e);
    }

    // Open supplier in right half
    const supplierWindow = window.open(
      link,
      'supplier-window',
      `width=${halfWidth},height=${screenHeight},left=${halfWidth},top=0,resizable=yes,scrollbars=yes`
    );

    if (supplierWindow) {
      supplierWindowRef.current = supplierWindow;

      toast.info('🔍 תצוגה מפוצלת הופעלה', {
        description: 'האתר שלנו בצד שמאל, הספק בצד ימין',
        duration: 4000
      });

      // Auto expand
      setIsExpanded(true);

      // Check when supplier window closes
      const checkClosed = setInterval(() => {
        if (supplierWindow.closed) {
          clearInterval(checkClosed);
          supplierWindowRef.current = null;

          // Restore window size
          try {
            window.moveTo(0, 0);
            window.resizeTo(screenWidth, screenHeight);
          } catch (e) {
            console.log('Could not restore window:', e);
          }

          toast.info('✓ חלון ספק נסגר', { duration: 2000 });
        }
      }, 1000);
    } else {
      toast.error('לא הצלחנו לפתוח חלון - בדוק חוסם פופאפים');
    }
  };

  // Open in regular popup
  const openSupplierPopup = () => {
    const link = getSupplierLink();
    if (!link) {
      toast.warning('אין קישור ספק');
      return;
    }

    window.open(link, `supplier-${product._id}`, 'width=1200,height=800,resizable=yes,scrollbars=yes');
    setIsExpanded(true);
  };

  // Supplier link for display
  const supplierLink = getSupplierLink();

  // Copy product name/slug to clipboard
  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setJustCopied(true);
      toast.success(`${type} הועתק!`, { duration: 1500 });
      setTimeout(() => setJustCopied(false), 1500);
    } catch (err) {
      toast.error('שגיאה בהעתקה');
    }
  };

  // Handle card click for selection
  const handleCardClick = (e) => {
    // Don't trigger selection if clicking on interactive elements
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('a')) {
      return;
    }
    if (onSelect) {
      onSelect(product._id);
    }
  };

  // Group variants by color
  const variantsByColor = {};
  const hasVariants = product.variants && product.variants.length > 0;

  if (hasVariants) {
    product.variants.forEach(variant => {
      const color = variant.color || 'ללא צבע';
      if (!variantsByColor[color]) variantsByColor[color] = [];
      variantsByColor[color].push(variant);
    });
  }

  const colorGroups = Object.entries(variantsByColor);
  const totalVariants = product.variants?.length || 0;
  const availableVariants = hasVariants
    ? product.variants.filter(v => variantsAvailability[v.sku]).length : 0;

  // Format time
  const formatCheckTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString('he-IL', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div
      onClick={handleCardClick}
      className={`border-2 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer ${
        isSelected
          ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-300 ring-offset-1'
          : isChecked ? 'border-green-400 bg-green-50'
          : !productAvailable ? 'border-red-300 bg-red-50'
          : 'bg-white border-neutral-200 hover:border-neutral-300'
      }`}
    >
      {/* Header - Responsive */}
      <div className={`p-3 sm:p-4 ${isSelected ? 'bg-purple-50' : 'bg-white'}`}>
        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
          {/* Row 1: Checkbox + Image + Info */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Checklist Checkbox */}
            <button
              onClick={isChecked ? () => setIsChecked(false) : markAsChecked}
              className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
                isChecked
                  ? 'bg-green-500 border-green-600 text-white'
                  : 'border-neutral-300 hover:border-green-400'
              }`}
            >
              {isChecked ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <Circle className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>

            {/* Product Image - Small */}
            {product.images?.length > 0 && (
              <img
                src={product.images[0].url || product.images[0]}
                alt={product.name_he || 'Product'}
                className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg border flex-shrink-0"
              />
            )}

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-sm sm:text-base text-neutral-900 truncate flex-1">
                  {product.name_he || product.name_en}
                </h3>
                {/* Copy Buttons */}
                <button
                  onClick={() => copyToClipboard(product.name_he || product.name_en, 'שם')}
                  className={`p-1 rounded hover:bg-neutral-200 transition-colors ${justCopied ? 'text-green-600' : 'text-neutral-400'}`}
                  title="העתק שם מוצר"
                >
                  {justCopied ? <ClipboardCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                {product.slug && (
                  <button
                    onClick={() => copyToClipboard(product.slug, 'Slug')}
                    className="p-1 rounded hover:bg-neutral-200 transition-colors text-neutral-400 hover:text-neutral-600"
                    title="העתק Slug"
                  >
                    <span className="text-[10px] font-mono">slug</span>
                  </button>
                )}
              </div>

              {/* Price Display - Prominent */}
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {needsUsdUpdate ? (
                  <>
                    {/* Warning - No USD price */}
                    <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 rounded-lg border border-amber-300">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      <span className="text-xs font-semibold text-amber-800">
                        עלות: ₪{currentIlsCost.toFixed(0)} (חסר $)
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-lg">
                    <DollarSign className="w-3 h-3 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-800">
                      עלות: ${currentUsdCost.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-lg">
                  <span className="text-xs font-semibold text-green-800">
                    מכירה: ₪{currentSellPriceIls}
                  </span>
                </div>
              </div>

              {/* Status badges */}
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                  productAvailable
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {productAvailable ? '✓ זמין' : '✗ לא זמין'}
                </span>

                {hasVariants && (
                  <span className="px-2 py-0.5 text-xs text-neutral-600 bg-neutral-100 rounded">
                    {availableVariants}/{totalVariants} מידות
                  </span>
                )}

                {isChecked && (
                  <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                    ✓ נבדק
                  </span>
                )}
              </div>

              {isChecked && lastCheckedTime && (
                <p className="text-xs text-green-600 mt-1">
                  {formatCheckTime(lastCheckedTime)}
                </p>
              )}
            </div>
          </div>

          {/* Row 2: Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:flex-shrink-0">
            {/* Simple External Link Button */}
            {supplierLink && (
              <a
                href={supplierLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg border border-neutral-300 hover:border-blue-400 hover:bg-blue-50 transition-all"
                title="פתח קישור ספק בכרטיסיה חדשה"
              >
                <ExternalLink className="w-4 h-4 text-neutral-600 hover:text-blue-600" />
              </a>
            )}

            {/* Split View Button */}
            {supplierLink && (
              <>
                <Button
                  onClick={openInSplitView}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 text-xs"
                >
                  <SplitSquareHorizontal className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">תצוגה מפוצלת</span>
                  <span className="sm:hidden">Split</span>
                </Button>
                <Button
                  onClick={openSupplierPopup}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 text-xs"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </Button>
              </>
            )}

            {/* Availability Toggle */}
            <button
              onClick={toggleProductAvailability}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                productAvailable
                  ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                  : 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300'
              }`}
            >
              {productAvailable ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
              {productAvailable ? 'זמין' : 'לא זמין'}
            </button>

            {/* Expand Button */}
            {hasVariants && (
              <Button
                onClick={() => setIsExpanded(!isExpanded)}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            )}

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={!hasChanges || updateMutation.isPending}
              size="sm"
              className={`text-xs ${hasChanges ? 'bg-purple-600 hover:bg-purple-700' : 'bg-neutral-300'}`}
            >
              {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Price Update Section - Always visible */}
      <div className={`px-3 sm:px-4 py-3 border-t ${needsUsdUpdate ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2">
              {needsUsdUpdate ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">נדרש עדכון מחיר $:</span>
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">עדכון מחיר:</span>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 flex-1">
              {/* Current Price */}
              <div className={`px-2 py-1 rounded border text-xs ${needsUsdUpdate ? 'bg-amber-100 border-amber-300' : 'bg-white'}`}>
                {needsUsdUpdate ? (
                  <>נוכחי: <span className="font-semibold">₪{currentIlsCost.toFixed(0)}</span> <span className="text-amber-600">(הזן $)</span></>
                ) : (
                  <>נוכחי: <span className="font-semibold">${currentUsdCost.toFixed(2)}</span></>
                )}
              </div>

              {/* New USD Cost Input */}
              <div className="relative min-w-[100px] max-w-[120px]">
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="עלות $"
                  value={newUsdCost}
                  onChange={(e) => setNewUsdCost(e.target.value)}
                  className="w-full pr-6 pl-2 py-1.5 text-sm border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Recommended Price (from calculation) */}
              {calculatedPrice && (
                <div className="px-2 py-1 bg-purple-100 rounded text-xs text-purple-700">
                  מומלץ: ₪{calculatedPrice.recommendedPriceIls}
                </div>
              )}

              {/* Manual Sell Price Override Input */}
              <div className="relative min-w-[100px] max-w-[120px]">
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">₪</span>
                <input
                  type="number"
                  step="1"
                  min="0"
                  placeholder="מכירה (ידני)"
                  value={manualSellPrice}
                  onChange={(e) => setManualSellPrice(e.target.value)}
                  className={`w-full pr-6 pl-2 py-1.5 text-sm border rounded focus:ring-2 focus:ring-green-500 ${
                    manualSellPrice ? 'border-green-400 bg-green-50' : ''
                  }`}
                />
              </div>

              {/* Final Price Preview */}
              {calculatedPrice && (
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  calculatedPrice.isIncrease ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                  → ₪{calculatedPrice.sellPriceIls}
                  {calculatedPrice.isManualOverride && <span className="mr-1">(ידני)</span>}
                  <span className="mr-1">
                    ({calculatedPrice.isIncrease ? '+' : ''}{calculatedPrice.priceDiffPercent}%)
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                onClick={handleConfirmPrice}
                disabled={updatePriceMutation.isPending}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                {updatePriceMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'אשר ללא שינוי'}
              </Button>

              {calculatedPrice && (
                <Button
                  onClick={handleUpdatePrice}
                  disabled={updatePriceMutation.isPending}
                  size="sm"
                  className="text-xs bg-blue-600 hover:bg-blue-700"
                >
                  {updatePriceMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'עדכן מחיר'}
                </Button>
              )}
            </div>
          </div>
        </div>

      {/* Variants Section - Chips Layout */}
      {isExpanded && hasVariants && (
        <div className="p-3 sm:p-4 bg-neutral-50 border-t border-neutral-200">
          <p className="text-xs font-medium text-neutral-600 mb-2">צבעים ומידות:</p>

          <div className="space-y-3">
            {colorGroups.map(([color, variants]) => {
              const allAvailable = variants.every(v => variantsAvailability[v.sku]);
              const availableCount = variants.filter(v => variantsAvailability[v.sku]).length;

              return (
                <div key={color} className="flex flex-wrap items-center gap-2">
                  {/* Color Chip */}
                  <button
                    onClick={() => toggleColorAvailability(variants)}
                    disabled={!productAvailable}
                    className={`px-2 py-1 rounded text-xs font-medium border transition-all ${
                      allAvailable
                        ? 'bg-green-100 text-green-700 border-green-300'
                        : 'bg-red-100 text-red-700 border-red-300'
                    } disabled:opacity-50`}
                  >
                    🎨 {color} ({availableCount}/{variants.length})
                  </button>

                  {/* Size Chips */}
                  {variants.map((variant) => {
                    const isAvailable = variantsAvailability[variant.sku];
                    return (
                      <button
                        key={variant.sku}
                        onClick={() => toggleVariantAvailability(variant.sku)}
                        disabled={!productAvailable}
                        className={`px-2 py-1 rounded text-xs font-medium border transition-all ${
                          isAvailable
                            ? 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100'
                            : 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100'
                        } disabled:opacity-40`}
                      >
                        {variant.size || 'רגיל'}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Changes indicator */}
      {hasChanges && (
        <div className="px-3 py-2 bg-yellow-50 border-t border-yellow-200 text-center">
          <p className="text-xs text-yellow-800 font-medium">
            ⚠ יש שינויים שלא נשמרו
          </p>
        </div>
      )}
    </div>
  );
}
