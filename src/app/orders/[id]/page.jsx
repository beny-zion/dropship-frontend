'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ordersApi } from '@/lib/api/orders';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  Package,
  Truck,
  Home,
  ArrowRight,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react';

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await ordersApi.getOrderById(params.id);
        if (response.success) {
          setOrder(response.data);
        }
      } catch (error) {
        console.error('Fetch order error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">טוען הזמנה...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-xl text-gray-600">הזמנה לא נמצאה</p>
        <Link href="/orders">
          <Button className="mt-4">חזרה להזמנות</Button>
        </Link>
      </div>
    );
  }

  const statusConfig = {
    pending: { label: 'ממתינה', color: 'bg-yellow-500', icon: Package },
    confirmed: { label: 'אושרה', color: 'bg-blue-500', icon: CheckCircle },
    processing: { label: 'בטיפול', color: 'bg-purple-500', icon: Package },
    shipped: { label: 'נשלחה', color: 'bg-orange-500', icon: Truck },
    delivered: { label: 'נמסרה', color: 'bg-green-500', icon: Home },
    cancelled: { label: 'בוטלה', color: 'bg-red-500', icon: Package },
  };

  const currentStatus = statusConfig[order.status];
  const StatusIcon = currentStatus.icon;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Success Header */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-green-800 mb-2">
          ההזמנה התקבלה בהצלחה!
        </h1>
        <p className="text-green-700">
          תודה על ההזמנה. נשלח לך אישור למייל בקרוב.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>הזמנה #{order.orderNumber}</CardTitle>
                <Badge className={currentStatus.color}>
                  <StatusIcon className="h-4 w-4 ml-1" />
                  {currentStatus.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">תאריך הזמנה:</span>
                  <p className="font-medium">
                    {new Date(order.createdAt).toLocaleDateString('he-IL')}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">זמן אספקה משוער:</span>
                  <p className="font-medium">
                    {order.shipping.estimatedDelivery
                      ? new Date(order.shipping.estimatedDelivery).toLocaleDateString('he-IL')
                      : '7-10 ימי עסקים'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>פריטים בהזמנה</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.product._id} className="flex gap-4">
                    <div className="relative h-20 w-20 bg-gray-100 rounded flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                    <div className="flex-1">
                      <Link
                        href={`/products/${item.product.slug || item.product._id}`}
                        className="font-medium hover:text-blue-600"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">
                        כמות: {item.quantity} × ₪{item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="font-bold">
                        ₪{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>מעקב הזמנה</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.timeline.map((event, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                      {index < order.timeline.length - 1 && (
                        <div className="w-px h-full bg-gray-300 my-1"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium">{event.message}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(event.timestamp).toLocaleString('he-IL')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 ml-2" />
                כתובת משלוח
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.street}</p>
              {order.shippingAddress.apartment && (
                <p>דירה {order.shippingAddress.apartment}</p>
              )}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.zipCode}
              </p>
              <Separator className="my-3" />
              <p className="flex items-center">
                <Phone className="h-4 w-4 ml-2" />
                {order.shippingAddress.phone}
              </p>
              <p className="flex items-center">
                <Mail className="h-4 w-4 ml-2" />
                {order.shippingAddress.email}
              </p>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>סיכום הזמנה</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">סכום ביניים:</span>
                <span>₪{order.pricing.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">מע״מ:</span>
                <span>₪{order.pricing.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">משלוח:</span>
                {order.pricing.shipping === 0 ? (
                  <span className="text-green-600 font-semibold">חינם!</span>
                ) : (
                  <span>₪{order.pricing.shipping.toFixed(2)}</span>
                )}
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>סה״כ:</span>
                <span className="text-blue-600">
                  ₪{order.pricing.total.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-3">
            <Link href="/orders">
              <Button variant="outline" className="w-full">
                ההזמנות שלי
              </Button>
            </Link>
            <Link href="/products">
              <Button className="w-full">
                <ArrowRight className="ml-2 h-4 w-4" />
                המשך בקניות
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}