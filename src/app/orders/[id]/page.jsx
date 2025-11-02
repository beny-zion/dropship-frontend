'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { getOrderById } from '@/lib/api/orders';
import Link from 'next/link';
import Image from 'next/image';
import { useReactToPrint } from 'react-to-print';
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
  Download,
  Printer,
} from 'lucide-react';

export default function OrderDetailsPage() {
  const params = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await getOrderById(params.id);
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

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `הזמנה-${order?.orderNumber || 'order'}`,
    onBeforeGetContent: () => {
      return new Promise((resolve) => {
        // Wait a bit for images to load
        setTimeout(resolve, 500);
      });
    },
    pageStyle: `
      @page {
        size: A4;
        margin: 20mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .no-print {
          display: none !important;
        }
        img {
          max-width: 100%;
          page-break-inside: avoid;
        }
      }
    `,
  });

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
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 text-center no-print">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-green-800 mb-2">
          ההזמנה התקבלה בהצלחה!
        </h1>
        <p className="text-green-700 mb-4">
          תודה על ההזמנה. נשלח לך אישור למייל בקרוב.
        </p>
        <Button
          onClick={handlePrint}
          variant="outline"
          className="bg-white"
        >
          <Printer className="h-4 w-4 ml-2" />
          הדפס / שמור כ-PDF
        </Button>
      </div>

      <div ref={printRef} className="grid lg:grid-cols-3 gap-8">
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
                    <div className="relative h-20 w-20 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image}
                          alt={item.name}
                          className="object-contain p-2 w-full h-full"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="text-xs text-gray-400">אין תמונה</div>';
                          }}
                        />
                      ) : (
                        <div className="text-xs text-gray-400">אין תמונה</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <Link
                        href={`/products/${item.product.slug || item.product._id}`}
                        className="font-medium hover:text-blue-600 print:no-underline print:text-black"
                      >
                        {item.name}
                      </Link>

                      {/* Variant Details */}
                      {item.variantDetails && (
                        <div className="flex gap-2 mt-1">
                          {item.variantDetails.color && (
                            <Badge variant="outline" className="text-xs">
                              צבע: {item.variantDetails.color}
                            </Badge>
                          )}
                          {item.variantDetails.size && (
                            <Badge variant="outline" className="text-xs">
                              מידה: {item.variantDetails.size}
                            </Badge>
                          )}
                        </div>
                      )}

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
              <p>
                {order.shippingAddress.street}
                {(order.shippingAddress.apartment || order.shippingAddress.floor || order.shippingAddress.entrance) && (
                  <span className="text-xs mr-2">
                    ({[
                      order.shippingAddress.apartment && `דירה ${order.shippingAddress.apartment}`,
                      order.shippingAddress.floor && `קומה ${order.shippingAddress.floor}`,
                      order.shippingAddress.entrance && `כניסה ${order.shippingAddress.entrance}`
                    ].filter(Boolean).join(', ')})
                  </span>
                )}
              </p>
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
                <span className="text-gray-600">סכום ביניים (כולל מע״מ):</span>
                <span>₪{order.pricing.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 pr-4">
                <span>מתוכו מע״מ (18%):</span>
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
          <div className="space-y-3 no-print">
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