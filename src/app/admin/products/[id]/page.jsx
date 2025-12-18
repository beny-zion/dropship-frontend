// app/admin/products/[id]/page.jsx - Product Editor (Clean Separation)

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { adminApi } from '@/lib/api/admin';
import { getCategories } from '@/lib/api/categories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Save, Loader2, Eye, DollarSign, Calculator, Info, Image as ImageIcon, ExternalLink, ShoppingCart, FolderPlus } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import ImageUpload from '@/components/admin/ImageUpload';
import VariantManager from '@/components/admin/VariantManager';
import TagInput from '@/components/admin/TagInput';
import Image from 'next/image';

export default function ProductEditPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const isNew = params.id === 'new';
  const [viewMode, setViewMode] = useState('calculator'); // 'preview', 'calculator', or 'none'

  const { register, handleSubmit, formState: { errors }, reset, watch, control } = useForm({
    defaultValues: {
      asin: '',
      name_he: '',
      name_en: '',
      description_he: '',
      description_en: '',
      category: '',
      subcategory: '',
      tags: '',
      // מחירים
      'price.ils': '',
      'price.usd': '',
      'originalPrice.ils': '',
      'originalPrice.usd': '',
      discount: '',
      // פירוט עלויות
      'costBreakdown.baseCost.ils': '',
      'costBreakdown.baseCost.usd': '',
      'costBreakdown.taxPercent': 18,
      'costBreakdown.shippingCost.ils': '',
      'costBreakdown.shippingCost.usd': '',
      'costBreakdown.additionalFees.ils': '',
      'costBreakdown.additionalFees.usd': '',
      'costBreakdown.profitMargin': 0,
      'costBreakdown.notes': '',
      // מלאי - ללא stock.available! רק tracking
      'stock.quantity': null,
      'stock.trackInventory': false,
      'stock.lowStockThreshold': 5,
      // משלוח
      'shipping.freeShipping': false,
      'shipping.estimatedDays': 14,
      'shipping.cost': '',
      // מפרט טכני
      'specifications.brand': '',
      'specifications.model': '',
      'specifications.weight': '',
      'specifications.dimensions': '',
      'specifications.material': '',
      features: '',
      // ווריאנטים
      variants: [],
      // ספק
      'supplier.name': 'Amazon',
      'supplier.url': '',
      'supplier.notes': '',
      // קישורים
      'links.amazon': '',
      'links.affiliateUrl': '',
      'links.supplierUrl': '',
      // הגדרות - ללא status!
      featured: false,
      images: []
    }
  });

  // Watch all form values for live preview
  const formValues = watch();

  // Watch specific fields for calculator
  const priceIls = useWatch({ control, name: 'price.ils' });
  const priceUsd = useWatch({ control, name: 'price.usd' });
  const originalPriceIls = useWatch({ control, name: 'originalPrice.ils' });
  const originalPriceUsd = useWatch({ control, name: 'originalPrice.usd' });
  const baseCostIls = useWatch({ control, name: 'costBreakdown.baseCost.ils' });
  const baseCostUsd = useWatch({ control, name: 'costBreakdown.baseCost.usd' });
  const taxPercent = useWatch({ control, name: 'costBreakdown.taxPercent' });
  const shippingCostIls = useWatch({ control, name: 'costBreakdown.shippingCost.ils' });
  const shippingCostUsd = useWatch({ control, name: 'costBreakdown.shippingCost.usd' });
  const additionalFeesIls = useWatch({ control, name: 'costBreakdown.additionalFees.ils' });
  const additionalFeesUsd = useWatch({ control, name: 'costBreakdown.additionalFees.usd' });
  const estimatedDays = useWatch({ control, name: 'shipping.estimatedDays' });

  // Watch purchase links
  const amazonLink = useWatch({ control, name: 'links.amazon' });
  const supplierUrlLink = useWatch({ control, name: 'links.supplierUrl' });
  const supplierUrl = useWatch({ control, name: 'supplier.url' });
  const supplierName = useWatch({ control, name: 'supplier.name' });
  const supplierNotes = useWatch({ control, name: 'supplier.notes' });

  const hasPurchaseLink = !!(amazonLink || supplierUrlLink || supplierUrl);

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories', false],
    queryFn: () => getCategories(false)
  });

  const categories = categoriesData?.data || [];

  // Fetch product if editing
  const { data: productData, isLoading } = useQuery({
    queryKey: ['admin', 'product', params.id],
    queryFn: () => adminApi.getProductById(params.id),
    enabled: !isNew
  });

  const product = productData?.data?.product;

  // Set form values when product data loads
  useEffect(() => {
    if (product) {
      reset({
        asin: product.asin || '',
        name_he: product.name_he || '',
        name_en: product.name_en || '',
        description_he: product.description_he || '',
        description_en: product.description_en || '',
        category: product.category?._id || product.category || '',
        subcategory: product.subcategory || '',
        tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
        'price.ils': product.price?.ils || 0,
        'price.usd': product.price?.usd || 0,
        'originalPrice.ils': product.originalPrice?.ils || '',
        'originalPrice.usd': product.originalPrice?.usd || '',
        discount: product.discount || 0,
        'costBreakdown.baseCost.ils': product.costBreakdown?.baseCost?.ils || 0,
        'costBreakdown.baseCost.usd': product.costBreakdown?.baseCost?.usd || 0,
        'costBreakdown.taxPercent': product.costBreakdown?.taxPercent || 18,
        'costBreakdown.shippingCost.ils': product.costBreakdown?.shippingCost?.ils || 0,
        'costBreakdown.shippingCost.usd': product.costBreakdown?.shippingCost?.usd || 0,
        'costBreakdown.additionalFees.ils': product.costBreakdown?.additionalFees?.ils || 0,
        'costBreakdown.additionalFees.usd': product.costBreakdown?.additionalFees?.usd || 0,
        'costBreakdown.profitMargin': product.costBreakdown?.profitMargin || 0,
        'costBreakdown.notes': product.costBreakdown?.notes || '',
        'stock.quantity': product.stock?.quantity,
        'stock.trackInventory': product.stock?.trackInventory || false,
        'stock.lowStockThreshold': product.stock?.lowStockThreshold || 5,
        'shipping.freeShipping': product.shipping?.freeShipping || false,
        'shipping.estimatedDays': product.shipping?.estimatedDays || 14,
        'shipping.cost': product.shipping?.cost || 0,
        'specifications.brand': product.specifications?.brand || '',
        'specifications.model': product.specifications?.model || '',
        'specifications.weight': product.specifications?.weight || '',
        'specifications.dimensions': product.specifications?.dimensions || '',
        'specifications.material': product.specifications?.material || '',
        features: Array.isArray(product.features) ? product.features.join('\n') : '',
        variants: product.variants || [],
        'supplier.name': product.supplier?.name || 'Amazon',
        'supplier.url': product.supplier?.url || '',
        'supplier.notes': product.supplier?.notes || '',
        'links.amazon': product.links?.amazon || '',
        'links.affiliateUrl': product.links?.affiliateUrl || '',
        'links.supplierUrl': product.links?.supplierUrl || '',
        featured: product.featured || false,
        images: product.images || []
      });
    }
  }, [product, reset]);

  // Calculate total cost and profit
  const costCalculation = useMemo(() => {
    const baseCost = parseFloat(baseCostIls) || 0;
    const taxPercentValue = parseFloat(taxPercent) || 18;
    const shippingCost = parseFloat(shippingCostIls) || 0;
    const additionalFees = parseFloat(additionalFeesIls) || 0;
    const sellPriceWithVat = parseFloat(priceIls) || 0;

    const inputVAT = (baseCost + shippingCost) * (taxPercentValue / 100);
    const outputVAT = sellPriceWithVat * (taxPercentValue / (100 + taxPercentValue));
    const vatToPayment = outputVAT - inputVAT;
    const sellPriceWithoutVat = sellPriceWithVat - outputVAT;
    const totalProductCost = baseCost + shippingCost + additionalFees;
    const netProfit = sellPriceWithoutVat - totalProductCost - vatToPayment;
    const profitPercent = sellPriceWithVat > 0 ? (netProfit / sellPriceWithVat) * 100 : 0;

    return {
      baseCost,
      shippingCost,
      additionalFees,
      inputVAT,
      outputVAT,
      vatToPayment,
      totalProductCost,
      sellPriceWithVat,
      sellPriceWithoutVat,
      netProfit,
      profitPercent,
      taxPercentValue
    };
  }, [baseCostIls, taxPercent, shippingCostIls, additionalFeesIls, priceIls]);

  // ✅ Clean Update Mutation - NO availability logic!
  const updateMutation = useMutation({
    mutationFn: async (data) => {
      console.log('🔵 [ProductEdit] Updating product data only (no availability changes)');

      if (isNew) {
        return await adminApi.createProduct(data);
      } else {
        return await adminApi.updateProduct(params.id, data);
      }
    },
    onSuccess: () => {
      toast.success(isNew ? 'המוצר נוצר בהצלחה' : 'המוצר עודכן בהצלחה');
      queryClient.invalidateQueries(['admin', 'products']);
      queryClient.invalidateQueries(['admin', 'products', 'inventory']);
      router.push('/admin/products');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'שגיאה בשמירת המוצר');
    }
  });

  const onSubmit = async (data) => {
    if (!hasPurchaseLink) {
      toast.error('חובה למלא לפחות לינק קניה אחד! (אמזון או ספק)');
      return;
    }

    try {
      const hasNewImages = (data.images || []).some(img => img.isNew && img.fileData);
      if (hasNewImages) {
        toast.info('מעלה תמונות לקלאודינרי...');
      }

      const processImage = async (image) => {
        if (image.isNew && image.fileData) {
          const response = await adminApi.uploadImage({ fileData: image.fileData });
          if (response && response.success && response.data) {
            return {
              url: response.data.url,
              publicId: response.data.publicId,
              alt: image.alt,
              isPrimary: image.isPrimary
            };
          } else {
            throw new Error('העלאת התמונה נכשלה');
          }
        }

        if (image.url && image.url.startsWith('data:')) {
          throw new Error('לא ניתן לשמור תמונות base64 במסד הנתונים');
        }

        return {
          url: image.url,
          publicId: image.publicId,
          alt: image.alt,
          isPrimary: image.isPrimary
        };
      };

      const processedImages = await Promise.all(
        (data.images || []).map(processImage)
      );

      const processedVariants = await Promise.all(
        (data.variants || []).map(async (variant) => {
          const { _id, ...variantWithoutId } = variant;
          const cleanVariant = _id && typeof _id === 'string' ? variant : variantWithoutId;

          if (variant.images && variant.images.length > 0) {
            const processedVariantImages = await Promise.all(
              variant.images.map(processImage)
            );
            return {
              ...cleanVariant,
              images: processedVariantImages
            };
          }
          return cleanVariant;
        })
      );

      // ✅ Build product data WITHOUT stock.available field!
      const productData = {
        asin: data.asin,
        name_he: data.name_he,
        name_en: data.name_en,
        description_he: data.description_he,
        description_en: data.description_en,
        category: data.category,
        subcategory: data.subcategory,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        price: {
          ils: priceIls ? parseFloat(priceIls) : 0,
          usd: priceUsd ? parseFloat(priceUsd) : 0
        },
        originalPrice: {
          ils: originalPriceIls ? parseFloat(originalPriceIls) : undefined,
          usd: originalPriceUsd ? parseFloat(originalPriceUsd) : undefined
        },
        discount: parseFloat(data.discount) || 0,
        costBreakdown: {
          baseCost: {
            ils: baseCostIls ? parseFloat(baseCostIls) : 0,
            usd: baseCostUsd ? parseFloat(baseCostUsd) : 0
          },
          taxPercent: taxPercent ? parseFloat(taxPercent) : 18,
          shippingCost: {
            ils: shippingCostIls ? parseFloat(shippingCostIls) : 0,
            usd: shippingCostUsd ? parseFloat(shippingCostUsd) : 0
          },
          additionalFees: {
            ils: additionalFeesIls ? parseFloat(additionalFeesIls) : 0,
            usd: additionalFeesUsd ? parseFloat(additionalFeesUsd) : 0
          },
          profitMargin: parseFloat(data['costBreakdown.profitMargin']) || 0,
          notes: data['costBreakdown.notes']
        },
        stock: {
          // ❌ NO available field!
          quantity: data['stock.trackInventory'] ? parseInt(data['stock.quantity']) : null,
          trackInventory: data['stock.trackInventory'] === true,
          lowStockThreshold: parseInt(data['stock.lowStockThreshold']) || 5
        },
        shipping: {
          freeShipping: data['shipping.freeShipping'],
          estimatedDays: estimatedDays ? parseInt(estimatedDays) : 14,
          cost: parseFloat(data['shipping.cost']) || 0
        },
        specifications: {
          brand: data['specifications.brand'],
          model: data['specifications.model'],
          weight: data['specifications.weight'],
          dimensions: data['specifications.dimensions'],
          material: data['specifications.material']
        },
        features: data.features ? data.features.split('\n').map(f => f.trim()).filter(Boolean) : [],
        variants: processedVariants,
        supplier: {
          name: supplierName || 'Amazon',
          url: supplierUrl || '',
          notes: supplierNotes || ''
        },
        links: {
          amazon: amazonLink || '',
          affiliateUrl: data['links.affiliateUrl'] || '',
          supplierUrl: supplierUrlLink || ''
        },
        featured: data.featured,
        images: processedImages
      };

      updateMutation.mutate(productData);
    } catch (error) {
      toast.error('שגיאה בעיבוד התמונות');
      console.error('Error processing images:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const primaryImage = formValues.images?.find(img => img.isPrimary) || formValues.images?.[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/products">
              <ArrowRight className="w-4 h-4 ml-2" />
              חזרה לרשימה
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isNew ? 'הוספת מוצר חדש' : 'עריכת מוצר'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              עדכן פרטי מוצר, מחירים וווריאנטים
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'preview' ? 'default' : 'outline'}
            onClick={() => setViewMode(viewMode === 'preview' ? 'none' : 'preview')}
          >
            <Eye className="w-4 h-4 ml-2" />
            תצוגת דף
          </Button>
          <Button
            variant={viewMode === 'calculator' ? 'default' : 'outline'}
            onClick={() => setViewMode(viewMode === 'calculator' ? 'none' : 'calculator')}
          >
            <Calculator className="w-4 h-4 ml-2" />
            מחשבון
          </Button>
        </div>
      </div>

      {/* לינק קניה מהיר */}
      {!isNew && (formValues['links.amazon'] || formValues['links.supplierUrl'] || formValues['supplier.url']) && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-5 h-5 text-green-700" />
              <div>
                <h3 className="font-semibold text-green-900">לינק קניה מהיר לעובדים</h3>
                <p className="text-sm text-green-700">לחץ כדי להזמין מוצר זה אצל הספק</p>
              </div>
            </div>
            <Button
              asChild
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <a
                href={formValues['links.amazon'] || formValues['links.supplierUrl'] || formValues['supplier.url']}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4 ml-2" />
                הזמן עכשיו
              </a>
            </Button>
          </div>
        </div>
      )}

      <div className={`grid gap-6 ${viewMode !== 'none' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Form */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* קישורי קניה */}
            <div className={`rounded-lg border-2 p-6 transition-colors ${
              hasPurchaseLink
                ? 'bg-white border-gray-200'
                : 'bg-red-50 border-red-300'
            }`}>
              <div className="flex items-center gap-2 mb-4">
                <ExternalLink className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold">קישורי קניה</h2>
                {!hasPurchaseLink && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-bold">
                    חובה למלא לפחות אחד!
                  </span>
                )}
                {hasPurchaseLink && (
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded font-bold">
                    ✓
                  </span>
                )}
              </div>

              {!hasPurchaseLink && (
                <div className="bg-red-100 border border-red-300 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-800 font-medium">
                    ⚠️ חובה להזין לפחות לינק אחד לרכישה! העובדים צריכים לדעת איפה להזמין את המוצר.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="links.amazon"
                    className={!hasPurchaseLink ? "text-red-700 font-semibold" : ""}
                  >
                    קישור למוצר באמזון {!hasPurchaseLink && "*"}
                  </Label>
                  <Input
                    id="links.amazon"
                    type="url"
                    {...register('links.amazon')}
                    className={`mt-1 border-2 ${
                      !hasPurchaseLink
                        ? 'border-red-300 bg-red-50 focus:border-red-500'
                        : 'border-gray-300 focus:border-blue-500'
                    }`}
                    dir="ltr"
                    placeholder="https://www.amazon.com/..."
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    למוצרים מאמזון
                  </p>
                </div>

                <div>
                  <Label htmlFor="links.affiliateUrl">קישור Affiliate (אופציונלי)</Label>
                  <Input
                    id="links.affiliateUrl"
                    type="url"
                    {...register('links.affiliateUrl')}
                    className="mt-1"
                    dir="ltr"
                    placeholder="https://amzn.to/..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    לשיווק - לא נדרש לצורך הזמנה
                  </p>
                </div>

                <div>
                  <Label
                    htmlFor="links.supplierUrl"
                    className={!hasPurchaseLink ? "text-red-700 font-semibold" : ""}
                  >
                    קישור למוצר אצל הספק {!hasPurchaseLink && "*"}
                  </Label>
                  <Input
                    id="links.supplierUrl"
                    type="url"
                    {...register('links.supplierUrl')}
                    className={`mt-1 border-2 ${
                      !hasPurchaseLink
                        ? 'border-red-300 bg-red-50 focus:border-red-500'
                        : 'border-gray-300 focus:border-blue-500'
                    }`}
                    dir="ltr"
                    placeholder="https://karllagerfeldparis.com/products/..."
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    לספקים שאינם אמזון - קישור ישיר למוצר
                  </p>
                </div>
              </div>
            </div>

            {/* תמונות */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">תמונות המוצר</h2>
              <Controller
                name="images"
                control={control}
                defaultValue={[]}
                render={({ field }) => (
                  <ImageUpload
                    images={field.value || []}
                    onChange={field.onChange}
                    maxImages={5}
                  />
                )}
              />
            </div>

            {/* פרטים כלליים */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">פרטים כלליים</h2>

              <div className="space-y-4">
                {/* ASIN */}
                <div>
                  <Label htmlFor="asin">ASIN (אופציונלי)</Label>
                  <Input
                    id="asin"
                    {...register('asin')}
                    className="mt-1"
                    placeholder="B08N5WRWNW"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    רק למוצרי אמזון - אופציונלי למוצרים מספקים אחרים
                  </p>
                  {errors.asin && (
                    <p className="text-sm text-red-600 mt-1">{errors.asin.message}</p>
                  )}
                </div>

                {/* Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category" className={formValues.category ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                      קטגוריה * {formValues.category && "✓"}
                    </Label>
                    <div className="flex gap-2">
                      <select
                        id="category"
                        {...register('category', { required: 'שדה חובה' })}
                        disabled={categoriesLoading}
                        className={`mt-1 flex-1 px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          formValues.category
                            ? 'border-green-300 bg-green-50 focus:bg-white'
                            : 'border-red-300 bg-red-50 focus:bg-white'
                        }`}
                      >
                        <option value="">
                          {categoriesLoading ? 'טוען קטגוריות...' : 'בחר קטגוריה'}
                        </option>
                        {categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name.he}
                          </option>
                        ))}
                      </select>
                      {categories.length === 0 && !categoriesLoading && (
                        <Link href="/admin/categories" target="_blank">
                          <Button type="button" variant="outline" size="sm" className="mt-1">
                            <FolderPlus className="w-4 h-4 ml-1" />
                            צור קטגוריה
                          </Button>
                        </Link>
                      )}
                    </div>
                    {errors.category && (
                      <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="subcategory">תת-קטגוריה</Label>
                    <Input
                      id="subcategory"
                      {...register('subcategory')}
                      className="mt-1"
                      placeholder="למשל: מחשבים ניידים"
                    />
                  </div>
                </div>

                {/* Hebrew Name */}
                <div>
                  <Label htmlFor="name_he" className={formValues.name_he ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                    שם המוצר (עברית) * {formValues.name_he && "✓"}
                  </Label>
                  <Input
                    id="name_he"
                    {...register('name_he', { required: 'שדה חובה' })}
                    className={`mt-1 border-2 focus:border-blue-500 ${
                      formValues.name_he
                        ? 'border-green-300 bg-green-50 focus:bg-white'
                        : 'border-red-300 bg-red-50 focus:bg-white'
                    }`}
                    placeholder="מחשב נייד Dell XPS 13"
                  />
                  {errors.name_he && (
                    <p className="text-sm text-red-600 mt-1">{errors.name_he.message}</p>
                  )}
                </div>

                {/* English Name */}
                <div>
                  <Label htmlFor="name_en">שם המוצר (אנגלית)</Label>
                  <Input
                    id="name_en"
                    {...register('name_en')}
                    className="mt-1"
                    dir="ltr"
                    placeholder="Dell XPS 13 Laptop"
                  />
                </div>

                {/* Description Hebrew */}
                <div>
                  <Label htmlFor="description_he" className={formValues.description_he ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                    תיאור המוצר (עברית) * {formValues.description_he && "✓"}
                  </Label>
                  <Textarea
                    id="description_he"
                    {...register('description_he', { required: 'שדה חובה' })}
                    className={`mt-1 border-2 focus:border-blue-500 ${
                      formValues.description_he
                        ? 'border-green-300 bg-green-50 focus:bg-white'
                        : 'border-red-300 bg-red-50 focus:bg-white'
                    }`}
                    rows={5}
                    placeholder="תיאור מפורט של המוצר..."
                  />
                  {errors.description_he && (
                    <p className="text-sm text-red-600 mt-1">{errors.description_he.message}</p>
                  )}
                </div>

                {/* Description English */}
                <div>
                  <Label htmlFor="description_en">תיאור המוצר (אנגלית)</Label>
                  <Textarea
                    id="description_en"
                    {...register('description_en')}
                    className="mt-1"
                    rows={4}
                    dir="ltr"
                    placeholder="Detailed product description..."
                  />
                </div>

                {/* Tags */}
                <Controller
                  name="tags"
                  control={control}
                  render={({ field }) => (
                    <TagInput
                      value={field.value}
                      onChange={field.onChange}
                      label="תגיות לשיפור החיפוש"
                      placeholder="הקלד תג או בחר מהרשימה..."
                    />
                  )}
                />
              </div>
            </div>

            {/* מחיר ועלויות */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold">מחיר לצרכן</h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price.ils" className={priceIls && parseFloat(priceIls) > 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                      מחיר למכירה (₪) * {priceIls && parseFloat(priceIls) > 0 && "✓"}
                    </Label>
                    <Input
                      id="price.ils"
                      type="text"
                      inputMode="decimal"
                      {...register('price.ils', {
                        required: 'שדה חובה',
                        min: { value: 0.01, message: 'המחיר חייב להיות חיובי' },
                        validate: value => !value || /^\d+\.?\d*$/.test(value) || 'יש להזין מספר חיובי בלבד'
                      })}
                      className={`mt-1 border-2 focus:border-blue-500 transition-colors ${
                        priceIls && parseFloat(priceIls) > 0
                          ? 'border-green-300 bg-green-50 focus:bg-white'
                          : 'border-red-300 bg-red-50 focus:bg-white'
                      }`}
                      placeholder="299.90"
                    />
                    {errors['price.ils'] && (
                      <p className="text-sm text-red-600 mt-1">{errors['price.ils'].message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="price.usd">מחיר ($)</Label>
                    <Input
                      id="price.usd"
                      type="text"
                      inputMode="decimal"
                      {...register('price.usd', {
                        validate: value => !value || /^\d+\.?\d*$/.test(value) || 'יש להזין מספר חיובי בלבד'
                      })}
                      className="mt-1"
                      placeholder="85.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="originalPrice.ils">מחיר מקורי (₪)</Label>
                    <Input
                      id="originalPrice.ils"
                      type="text"
                      inputMode="decimal"
                      {...register('originalPrice.ils', {
                        validate: value => !value || /^\d+\.?\d*$/.test(value) || 'יש להזין מספר חיובי בלבד'
                      })}
                      className="mt-1"
                      placeholder="399.90"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      להצגת הנחה
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="discount">אחוז הנחה (%)</Label>
                    <Input
                      id="discount"
                      type="text"
                      inputMode="numeric"
                      {...register('discount', {
                        validate: value => !value || (/^\d+\.?\d*$/.test(value) && parseFloat(value) <= 100) || 'יש להזין מספר בין 0 ל-100'
                      })}
                      className="mt-1"
                      placeholder="25"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* פירוט עלויות */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold">פירוט עלויות (Dropshipping)</h2>
              </div>
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-amber-900">
                    <p className="font-bold mb-1">חישוב מע&quot;מ עסקי חכם:</p>
                    <p className="leading-relaxed">
                      המערכת מחשבת רק את <span className="font-bold">הפרש המע&quot;מ</span> שצריך לשלם!
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* עלות בסיס */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="costBreakdown.baseCost.ils">עלות בסיס (₪)</Label>
                    <Input
                      id="costBreakdown.baseCost.ils"
                      type="text"
                      inputMode="decimal"
                      {...register('costBreakdown.baseCost.ils', {
                        validate: value => !value || /^\d+\.?\d*$/.test(value) || 'יש להזין מספר חיובי בלבד'
                      })}
                      className="mt-1 bg-white"
                      placeholder="100.00"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      מחיר המוצר באתר המקור
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="costBreakdown.baseCost.usd">עלות בסיס ($)</Label>
                    <Input
                      id="costBreakdown.baseCost.usd"
                      type="text"
                      inputMode="decimal"
                      {...register('costBreakdown.baseCost.usd', {
                        validate: value => !value || /^\d+\.?\d*$/.test(value) || 'יש להזין מספר חיובי בלבד'
                      })}
                      className="mt-1 bg-white"
                      placeholder="28.50"
                    />
                  </div>
                </div>

                {/* מס */}
                <div>
                  <Label htmlFor="costBreakdown.taxPercent">מע&quot;מ / מס (%)</Label>
                  <Input
                    id="costBreakdown.taxPercent"
                    type="text"
                    inputMode="decimal"
                    {...register('costBreakdown.taxPercent', {
                      validate: value => !value || /^\d+\.?\d*$/.test(value) || 'יש להזין מספר חיובי בלבד'
                    })}
                    className="mt-1 bg-white"
                    placeholder="18"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    מע&quot;מ תשומות (בייבוא): ₪{costCalculation?.inputVAT?.toFixed(2) || '0.00'}
                  </p>
                </div>

                {/* משלוח */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="costBreakdown.shippingCost.ils">עלות משלוח (₪)</Label>
                    <Input
                      id="costBreakdown.shippingCost.ils"
                      type="text"
                      inputMode="decimal"
                      {...register('costBreakdown.shippingCost.ils', {
                        validate: value => !value || /^\d+\.?\d*$/.test(value) || 'יש להזין מספר חיובי בלבד'
                      })}
                      className="mt-1 bg-white"
                      placeholder="40.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="costBreakdown.shippingCost.usd">עלות משלוח ($)</Label>
                    <Input
                      id="costBreakdown.shippingCost.usd"
                      type="text"
                      inputMode="decimal"
                      {...register('costBreakdown.shippingCost.usd', {
                        validate: value => !value || /^\d+\.?\d*$/.test(value) || 'יש להזין מספר חיובי בלבד'
                      })}
                      className="mt-1 bg-white"
                      placeholder="11.50"
                    />
                  </div>
                </div>

                {/* עמלות נוספות */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="costBreakdown.additionalFees.ils">עמלות נוספות (₪)</Label>
                    <Input
                      id="costBreakdown.additionalFees.ils"
                      type="text"
                      inputMode="decimal"
                      {...register('costBreakdown.additionalFees.ils', {
                        validate: value => !value || /^\d+\.?\d*$/.test(value) || 'יש להזין מספר חיובי בלבד'
                      })}
                      className="mt-1 bg-white"
                      placeholder="15.00"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      עמלות, ביטוח, טיפול וכו&apos;
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="costBreakdown.additionalFees.usd">עמלות נוספות ($)</Label>
                    <Input
                      id="costBreakdown.additionalFees.usd"
                      type="text"
                      inputMode="decimal"
                      {...register('costBreakdown.additionalFees.usd', {
                        validate: value => !value || /^\d+\.?\d*$/.test(value) || 'יש להזין מספר חיובי בלבד'
                      })}
                      className="mt-1 bg-white"
                      placeholder="4.30"
                    />
                  </div>
                </div>

                {/* הערות */}
                <div>
                  <Label htmlFor="costBreakdown.notes">הערות על העלויות</Label>
                  <Textarea
                    id="costBreakdown.notes"
                    {...register('costBreakdown.notes')}
                    className="mt-1 bg-white"
                    rows={3}
                    placeholder="הערות פנימיות על העלויות..."
                  />
                </div>
              </div>
            </div>

            {/* מלאי - ללא זמינות! */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">מעקב מלאי (Dropshipping)</h2>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="stock.trackInventory"
                    {...register('stock.trackInventory')}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="stock.trackInventory" className="cursor-pointer">
                    עקוב אחרי מלאי
                  </Label>
                  <Info className="w-4 h-4 text-gray-400" title="אם לא מסומן, המוצר יוצג כזמין תמיד" />
                </div>

                {formValues['stock.trackInventory'] && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="stock.quantity">כמות במלאי</Label>
                      <Input
                        id="stock.quantity"
                        type="text"
                        inputMode="numeric"
                        {...register('stock.quantity', {
                          validate: value => !value || /^\d+$/.test(value) || 'יש להזין מספר שלם חיובי בלבד'
                        })}
                        className="mt-1"
                        placeholder="100"
                      />
                    </div>

                    <div>
                      <Label htmlFor="stock.lowStockThreshold">התראת מלאי נמוך</Label>
                      <Input
                        id="stock.lowStockThreshold"
                        type="text"
                        inputMode="numeric"
                        {...register('stock.lowStockThreshold', {
                          validate: value => !value || /^\d+$/.test(value) || 'יש להזין מספר שלם חיובי בלבד'
                        })}
                        className="mt-1"
                        placeholder="5"
                      />
                    </div>
                  </div>
                )}

                {/* הסבר על זמינות */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">💡 ניהול זמינות מוצר</p>
                      <p className="mb-2">
                        לעדכון זמינות (זמין/לא זמין) של מוצרים וווריאנטים, עבור לדף <Link href="/admin/inventory" className="font-bold underline">בדיקת זמינות</Link>
                      </p>
                      <p className="text-xs">
                        שם תוכל לעדכן זמינות במערכת המרכזית שמסנכרנת אוטומטית עם הזמנות ועגלות
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* משלוח */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">משלוח</h2>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="shipping.freeShipping"
                    {...register('shipping.freeShipping')}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="shipping.freeShipping" className="cursor-pointer">
                    משלוח חינם
                  </Label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="shipping.estimatedDays">זמן אספקה משוער (ימים)</Label>
                    <Input
                      id="shipping.estimatedDays"
                      type="text"
                      inputMode="numeric"
                      {...register('shipping.estimatedDays', {
                        validate: value => !value || /^\d+$/.test(value) || 'יש להזין מספר שלם חיובי בלבד'
                      })}
                      className="mt-1"
                      placeholder="14"
                    />
                  </div>

                  {!formValues['shipping.freeShipping'] && (
                    <div>
                      <Label htmlFor="shipping.cost">עלות משלוח לצרכן (₪)</Label>
                      <Input
                        id="shipping.cost"
                        type="text"
                        inputMode="decimal"
                        {...register('shipping.cost', {
                          validate: value => !value || /^\d+\.?\d*$/.test(value) || 'יש להזין מספר חיובי בלבד'
                        })}
                        className="mt-1"
                        placeholder="30.00"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* מפרט טכני */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">מפרט טכני</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="specifications.brand">מותג</Label>
                  <Input
                    id="specifications.brand"
                    {...register('specifications.brand')}
                    className="mt-1"
                    placeholder="Dell"
                  />
                </div>

                <div>
                  <Label htmlFor="specifications.model">דגם</Label>
                  <Input
                    id="specifications.model"
                    {...register('specifications.model')}
                    className="mt-1"
                    placeholder="XPS 13"
                  />
                </div>

                <div>
                  <Label htmlFor="specifications.weight">משקל</Label>
                  <Input
                    id="specifications.weight"
                    {...register('specifications.weight')}
                    className="mt-1"
                    placeholder="1.2 ק&quot;ג"
                  />
                </div>

                <div>
                  <Label htmlFor="specifications.dimensions">מידות</Label>
                  <Input
                    id="specifications.dimensions"
                    {...register('specifications.dimensions')}
                    className="mt-1"
                    placeholder="30 x 20 x 1.5 ס&quot;מ"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="specifications.material">חומר</Label>
                  <Input
                    id="specifications.material"
                    {...register('specifications.material')}
                    className="mt-1"
                    placeholder="אלומיניום"
                  />
                </div>
              </div>

              <div className="mt-4">
                <Label htmlFor="features">תכונות (שורה אחת לכל תכונה)</Label>
                <Textarea
                  id="features"
                  {...register('features')}
                  className="mt-1"
                  rows={6}
                  placeholder="מעבד Intel Core i7&#10;זיכרון RAM 16GB&#10;כונן SSD 512GB"
                />
                <p className="text-xs text-gray-500 mt-1">
                  כל שורה תהפוך לנקודה בתצוגת התכונות
                </p>
              </div>
            </div>

            {/* ווריאנטים */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <Controller
                name="variants"
                control={control}
                render={({ field }) => (
                  <VariantManager
                    variants={field.value}
                    onChange={field.onChange}
                    isNewProduct={isNew}
                  />
                )}
              />
            </div>

            {/* פרטי ספק */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">פרטי ספק</h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="supplier.name">שם הספק</Label>
                  <Input
                    id="supplier.name"
                    {...register('supplier.name')}
                    className="mt-1"
                    placeholder="Amazon / Karl Lagerfeld / AliExpress"
                  />
                </div>

                <div>
                  <Label htmlFor="supplier.url">אתר הספק</Label>
                  <Input
                    id="supplier.url"
                    {...register('supplier.url')}
                    type="url"
                    className="mt-1"
                    placeholder="https://karllagerfeldparis.com"
                  />
                </div>

                <div>
                  <Label htmlFor="supplier.notes">הערות על הספק</Label>
                  <Textarea
                    id="supplier.notes"
                    {...register('supplier.notes')}
                    className="mt-1"
                    rows={3}
                    placeholder="איש קשר: Sarah&#10;זמן אספקה: 7 ימים"
                  />
                </div>
              </div>
            </div>

            {/* הגדרות - ללא status! */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">הגדרות</h2>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  {...register('featured')}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="featured" className="cursor-pointer">
                  מוצר מומלץ
                </Label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 sticky bottom-4 bg-white p-4 rounded-lg border border-gray-200 shadow-lg">
              {!hasPurchaseLink && (
                <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                  <p className="text-sm text-red-800 font-medium text-center">
                    ⚠️ לא ניתן לשמור ללא לינק קניה
                  </p>
                </div>
              )}
              <div className="flex items-center gap-4">
                <Button
                  type="submit"
                  disabled={updateMutation.isPending || !hasPurchaseLink}
                  className={`flex-1 ${
                    !hasPurchaseLink
                      ? 'opacity-50 cursor-not-allowed bg-gray-400'
                      : ''
                  }`}
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      שומר...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 ml-2" />
                      {isNew ? 'צור מוצר' : 'שמור שינויים'}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/products')}
                >
                  ביטול
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Cost Calculator */}
        {viewMode === 'calculator' && (
          <div className="sticky top-4 h-fit">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-300 p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-green-200">
                <Calculator className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-green-900">מחשבון רווחיות</h3>
                <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded font-bold">LIVE</span>
              </div>

              <div className="space-y-3">
                {/* פירוט עלויות */}
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">פירוט עלויות</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">עלות מוצר:</span>
                      <span className="font-medium text-gray-900">₪{(costCalculation?.baseCost || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">עלות משלוח:</span>
                      <span className="font-medium text-gray-900">₪{(costCalculation?.shippingCost || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">עמלות נוספות:</span>
                      <span className="font-medium text-gray-900">₪{(costCalculation?.additionalFees || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="text-gray-700 font-semibold">סה&quot;כ עלות:</span>
                      <span className="font-bold text-gray-900">₪{(costCalculation?.totalProductCost || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* חישוב מע"מ */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    חישוב מע&quot;מ עסקי
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">מע&quot;מ תשומות:</span>
                      <span className="font-medium text-blue-900">₪{(costCalculation?.inputVAT || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">מע&quot;מ עסקאות:</span>
                      <span className="font-medium text-blue-900">₪{(costCalculation?.outputVAT || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t-2 border-blue-400">
                      <span className="text-blue-800 font-bold">מע&quot;מ לתשלום:</span>
                      <span className={`font-bold ${(costCalculation?.vatToPayment || 0) >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ₪{(costCalculation?.vatToPayment || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* סיכום רווחיות */}
                <div className="bg-white rounded-lg p-4 border-2 border-green-300">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">סיכום רווחיות</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">מחיר מכירה:</span>
                      <span className="font-bold text-blue-600">₪{(costCalculation?.sellPriceWithVat || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-red-600">
                      <span>- עלות מוצר:</span>
                      <span className="font-medium">₪{(costCalculation?.totalProductCost || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-red-600">
                      <span>- מע&quot;מ לתשלום:</span>
                      <span className="font-medium">₪{(costCalculation?.vatToPayment || 0).toFixed(2)}</span>
                    </div>
                    <div className="border-t-2 border-green-400 pt-3"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-base font-bold text-gray-800">רווח נקי:</span>
                      <span className={`text-2xl font-bold ${(costCalculation?.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₪{(costCalculation?.netProfit || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-sm text-gray-600">שולי רווח:</span>
                      <span className={`text-xl font-bold ${(costCalculation?.profitPercent || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(costCalculation?.profitPercent || 0).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* אינדיקטור רווחיות */}
                <div className={`rounded-lg p-4 border-2 ${
                  (costCalculation?.profitPercent || 0) >= 30 ? 'bg-green-100 border-green-400' :
                  (costCalculation?.profitPercent || 0) >= 20 ? 'bg-yellow-100 border-yellow-400' :
                  (costCalculation?.profitPercent || 0) >= 10 ? 'bg-orange-100 border-orange-400' :
                  'bg-red-100 border-red-400'
                }`}>
                  <p className="text-xs font-semibold mb-1">
                    {(costCalculation?.profitPercent || 0) >= 30 ? '🎉 רווחיות מצוינת!' :
                     (costCalculation?.profitPercent || 0) >= 20 ? '✅ רווחיות טובה' :
                     (costCalculation?.profitPercent || 0) >= 10 ? '⚠️ רווחיות נמוכה' :
                     '❌ הפסד או רווח מינימלי!'}
                  </p>
                  <p className="text-xs text-gray-700">
                    {(costCalculation?.profitPercent || 0) >= 30 ? 'שולי רווח מעולים למוצר dropshipping' :
                     (costCalculation?.profitPercent || 0) >= 20 ? 'שולי רווח סבירים' :
                     (costCalculation?.profitPercent || 0) >= 10 ? 'שקול להעלות את המחיר' :
                     'המוצר לא רווחי - יש לתקן את המחיר'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Live Preview */}
        {viewMode === 'preview' && (
          <div className="sticky top-4 h-fit">
            <div className="bg-white rounded-lg border-2 border-blue-200 p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200">
                <Eye className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">תצוגה מקדימה</h3>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">LIVE</span>
              </div>

              <div className="space-y-4">
                {/* Image */}
                {primaryImage ? (
                  <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    {primaryImage.url.startsWith('data:') ? (
                      <img
                        src={primaryImage.url}
                        alt={formValues.name_he || 'Product image'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image
                        src={primaryImage.url}
                        alt={formValues.name_he || 'Product image'}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                    )}
                  </div>
                ) : (
                  <div className="relative aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <ImageIcon className="w-16 h-16 mx-auto mb-2" />
                      <p className="text-sm">אין תמונה</p>
                    </div>
                  </div>
                )}

                {/* Product Info */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {formValues.name_he || 'שם המוצר'}
                  </h3>

                  {formValues.description_he && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {formValues.description_he}
                    </p>
                  )}

                  {/* Price */}
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-3xl font-bold text-blue-600">
                      ₪{parseFloat(formValues['price.ils'] || 0).toFixed(2)}
                    </span>
                    {formValues['originalPrice.ils'] && parseFloat(formValues['originalPrice.ils']) > 0 && (
                      <>
                        <span className="text-lg text-gray-400 line-through">
                          ₪{parseFloat(formValues['originalPrice.ils']).toFixed(2)}
                        </span>
                        {formValues.discount > 0 && (
                          <span className="bg-red-500 text-white text-sm px-2 py-1 rounded">
                            -{formValues.discount}%
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Features */}
                  {formValues.features && (
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <h4 className="font-semibold text-sm mb-2">תכונות עיקריות</h4>
                      <ul className="text-sm space-y-1">
                        {formValues.features.split('\n').filter(Boolean).slice(0, 5).map((feature, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-blue-600 mt-0.5">•</span>
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
