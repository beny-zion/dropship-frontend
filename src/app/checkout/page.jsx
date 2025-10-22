'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ordersApi } from '@/lib/api/orders';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, Check } from 'lucide-react';
import Image from 'next/image';

// Validation Schema
const shippingSchema = z.object({
  fullName: z.string().min(2, 'שם חייב להיות לפחות 2 תווים'),
  phone: z.string().regex(/^05\d{8}$/, 'מספר טלפון לא תקין'),
  email: z.string().email('אימייל לא תקין'),
  street: z.string().min(3, 'כתובת חייבת להיות לפחות 3 תווים'),
  city: z.string().min(2, 'שם עיר חייב להיות לפחות 2 תווים'),
  zipCode: z.string().min(5, 'מיקוד חייב להיות לפחות 5 ספרות'),
  apartment: z.string().optional(),
  floor: z.string().optional(),
  entrance: z.string().optional(),
  notes: z.string().optional(),
});

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      fullName: user ? `${user.firstName} ${user.lastName}` : '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

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
          quantity: item.quantity,
        })),
        shippingAddress: data,
        paymentMethod: 'credit_card',
        expectedTotal: cart.pricing?.total, // ⭐ Send expected total for validation
      };

      // Create order
      const response = await ordersApi.createOrder(orderData);

      if (response.success) {
        toast.success('ההזמנה נוצרה בהצלחה!');
        clearCart();
        router.push(`/orders/${response.data._id}`);
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
                  {cart.items.map((item) => (
                    <div key={item.product._id} className="flex gap-3">
                      <div className="relative h-16 w-16 bg-gray-100 rounded flex-shrink-0">
                        {item.product.images?.main ? (
                          <Image
                            src={item.product.images.main}
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
                        <p className="text-sm text-gray-500">
                          {item.quantity} × ₪{item.price?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Totals */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">סכום ביניים:</span>
                    <span>₪{cart.pricing?.subtotal?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">מע״מ:</span>
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