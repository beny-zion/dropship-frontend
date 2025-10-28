// app/admin/products/[id]/page.jsx - Advanced Product Editor with Live Preview

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { adminApi } from '@/lib/api/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Save, Loader2, Eye, DollarSign, Calculator, Info, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import ImageUpload from '@/components/admin/ImageUpload';
import Image from 'next/image';

export default function ProductEditPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const isNew = params.id === 'new';
  const [showPreview, setShowPreview] = useState(true);

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
      'price.ils': 0,
      'price.usd': 0,
      'originalPrice.ils': '',
      'originalPrice.usd': '',
      discount: 0,
      // פירוט עלויות
      'costBreakdown.baseCost.ils': 0,
      'costBreakdown.baseCost.usd': 0,
      'costBreakdown.taxPercent': 18,
      'costBreakdown.shippingCost.ils': 0,
      'costBreakdown.shippingCost.usd': 0,
      'costBreakdown.additionalFees.ils': 0,
      'costBreakdown.additionalFees.usd': 0,
      'costBreakdown.profitMargin': 0,
      'costBreakdown.notes': '',
      // מלאי
      'stock.available': true,
      'stock.quantity': null,
      'stock.trackInventory': false,
      'stock.lowStockThreshold': 5,
      // משלוח
      'shipping.freeShipping': false,
      'shipping.estimatedDays': 14,
      'shipping.cost': 0,
      // מפרט טכני
      'specifications.brand': '',
      'specifications.model': '',
      'specifications.color': '',
      'specifications.size': '',
      'specifications.weight': '',
      'specifications.dimensions': '',
      'specifications.material': '',
      features: '',
      // קישורים
      'links.amazon': '',
      'links.affiliateUrl': '',
      // הגדרות
      status: 'active',
      featured: false,
      images: []
    }
  });

  // Watch all form values for live preview
  const formValues = watch();

  // Fetch product if editing
  const { data: productData, isLoading } = useQuery({
    queryKey: ['admin', 'product', params.id],
    queryFn: () => adminApi.getProductById(params.id),
    enabled: !isNew
  });

  // Set form values when product data loads
  useEffect(() => {
    if (productData?.data?.product) {
      const product = productData.data.product;
      reset({
        asin: product.asin || '',
        name_he: product.name_he || '',
        name_en: product.name_en || '',
        description_he: product.description_he || '',
        description_en: product.description_en || '',
        category: product.category || '',
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
        'stock.available': product.stock?.available ?? true,
        'stock.quantity': product.stock?.quantity,
        'stock.trackInventory': product.stock?.trackInventory || false,
        'stock.lowStockThreshold': product.stock?.lowStockThreshold || 5,
        'shipping.freeShipping': product.shipping?.freeShipping || false,
        'shipping.estimatedDays': product.shipping?.estimatedDays || 14,
        'shipping.cost': product.shipping?.cost || 0,
        'specifications.brand': product.specifications?.brand || '',
        'specifications.model': product.specifications?.model || '',
        'specifications.color': product.specifications?.color || '',
        'specifications.size': product.specifications?.size || '',
        'specifications.weight': product.specifications?.weight || '',
        'specifications.dimensions': product.specifications?.dimensions || '',
        'specifications.material': product.specifications?.material || '',
        features: Array.isArray(product.features) ? product.features.join('\n') : '',
        'links.amazon': product.links?.amazon || '',
        'links.affiliateUrl': product.links?.affiliateUrl || '',
        status: product.status || 'active',
        featured: product.featured || false,
        images: product.images || []
      });
    }
  }, [productData, reset]);

  // Calculate total cost and profit
  const costCalculation = useMemo(() => {
    const baseCost = parseFloat(formValues['costBreakdown.baseCost.ils']) || 0;
    const taxPercent = parseFloat(formValues['costBreakdown.taxPercent']) || 0;
    const shippingCost = parseFloat(formValues['costBreakdown.shippingCost.ils']) || 0;
    const additionalFees = parseFloat(formValues['costBreakdown.additionalFees.ils']) || 0;
    const sellPrice = parseFloat(formValues['price.ils']) || 0;

    const taxAmount = (baseCost * taxPercent) / 100;
    const totalCost = baseCost + taxAmount + shippingCost + additionalFees;
    const profit = sellPrice - totalCost;
    const profitPercent = sellPrice > 0 ? (profit / sellPrice) * 100 : 0;

    return {
      baseCost,
      taxAmount,
      shippingCost,
      additionalFees,
      totalCost,
      sellPrice,
      profit,
      profitPercent
    };
  }, [formValues]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data) => {
      if (isNew) {
        return adminApi.createProduct(data);
      } else {
        return adminApi.updateProduct(params.id, data);
      }
    },
    onSuccess: () => {
      toast.success(isNew ? 'המוצר נוצר בהצלחה' : 'המוצר עודכן בהצלחה');
      queryClient.invalidateQueries(['admin', 'products']);
      router.push('/admin/products');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'שגיאה בשמירת המוצר');
    }
  });

  const onSubmit = async (data) => {
    try {
      // בדיקה אם יש תמונות חדשות שצריך להעלות
      const hasNewImages = (data.images || []).some(img => img.isNew && img.fileData);

      if (hasNewImages) {
        toast.info('מעלה תמונות לקלאודינרי...');
      }

      // העלאת תמונות חדשות לקלאודינרי לפני שמירה
      const processedImages = await Promise.all(
        (data.images || []).map(async (image) => {
          // אם זו תמונה חדשה (עם isNew), העלה לקלאודינרי
          if (image.isNew && image.fileData) {
            const response = await adminApi.uploadImage({ fileData: image.fileData });

            // ה-axios interceptor מחזיר response.data ישירות, כך שהתשובה היא:
            // { success: true, data: { url, publicId, ... }, message: '...' }
            if (response && response.success && response.data) {
              return {
                url: response.data.url,
                publicId: response.data.publicId,
                alt: image.alt,
                isPrimary: image.isPrimary
              };
            } else {
              console.error('העלאת תמונה נכשלה:', response);
              throw new Error('העלאת התמונה נכשלה');
            }
          }

          // אם זה URL חיצוני או תמונה קיימת, השאר כמו שהיא
          // אבל אל תשמור base64!
          if (image.url && image.url.startsWith('data:')) {
            console.error('לא ניתן לשמור base64:', image.url.substring(0, 50));
            throw new Error('לא ניתן לשמור תמונות base64 במסד הנתונים. יש לוודא שההעלאה לקלאודינרי הצליחה.');
          }

          console.log('משתמש בתמונה קיימת:', { url: image.url, publicId: image.publicId });
          return {
            url: image.url,
            publicId: image.publicId,
            alt: image.alt,
            isPrimary: image.isPrimary
          };
        })
      );

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
          ils: parseFloat(data['price.ils']) || 0,
          usd: parseFloat(data['price.usd']) || 0
        },
        originalPrice: {
          ils: data['originalPrice.ils'] ? parseFloat(data['originalPrice.ils']) : undefined,
          usd: data['originalPrice.usd'] ? parseFloat(data['originalPrice.usd']) : undefined
        },
        discount: parseFloat(data.discount) || 0,
        costBreakdown: {
          baseCost: {
            ils: parseFloat(data['costBreakdown.baseCost.ils']) || 0,
            usd: parseFloat(data['costBreakdown.baseCost.usd']) || 0
          },
          taxPercent: parseFloat(data['costBreakdown.taxPercent']) || 18,
          shippingCost: {
            ils: parseFloat(data['costBreakdown.shippingCost.ils']) || 0,
            usd: parseFloat(data['costBreakdown.shippingCost.usd']) || 0
          },
          additionalFees: {
            ils: parseFloat(data['costBreakdown.additionalFees.ils']) || 0,
            usd: parseFloat(data['costBreakdown.additionalFees.usd']) || 0
          },
          profitMargin: parseFloat(data['costBreakdown.profitMargin']) || 0,
          notes: data['costBreakdown.notes']
        },
        stock: {
          available: data['stock.available'],
          quantity: data['stock.trackInventory'] ? parseInt(data['stock.quantity']) : null,
          trackInventory: data['stock.trackInventory'],
          lowStockThreshold: parseInt(data['stock.lowStockThreshold']) || 5
        },
        shipping: {
          freeShipping: data['shipping.freeShipping'],
          estimatedDays: parseInt(data['shipping.estimatedDays']) || 14,
          cost: parseFloat(data['shipping.cost']) || 0
        },
        specifications: {
          brand: data['specifications.brand'],
          model: data['specifications.model'],
          color: data['specifications.color'],
          size: data['specifications.size'],
          weight: data['specifications.weight'],
          dimensions: data['specifications.dimensions'],
          material: data['specifications.material']
        },
        features: data.features ? data.features.split('\n').map(f => f.trim()).filter(Boolean) : [],
        links: {
          amazon: data['links.amazon'],
          affiliateUrl: data['links.affiliateUrl']
        },
        status: data.status,
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
              המוצר יוצג בדיוק כפי שתראה בתצוגה החיה
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowPreview(!showPreview)}
        >
          <Eye className="w-4 h-4 ml-2" />
          {showPreview ? 'הסתר תצוגה מקדימה' : 'הצג תצוגה מקדימה'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* תמונות */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">תמונות המוצר</h2>
              <Controller
                name="images"
                control={control}
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
                  <Label htmlFor="asin">ASIN *</Label>
                  <Input
                    id="asin"
                    {...register('asin', { required: 'שדה חובה' })}
                    className="mt-1"
                    placeholder="B08N5WRWNW"
                  />
                  {!isNew && (
                    <p className="text-xs text-amber-600 mt-1">
                      ⚠️ שים לב: שינוי ASIN משנה את זהות המוצר
                    </p>
                  )}
                  {errors.asin && (
                    <p className="text-sm text-red-600 mt-1">{errors.asin.message}</p>
                  )}
                </div>

                {/* Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">קטגוריה *</Label>
                    <select
                      id="category"
                      {...register('category', { required: 'שדה חובה' })}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">בחר קטגוריה</option>
                      <option value="electronics">אלקטרוניקה</option>
                      <option value="fashion">אופנה</option>
                      <option value="home">בית וגינה</option>
                      <option value="sports">ספורט</option>
                      <option value="toys">צעצועים</option>
                      <option value="books">ספרים</option>
                      <option value="beauty">יופי</option>
                      <option value="automotive">רכב</option>
                      <option value="grocery">מזון</option>
                      <option value="other">אחר</option>
                    </select>
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
                  <Label htmlFor="name_he">שם המוצר (עברית) *</Label>
                  <Input
                    id="name_he"
                    {...register('name_he', { required: 'שדה חובה' })}
                    className="mt-1"
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
                  <Label htmlFor="description_he">תיאור המוצר (עברית) *</Label>
                  <Textarea
                    id="description_he"
                    {...register('description_he', { required: 'שדה חובה' })}
                    className="mt-1"
                    rows={5}
                    placeholder="תיאור מפורט של המוצר, היתרונות שלו והמאפיינים הבולטים..."
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
                <div>
                  <Label htmlFor="tags">תגיות (מופרדות בפסיקים)</Label>
                  <Input
                    id="tags"
                    {...register('tags')}
                    className="mt-1"
                    placeholder="מחשב נייד, Dell, גיימינג, 2024"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    הפרד תגיות בפסיקים לשיפור החיפוש
                  </p>
                </div>
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
                    <Label htmlFor="price.ils">מחיר למכירה (₪) *</Label>
                    <Input
                      id="price.ils"
                      type="number"
                      step="0.01"
                      {...register('price.ils', {
                        required: 'שדה חובה',
                        min: { value: 0, message: 'המחיר חייב להיות חיובי' }
                      })}
                      className="mt-1"
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
                      type="number"
                      step="0.01"
                      {...register('price.usd')}
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
                      type="number"
                      step="0.01"
                      {...register('originalPrice.ils')}
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
                      type="number"
                      step="1"
                      max="100"
                      {...register('discount')}
                      className="mt-1"
                      placeholder="25"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* פירוט עלויות Dropshipping */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold">פירוט עלויות (Dropshipping)</h2>
              </div>

              <div className="space-y-4">
                {/* עלות בסיס */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="costBreakdown.baseCost.ils">עלות בסיס (₪)</Label>
                    <Input
                      id="costBreakdown.baseCost.ils"
                      type="number"
                      step="0.01"
                      {...register('costBreakdown.baseCost.ils')}
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
                      type="number"
                      step="0.01"
                      {...register('costBreakdown.baseCost.usd')}
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
                    type="number"
                    step="0.1"
                    {...register('costBreakdown.taxPercent')}
                    className="mt-1 bg-white"
                    placeholder="18"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    סכום המס: ₪{costCalculation.taxAmount.toFixed(2)}
                  </p>
                </div>

                {/* משלוח */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="costBreakdown.shippingCost.ils">עלות משלוח (₪)</Label>
                    <Input
                      id="costBreakdown.shippingCost.ils"
                      type="number"
                      step="0.01"
                      {...register('costBreakdown.shippingCost.ils')}
                      className="mt-1 bg-white"
                      placeholder="40.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="costBreakdown.shippingCost.usd">עלות משלוח ($)</Label>
                    <Input
                      id="costBreakdown.shippingCost.usd"
                      type="number"
                      step="0.01"
                      {...register('costBreakdown.shippingCost.usd')}
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
                      type="number"
                      step="0.01"
                      {...register('costBreakdown.additionalFees.ils')}
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
                      type="number"
                      step="0.01"
                      {...register('costBreakdown.additionalFees.usd')}
                      className="mt-1 bg-white"
                      placeholder="4.30"
                    />
                  </div>
                </div>

                {/* חישוב רווח */}
                <div className="bg-white rounded-lg p-4 border-2 border-blue-300">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">עלות בסיס:</span>
                      <span className="font-medium">₪{costCalculation.baseCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">מס ({formValues['costBreakdown.taxPercent']}%):</span>
                      <span className="font-medium">₪{costCalculation.taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">משלוח:</span>
                      <span className="font-medium">₪{costCalculation.shippingCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">עמלות:</span>
                      <span className="font-medium">₪{costCalculation.additionalFees.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2"></div>
                    <div className="flex justify-between text-base font-semibold">
                      <span>סה&quot;כ עלות:</span>
                      <span>₪{costCalculation.totalCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base font-semibold">
                      <span>מחיר מכירה:</span>
                      <span>₪{costCalculation.sellPrice.toFixed(2)}</span>
                    </div>
                    <div className="border-t-2 border-blue-300 pt-2 mt-2"></div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>רווח נקי:</span>
                      <span className={costCalculation.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                        ₪{costCalculation.profit.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">שולי רווח:</span>
                      <span className={`font-medium ${costCalculation.profitPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {costCalculation.profitPercent.toFixed(1)}%
                      </span>
                    </div>
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
                    placeholder="הערות פנימיות על העלויות, ספקים, תנאי תשלום וכו'"
                  />
                </div>
              </div>
            </div>

            {/* מלאי */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">מלאי (Dropshipping)</h2>

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
                        type="number"
                        {...register('stock.quantity')}
                        className="mt-1"
                        placeholder="100"
                      />
                    </div>

                    <div>
                      <Label htmlFor="stock.lowStockThreshold">התראת מלאי נמוך</Label>
                      <Input
                        id="stock.lowStockThreshold"
                        type="number"
                        {...register('stock.lowStockThreshold')}
                        className="mt-1"
                        placeholder="5"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="stock.available"
                    {...register('stock.available')}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="stock.available" className="cursor-pointer">
                    המוצר זמין
                  </Label>
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
                      type="number"
                      {...register('shipping.estimatedDays')}
                      className="mt-1"
                      placeholder="14"
                    />
                  </div>

                  {!formValues['shipping.freeShipping'] && (
                    <div>
                      <Label htmlFor="shipping.cost">עלות משלוח לצרכן (₪)</Label>
                      <Input
                        id="shipping.cost"
                        type="number"
                        step="0.01"
                        {...register('shipping.cost')}
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
                  <Label htmlFor="specifications.color">צבע</Label>
                  <Input
                    id="specifications.color"
                    {...register('specifications.color')}
                    className="mt-1"
                    placeholder="כסוף"
                  />
                </div>

                <div>
                  <Label htmlFor="specifications.size">גודל</Label>
                  <Input
                    id="specifications.size"
                    {...register('specifications.size')}
                    className="mt-1"
                    placeholder='13.3"'
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
                  placeholder="מעבד Intel Core i7&#10;זיכרון RAM 16GB&#10;כונן SSD 512GB&#10;מסך 13.3 אינץ' Full HD"
                />
                <p className="text-xs text-gray-500 mt-1">
                  כל שורה תהפוך לנקודה בתצוגת התכונות
                </p>
              </div>
            </div>

            {/* קישורים */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">קישורים</h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="links.amazon">קישור למוצר באמזון</Label>
                  <Input
                    id="links.amazon"
                    type="url"
                    {...register('links.amazon')}
                    className="mt-1"
                    dir="ltr"
                    placeholder="https://www.amazon.com/..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    אופציונלי - מומלץ להוסיף קישור לאמזון
                  </p>
                </div>

                <div>
                  <Label htmlFor="links.affiliateUrl">קישור Affiliate</Label>
                  <Input
                    id="links.affiliateUrl"
                    type="url"
                    {...register('links.affiliateUrl')}
                    className="mt-1"
                    dir="ltr"
                    placeholder="https://amzn.to/..."
                  />
                </div>
              </div>
            </div>

            {/* הגדרות */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">הגדרות</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">סטטוס</Label>
                  <select
                    id="status"
                    {...register('status')}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">פעיל</option>
                    <option value="inactive">לא פעיל</option>
                    <option value="out_of_stock">אזל מהמלאי</option>
                    <option value="discontinued">הופסק</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 mt-7">
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
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 sticky bottom-4 bg-white p-4 rounded-lg border border-gray-200 shadow-lg">
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex-1"
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
          </form>
        </div>

        {/* Live Preview */}
        {showPreview && (
          <div className="lg:sticky lg:top-4 h-fit">
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
                      // תמונת base64 - תצוגה מקדימה
                      <img
                        src={primaryImage.url}
                        alt={formValues.name_he || 'Product image'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      // תמונה מ-URL חיצוני או Cloudinary
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

                  {/* Shipping */}
                  {formValues['shipping.freeShipping'] ? (
                    <div className="inline-flex items-center gap-1 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full mb-4">
                      ✓ משלוח חינם
                    </div>
                  ) : formValues['shipping.cost'] > 0 && (
                    <div className="text-sm text-gray-600 mb-4">
                      משלוח: ₪{parseFloat(formValues['shipping.cost']).toFixed(2)}
                    </div>
                  )}

                  {/* Stock Status */}
                  <div className="mb-4">
                    {formValues['stock.available'] ? (
                      <span className="text-sm text-green-600">✓ במלאי</span>
                    ) : (
                      <span className="text-sm text-red-600">אזל מהמלאי</span>
                    )}
                    {formValues['stock.trackInventory'] && formValues['stock.quantity'] && (
                      <span className="text-sm text-gray-500 mr-2">
                        ({formValues['stock.quantity']} יחידות)
                      </span>
                    )}
                  </div>

                  {/* Specifications */}
                  {(formValues['specifications.brand'] || formValues['specifications.model']) && (
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <h4 className="font-semibold text-sm mb-2">מפרט</h4>
                      <dl className="text-sm space-y-1">
                        {formValues['specifications.brand'] && (
                          <div className="flex justify-between">
                            <dt className="text-gray-600">מותג:</dt>
                            <dd className="font-medium">{formValues['specifications.brand']}</dd>
                          </div>
                        )}
                        {formValues['specifications.model'] && (
                          <div className="flex justify-between">
                            <dt className="text-gray-600">דגם:</dt>
                            <dd className="font-medium">{formValues['specifications.model']}</dd>
                          </div>
                        )}
                        {formValues['specifications.color'] && (
                          <div className="flex justify-between">
                            <dt className="text-gray-600">צבע:</dt>
                            <dd className="font-medium">{formValues['specifications.color']}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  )}

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
