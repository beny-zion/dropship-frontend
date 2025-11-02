'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { createOrder } from '@/lib/api/orders';
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
  const { cart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [saveAddress, setSaveAddress] = useState(true); // Save address by default

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
      // Prepare order data
      const orderData = {
        items: cart.items.map(item => ({
          product: item.product._id,
          variantSku: item.variantSku || null, // ⭐ העבר את ה-variantSku
          quantity: item.quantity,
        })),
        shippingAddress: data,
        paymentMethod: 'credit_card',
        expectedTotal: cart.pricing?.total, // ⭐ Send expected total for validation
      };

      // Create order
      const response = await createOrder(orderData);

      if (response.success) {
        console.log('✅ Order created successfully:', response.data);

        // Save address if requested and not using existing address
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
              isDefault: addresses.length === 0, // First address is default
            });
          } catch (error) {
            console.error('Save address error:', error);
            // Don't block order completion if address save fails
          }
        }

        const orderId = response.data._id;
        console.log('🔄 Redirecting to order page:', orderId);

        toast.success('ההזמנה נוצרה בהצלחה!');
        // Invalidate cart query to refresh - server already cleared it
        queryClient.invalidateQueries({ queryKey: ['cart'] });

        // Redirect to order page
        router.push(`/orders/${orderId}`);
      }
    } catch (error) {
      console.error('Order error:', error);

      // ⭐ Handle price change error
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

        // Refresh cart to get new prices
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-4 max-w-2xl mx-auto">
          {/* Step 1 */}
          <div className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              {step > 1 ? <Check className="h-5 w-5" /> : '1'}
            </div>
            <span className="mr-2 font-medium">פרטי משלוח</span>
          </div>

          <div className="h-px bg-gray-300 w-20"></div>

          {/* Step 2 */}
          <div className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              2
            </div>
            <span className="mr-2 font-medium">אישור</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Side - Form */}
          <div className="lg:col-span-2">
            {/* Saved Addresses */}
            {addressesLoading ? (
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
                    <p className="text-gray-600">טוען כתובות...</p>
                  </div>
                </CardContent>
              </Card>
            ) : addresses.length > 0 ? (
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>בחר כתובת משלוח</CardTitle>
                    <Link href="/addresses">
                      <Button variant="outline" size="sm">
                        נהל כתובות
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {addresses.map((address) => (
                      <div
                        key={address._id}
                        onClick={() => selectAddress(address)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedAddressId === address._id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 ${selectedAddressId === address._id ? 'text-blue-600' : 'text-gray-400'}`}>
                            <MapPin className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">{address.fullName}</span>
                              {address.isDefault && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                  ברירת מחדל
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {address.street}
                              {(address.apartment || address.floor || address.entrance) && (
                                <span className="text-xs mr-2">
                                  ({[
                                    address.apartment && `דירה ${address.apartment}`,
                                    address.floor && `קומה ${address.floor}`,
                                    address.entrance && `כניסה ${address.entrance}`
                                  ].filter(Boolean).join(', ')})
                                </span>
                              )}
                              , {address.city}, {address.zipCode}
                            </p>
                            <p className="text-sm text-gray-500" dir="ltr">
                              {address.phone}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="mb-6 border-dashed">
                <CardContent className="pt-6">
                  <div className="text-center py-4">
                    <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600 mb-3">אין כתובות שמורות</p>
                    <Link href="/addresses">
                      <Button variant="outline" size="sm">
                        הוסף כתובת לשימוש עתידי
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>פרטי משלוח</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="saveAddress" className="cursor-pointer font-normal">
                      שמור כתובת זו לשימוש עתידי
                      {addresses.length === 0 && (
                        <span className="text-xs text-gray-500 mr-1">(תוגדר כברירת מחדל)</span>
                      )}
                    </Label>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>סיכום הזמנה</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Items */}
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
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
                      <div key={itemKey} className="flex gap-3">
                        <div className="relative h-16 w-16 bg-gray-100 rounded flex-shrink-0">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={item.product.name_he}
                              fill
                              className="object-contain p-1"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-xs text-gray-400">
                              אין תמונה
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-2">
                            {item.product.name_he}
                          </p>

                          {/* Variant Details */}
                          {item.variant && (
                            <div className="flex gap-2 mt-1 mb-1">
                              {item.variant.color && (
                                <Badge variant="outline" className="text-xs py-0 px-1 h-5">
                                  {item.variant.color}
                                </Badge>
                              )}
                              {item.variant.size && (
                                <Badge variant="outline" className="text-xs py-0 px-1 h-5">
                                  {item.variant.size}
                                </Badge>
                              )}
                            </div>
                          )}

                          <p className="text-sm text-gray-500">
                            {item.quantity} × ₪{item.price?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Separator className="my-4" />

                {/* Totals */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">סכום ביניים (כולל מע״מ):</span>
                    <span>₪{cart.pricing?.subtotal?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 pr-4">
                    <span>מתוכו מע״מ (18%):</span>
                    <span>₪{cart.pricing?.tax?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">משלוח:</span>
                    {cart.pricing?.shipping === 0 ? (
                      <span className="text-green-600 font-semibold">חינם!</span>
                    ) : (
                      <span>₪{cart.pricing?.shipping?.toFixed(2) || '0.00'}</span>
                    )}
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between text-lg font-bold mb-6">
                  <span>סה״כ לתשלום:</span>
                  <span className="text-blue-600">₪{cart.pricing?.total?.toFixed(2) || '0.00'}</span>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? 'מעבד...' : 'אשר והזמן'}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full mt-2"
                  onClick={() => router.push('/cart')}
                >
                  <ArrowRight className="ml-2 h-4 w-4" />
                  חזרה לעגלה
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}