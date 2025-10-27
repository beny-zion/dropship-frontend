// app/admin/products/[id]/page.jsx - Product Edit Page

'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { adminApi } from '@/lib/api/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ProductEditPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const isNew = params.id === 'new';

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();

  // Fetch product if editing
  const { data: productData, isLoading } = useQuery({
    queryKey: ['admin', 'product', params.id],
    queryFn: () => adminApi.getProductById(params.id),
    enabled: !isNew
  });

  // Set form values when product data loads
  useEffect(() => {
    if (productData?.data) {
      const product = productData.data;
      reset({
        asin: product.asin,
        name_he: product.name_he,
        name_en: product.name_en,
        description_he: product.description_he,
        category: product.category,
        price: product.price,
        stockQuantity: product.stock?.quantity || 0,
        featured: product.featured,
        status: product.status
      });
    }
  }, [productData, reset]);

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

  const onSubmit = (data) => {
    const productData = {
      asin: data.asin,
      name_he: data.name_he,
      name_en: data.name_en,
      description_he: data.description_he,
      category: data.category,
      price: parseFloat(data.price),
      stock: {
        quantity: parseInt(data.stockQuantity),
        available: parseInt(data.stockQuantity) > 0
      },
      featured: data.featured === 'true',
      status: data.status
    };

    updateMutation.mutate(productData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">פרטים כלליים</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ASIN */}
            <div>
              <Label htmlFor="asin">ASIN *</Label>
              <Input
                id="asin"
                {...register('asin', { required: 'שדה חובה' })}
                className="mt-1"
                disabled={!isNew}
              />
              {errors.asin && (
                <p className="text-sm text-red-600 mt-1">{errors.asin.message}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category">קטגוריה *</Label>
              <select
                id="category"
                {...register('category', { required: 'שדה חובה' })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">בחר קטגוריה</option>
                <option value="אלקטרוניקה">אלקטרוניקה</option>
                <option value="בית וגינה">בית וגינה</option>
                <option value="ספורט וחוץ">ספורט וחוץ</option>
                <option value="אופנה">אופנה</option>
                <option value="צעצועים ותינוקות">צעצועים ותינוקות</option>
                <option value="ספרים">ספרים</option>
                <option value="יופי ובריאות">יופי ובריאות</option>
              </select>
              {errors.category && (
                <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>
              )}
            </div>

            {/* Hebrew Name */}
            <div className="md:col-span-2">
              <Label htmlFor="name_he">שם המוצר (עברית) *</Label>
              <Input
                id="name_he"
                {...register('name_he', { required: 'שדה חובה' })}
                className="mt-1"
              />
              {errors.name_he && (
                <p className="text-sm text-red-600 mt-1">{errors.name_he.message}</p>
              )}
            </div>

            {/* English Name */}
            <div className="md:col-span-2">
              <Label htmlFor="name_en">שם המוצר (אנגלית)</Label>
              <Input
                id="name_en"
                {...register('name_en')}
                className="mt-1"
                dir="ltr"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <Label htmlFor="description_he">תיאור המוצר</Label>
              <Textarea
                id="description_he"
                {...register('description_he')}
                className="mt-1"
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">מחיר ומלאי</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price */}
            <div>
              <Label htmlFor="price">מחיר (₪) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register('price', {
                  required: 'שדה חובה',
                  min: { value: 0, message: 'המחיר חייב להיות חיובי' }
                })}
                className="mt-1"
              />
              {errors.price && (
                <p className="text-sm text-red-600 mt-1">{errors.price.message}</p>
              )}
            </div>

            {/* Stock */}
            <div>
              <Label htmlFor="stockQuantity">כמות במלאי *</Label>
              <Input
                id="stockQuantity"
                type="number"
                {...register('stockQuantity', {
                  required: 'שדה חובה',
                  min: { value: 0, message: 'הכמות חייבת להיות חיובית' }
                })}
                className="mt-1"
              />
              {errors.stockQuantity && (
                <p className="text-sm text-red-600 mt-1">{errors.stockQuantity.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">הגדרות</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status */}
            <div>
              <Label htmlFor="status">סטטוס *</Label>
              <select
                id="status"
                {...register('status', { required: 'שדה חובה' })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">פעיל</option>
                <option value="inactive">לא פעיל</option>
                <option value="outOfStock">אזל מהמלאי</option>
              </select>
            </div>

            {/* Featured */}
            <div>
              <Label htmlFor="featured">מוצר מומלץ</Label>
              <select
                id="featured"
                {...register('featured')}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="false">לא</option>
                <option value="true">כן</option>
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button
            type="submit"
            disabled={updateMutation.isPending}
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
  );
}
