'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { createOrder } from '@/lib/api/orders';
import { createPaymentLink } from '@/lib/api/payments';
import { useAddresses, useCreateAddress } from '@/lib/hooks/useAddresses';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Check, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PaymentIframe } from '@/components/checkout/PaymentIframe';

// Validation Schema
const shippingSchema = z.object({
  fullName: z.string().min(2, 'שם חייב להיות לפחות 2 תווים'),
  phone: z.string().regex(/^05\d{8}$/, 'מספר טלפון לא תקין'),
  email: z.string().email('אימייל לא תקין'),
  street: z.string().min(3, 'כתובת חייבת להיות לפחות 3 תווים'),
  city: z.string().min(2, 'שם עיר חייב להיות לפחות 2 תווים'),
  zipCode: z.string().regex(/^\d{7}$/, 'מיקוד חייב להיות 7 ספרות'),
  apartment: z.string().optional(),
  floor: z.string().optional(),
  entrance: z.string().optional(),
  notes: z.string().optional(),
});

export default function CheckoutPage() {
  const { cart } = useCart();  // ✅ clearCart הוסר - מתבצע ב-Backend
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1); // 1 = shipping details, 2 = payment iframe
  const [loading, setLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [saveAddress, setSaveAddress] = useState(true); // Save address by default
  const [orderId, setOrderId] = useState(null);
  const [orderNumber, setOrderNumber] = useState(null);

  const { data: addressesData, isLoading: addressesLoading } = useAddresses();
  // Handle both array and object with data property
  const addresses = Array.isArray(addressesData)
    ? addressesData
    : (addressesData?.data || []);
  const createAddressMutation = useCreateAddress();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      fullName: user ? `${user.firstName} ${user.lastName}` : '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  // Auto-select default address on load
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find(addr => addr.isDefault);
      if (defaultAddress) {
        selectAddress(defaultAddress);
      }
    }
  }, [addresses, selectedAddressId]);

  const selectAddress = (address) => {
    setSelectedAddressId(address._id);
    setValue('fullName', address.fullName);
    setValue('phone', address.phone);
    setValue('street', address.street);
    setValue('apartment', address.apartment || '');
    setValue('floor', address.floor || '');
    setValue('entrance', address.entrance || '');
    setValue('city', address.city);
    setValue('zipCode', address.zipCode);
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('נא להתחבר תחילה');
      router.push('/login?redirect=/checkout');
    }
  }, [isAuthenticated, router]);

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.items.length === 0) {
      toast.error('העגלה ריקה');
      router.push('/cart');
    }
  }, [cart.items.length, router]);

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      // ✅ Step 1: Prepare order data
      const orderData = {
        items: cart.items.map(item => ({
          product: item.product._id,
          variantSku: item.variantSku || null,
          quantity: item.quantity,
        })),
        shippingAddress: data,
        paymentMethod: 'credit_card',
        expectedTotal: cart.pricing?.total,
      };

      // ✅ Step 2: Create order
      const orderResponse = await createOrder(orderData);
      console.log('📦 Order created:', orderResponse);

      if (!orderResponse?.success || !orderResponse?.data) {
        throw new Error('שגיאה ביצירת ההזמנה');
      }

      const newOrderId = orderResponse.data._id;
      const newOrderNumber = orderResponse.data.orderNumber;

      // ✅ Step 3: Save address if requested
      if (saveAddress && !selectedAddressId) {
        try {
          await createAddressMutation.mutateAsync({
            fullName: data.fullName,
            phone: data.phone,
            street: data.street,
            apartment: data.apartment,
            floor: data.floor,
            entrance: data.entrance,
            city: data.city,
            zipCode: data.zipCode,
            label: 'home',
            isDefault: addresses.length === 0,
          });
        } catch (error) {
          console.error('Save address error:', error);
          // Don't block order completion if address save fails
        }
      }

      // ✅ Step 4: Move to payment step
      setOrderId(newOrderId);
      setOrderNumber(newOrderNumber);
      setStep(2);

    } catch (error) {
      console.error('❌ Checkout error:', error);

      // Handle price change error
      if (error.code === 'PRICE_CHANGED') {
        const diff = error.pricing.difference;
        const isIncrease = diff > 0;

        toast.error(
          `המחיר השתנה! ${isIncrease ? 'עלייה' : 'ירידה'} של ₪${Math.abs(diff).toFixed(2)}`,
          {
            description: 'העגלה תעודכן למחירים החדשים',
            duration: 5000,
          }
        );

        window.location.reload();
      } else {
        toast.error(error.message || 'שגיאה ביצירת הזמנה');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || cart.items.length === 0) {
    return null;
  }

  // If step 2 - show payment iframe
  if (step === 2 && orderId) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b border-neutral-200">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-light tracking-widest uppercase text-center">תשלום מאובטח</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <PaymentIframe
            orderId={orderId}
            amount={cart.pricing?.total}
            onSuccess={() => {
              toast.success('התשלום אושר בהצלחה!');
              // ✅ העגלה כבר נמחקה ב-Backend (paymentController.js)
              // פשוט נסמן ל-React Query שצריך לרענן
              queryClient.invalidateQueries({ queryKey: ['cart'] });
              router.push(`/orders/${orderId}?payment=success`);
            }}
            onError={(error) => {
              toast.error(error || 'התשלום נכשל');
              setStep(1); // חזרה לשלב 1 - העגלה עדיין קיימת!
            }}
            onCancel={() => {
              toast.info('התשלום בוטל');
              setStep(1); // חזרה לשלב 1 - העגלה עדיין קיימת!
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-neutral-200">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-light tracking-widest uppercase text-center">תשלום</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Side - Form */}
          <div className="lg:col-span-2">
            {/* Saved Addresses */}
            {addressesLoading ? (
              <div className="mb-8 border border-neutral-200 p-6">
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-2 border-black border-t-transparent rounded-full mx-auto mb-3"></div>
                  <p className="text-sm font-light text-neutral-600 tracking-wide">טוען כתובות...</p>
                </div>
              </div>
            ) : addresses.length > 0 ? (
              <div className="mb-8 border border-neutral-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xs font-light tracking-widest uppercase text-neutral-600">בחר כתובת משלוח</h2>
                  <Link href="/addresses">
                    <button className="px-4 py-2 border border-neutral-300 text-xs font-light tracking-wide hover:border-black transition-colors">
                      נהל כתובות
                    </button>
                  </Link>
                </div>
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <div
                      key={address._id}
                      onClick={() => selectAddress(address)}
                      className={`p-4 border cursor-pointer transition-all ${
                        selectedAddressId === address._id
                          ? 'border-black bg-neutral-50'
                          : 'border-neutral-200 hover:border-neutral-400'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 ${selectedAddressId === address._id ? 'text-black' : 'text-neutral-400'}`}>
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-normal text-sm">{address.fullName}</span>
                            {address.isDefault && (
                              <span className="text-xs bg-black text-white px-2 py-0.5 font-light tracking-wider">
                                ברירת מחדל
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-light text-neutral-600">
                            {address.street}
                            {(address.apartment || address.floor || address.entrance) && (
                              <span className="mr-2">
                                ({[
                                  address.apartment && `דירה ${address.apartment}`,
                                  address.floor && `קומה ${address.floor}`,
                                  address.entrance && `כניסה ${address.entrance}`
                                ].filter(Boolean).join(', ')})
                              </span>
                            )}
                            , {address.city}, {address.zipCode}
                          </p>
                          <p className="text-xs font-light text-neutral-500 mt-1" dir="ltr">
                            {address.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-8 border border-dashed border-neutral-300 p-6">
                <div className="text-center py-4">
                  <MapPin className="h-12 w-12 mx-auto text-neutral-300 mb-3" />
                  <p className="text-sm font-light text-neutral-600 mb-4 tracking-wide">אין כתובות שמורות</p>
                  <Link href="/addresses">
                    <button className="px-4 py-2 border border-neutral-300 text-xs font-light tracking-wide hover:border-black transition-colors">
                      הוסף כתובת לשימוש עתידי
                    </button>
                  </Link>
                </div>
              </div>
            )}

            <div className="border border-neutral-200 p-6">
              <h2 className="text-xs font-light tracking-widest uppercase text-neutral-600 mb-6">פרטי משלוח</h2>
              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <Label htmlFor="fullName">שם מלא *</Label>
                  <Input
                    id="fullName"
                    {...register('fullName')}
                    placeholder="ישראל ישראלי"
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                {/* Phone & Email */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">טלפון *</Label>
                    <Input
                      id="phone"
                      {...register('phone')}
                      placeholder="0501234567"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">אימייל *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      placeholder="example@mail.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Street */}
                <div>
                  <Label htmlFor="street">רחוב ומספר בית *</Label>
                  <Input
                    id="street"
                    {...register('street')}
                    placeholder="הרצל 123"
                  />
                  {errors.street && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.street.message}
                    </p>
                  )}
                </div>

                {/* City & Zip */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">עיר *</Label>
                    <Input
                      id="city"
                      {...register('city')}
                      placeholder="תל אביב"
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.city.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="zipCode">מיקוד *</Label>
                    <Input
                      id="zipCode"
                      {...register('zipCode')}
                      placeholder="12345"
                    />
                    {errors.zipCode && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.zipCode.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Apartment, Floor, Entrance */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="apartment">דירה</Label>
                    <Input
                      id="apartment"
                      {...register('apartment')}
                      placeholder="5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="floor">קומה</Label>
                    <Input
                      id="floor"
                      {...register('floor')}
                      placeholder="2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="entrance">כניסה</Label>
                    <Input
                      id="entrance"
                      {...register('entrance')}
                      placeholder="א"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor="notes">הערות למשלוח</Label>
                  <Input
                    id="notes"
                    {...register('notes')}
                    placeholder="הערות נוספות..."
                  />
                </div>

                {/* Save Address Checkbox - only show if not using existing address */}
                {!selectedAddressId && (
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="saveAddress"
                      checked={saveAddress}
                      onChange={(e) => setSaveAddress(e.target.checked)}
                      className="h-4 w-4 border-neutral-300"
                    />
                    <Label htmlFor="saveAddress" className="cursor-pointer font-light text-sm">
                      שמור כתובת זו לשימוש עתידי
                      {addresses.length === 0 && (
                        <span className="text-xs text-neutral-500 mr-1">(תוגדר כברירת מחדל)</span>
                      )}
                    </Label>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Summary */}
          <div className="lg:col-span-1">
            <div className="border border-neutral-200 p-6">
              <h2 className="text-xs font-light tracking-widest uppercase text-neutral-600 mb-6">סיכום הזמנה</h2>

              {/* Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cart.items.map((item) => {
                  // יצירת key ייחודי שכולל גם variantSku
                  const itemKey = item.variantSku
                    ? `${item.product._id}-${item.variantSku}`
                    : item.product._id;

                  // קבלת תמונה - ווריאנט או כללית
                  let imageUrl = null;
                  if (item.variantSku && item.product.variants) {
                    const variant = item.product.variants.find(v => v.sku === item.variantSku);
                    if (variant?.images?.length > 0) {
                      const primaryImage = variant.images.find(img => img.isPrimary);
                      imageUrl = primaryImage?.url || variant.images[0]?.url;
                    }
                  }
                  if (!imageUrl) {
                    imageUrl = item.product.images?.[0]?.url || item.product.images?.main;
                  }

                  return (
                    <div key={itemKey} className="flex gap-3 pb-4 border-b border-neutral-200 last:border-0">
                      <div className="relative h-16 w-16 bg-neutral-50 flex-shrink-0">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={item.product.name_he}
                            fill
                            className="object-contain p-2"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-xs text-neutral-400">
                            אין תמונה
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-light line-clamp-2 mb-1">
                          {item.product.name_he}
                        </p>

                        {/* Variant Details */}
                        {item.variant && (
                          <div className="flex gap-2 mb-1">
                            {item.variant.color && (
                              <span className="text-xs font-light text-neutral-600">
                                {item.variant.color}
                              </span>
                            )}
                            {item.variant.size && (
                              <span className="text-xs font-light text-neutral-600">
                                {item.variant.size}
                              </span>
                            )}
                          </div>
                        )}

                        <p className="text-xs font-light text-neutral-500">
                          {item.quantity} × ₪{item.price?.toFixed(0) || '0'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-neutral-200 pt-4 mb-4" />

              {/* Totals */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="font-light text-neutral-600">סכום ביניים:</span>
                  <span className="font-normal">₪{cart.pricing?.subtotal?.toFixed(0) || '0'}</span>
                </div>
                <div className="flex justify-between text-xs font-light text-neutral-500 pr-4">
                  <span>כולל מע״מ (18%):</span>
                  <span>₪{cart.pricing?.tax?.toFixed(0) || '0'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-light text-neutral-600">משלוח:</span>
                  {cart.pricing?.shipping === 0 ? (
                    <span className="font-normal">חינם</span>
                  ) : (
                    <span className="font-normal">₪{cart.pricing?.shipping?.toFixed(0) || '0'}</span>
                  )}
                </div>
              </div>

              <div className="border-t border-neutral-200 pt-4 mb-6" />

              <div className="flex justify-between text-xl font-normal mb-6">
                <span>סה״כ:</span>
                <span>₪{cart.pricing?.total?.toFixed(0) || '0'}</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-black text-white text-sm font-light tracking-widest uppercase hover:bg-neutral-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-3"
              >
                {loading ? 'מעבד...' : 'המשך לתשלום'}
              </button>

              <button
                type="button"
                onClick={() => router.push('/cart')}
                className="w-full py-3 border border-neutral-300 text-sm font-light tracking-wide hover:border-black transition-colors flex items-center justify-center gap-2"
              >
                <ArrowRight className="h-4 w-4" />
                חזרה לעגלה
              </button>
            </div>
          </div>
          </div>
        </form>
      </div>
    </div>
  );
}