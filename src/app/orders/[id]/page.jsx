'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { getOrderById } from '@/lib/api/orders';
import { useStatusConfig } from '@/lib/hooks/useOrderStatuses';
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

  // Load dynamic statuses from server
  const { statusConfig, isLoading: statusLoading } = useStatusConfig();

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

  if (loading || statusLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-black border-t-transparent mx-auto mb-4"></div>
          <p className="text-sm font-light text-neutral-600 tracking-wide">טוען הזמנה...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-xl font-light text-neutral-600 mb-6 tracking-wide">הזמנה לא נמצאה</p>
          <Link href="/orders">
            <button className="px-8 py-3 bg-black text-white text-sm font-light tracking-widest uppercase hover:bg-neutral-800 transition-all">
              חזרה להזמנות
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Default icon mapping for statuses
  const statusIcons = {
    pending: Package,
    payment_hold: Package,
    ordered: CheckCircle,
    cancelled: Package,
    arrived_us_warehouse: Package,
    shipped_to_israel: Truck,
    customs_israel: Package,
    arrived_israel_warehouse: Package,
    shipped_to_customer: Truck,
    delivered: Home,
  };

  const currentStatus = statusConfig[order.status] || { label: order.status, className: 'bg-neutral-100 text-neutral-700' };
  const StatusIcon = statusIcons[order.status] || Package;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-neutral-200">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-light tracking-widest uppercase text-center">פרטי הזמנה</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Success Header */}
        <div className="border border-neutral-200 bg-neutral-50 p-8 mb-8 text-center no-print">
          <CheckCircle className="h-16 w-16 text-black mx-auto mb-4" />
          <h2 className="text-2xl font-light tracking-wide mb-2">
            ההזמנה התקבלה בהצלחה!
          </h2>
          <p className="text-sm font-light text-neutral-600 mb-6 tracking-wide">
            תודה על ההזמנה. נשלח לך אישור למייל בקרוב.
          </p>
          <button
            onClick={handlePrint}
            className="px-6 py-3 border border-neutral-300 text-sm font-light tracking-wide hover:border-black transition-colors inline-flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            הדפס / שמור כ-PDF
          </button>
        </div>

      <div ref={printRef} className="grid lg:grid-cols-3 gap-8">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Info */}
          <div className="border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-normal tracking-wide">הזמנה #{order.orderNumber}</h2>
              <span className={`px-3 py-1 text-xs font-light tracking-wider inline-flex items-center gap-2 ${currentStatus.className}`}>
                <StatusIcon className="h-4 w-4" />
                {currentStatus.label}
              </span>
            </div>
            <div className="grid md:grid-cols-2 gap-6 text-sm font-light">
              <div>
                <span className="text-neutral-600">תאריך הזמנה:</span>
                <p className="font-normal mt-1">
                  {new Date(order.createdAt).toLocaleDateString('he-IL')}
                </p>
              </div>
              <div>
                <span className="text-neutral-600">זמן אספקה משוער:</span>
                <p className="font-normal mt-1">
                  {order.shipping.estimatedDelivery
                    ? new Date(order.shipping.estimatedDelivery).toLocaleDateString('he-IL')
                    : '7-10 ימי עסקים'}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="border border-neutral-200 p-6">
            <h2 className="text-lg font-normal tracking-wide mb-6">פריטים בהזמנה</h2>
            <div className="space-y-6">
              {order.items.map((item, idx) => (
                <div key={`${item.product._id || item.product.id}-${item.variantSku || 'base'}-${idx}`} className="flex gap-4 pb-6 border-b border-neutral-200 last:border-0 last:pb-0">
                  <div className="relative h-20 w-20 bg-neutral-50 border border-neutral-200 flex-shrink-0 flex items-center justify-center">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt={item.name}
                        className="object-contain p-2 w-full h-full"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<div class="text-xs text-neutral-400">אין תמונה</div>';
                        }}
                      />
                    ) : (
                      <div className="text-xs text-neutral-400">אין תמונה</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Link
                      href={`/products/${item.product.slug || item.product._id}`}
                      className="font-light hover:opacity-70 transition-opacity print:no-underline print:text-black"
                    >
                      {item.name}
                    </Link>

                    {/* Variant Details */}
                    {item.variantDetails && (
                      <div className="flex gap-2 mt-2">
                        {item.variantDetails.color && (
                          <span className="text-xs font-light text-neutral-600">
                            צבע: {item.variantDetails.color}
                          </span>
                        )}
                        {item.variantDetails.size && (
                          <span className="text-xs font-light text-neutral-600">
                            מידה: {item.variantDetails.size}
                          </span>
                        )}
                      </div>
                    )}

                    <p className="text-sm font-light text-neutral-600 mt-2">
                      כמות: {item.quantity} × ₪{item.price.toFixed(0)}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="font-normal text-lg">
                      ₪{(item.price * item.quantity).toFixed(0)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="border border-neutral-200 p-6">
            <h2 className="text-lg font-normal tracking-wide mb-6">מעקב הזמנה</h2>
            <div className="space-y-4">
              {order.timeline.map((event, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-black"></div>
                    {index < order.timeline.length - 1 && (
                      <div className="w-px h-full bg-neutral-300 my-1"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-normal text-sm">{event.message}</p>
                    <p className="text-xs font-light text-neutral-600 mt-1">
                      {new Date(event.timestamp).toLocaleString('he-IL')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Shipping Address */}
          <div className="border border-neutral-200 p-6">
            <h2 className="text-lg font-normal tracking-wide mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              כתובת משלוח
            </h2>
            <div className="text-sm font-light space-y-2">
              <p className="font-normal">{order.shippingAddress.fullName}</p>
              <p className="text-neutral-600">
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
              <p className="text-neutral-600">
                {order.shippingAddress.city}, {order.shippingAddress.zipCode}
              </p>
              <div className="border-t border-neutral-200 my-4" />
              <p className="flex items-center gap-2 text-neutral-600">
                <Phone className="h-4 w-4" />
                {order.shippingAddress.phone}
              </p>
              <p className="flex items-center gap-2 text-neutral-600">
                <Mail className="h-4 w-4" />
                {order.shippingAddress.email}
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="border border-neutral-200 p-6">
            <h2 className="text-lg font-normal tracking-wide mb-6">סיכום הזמנה</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-light">
                <span className="text-neutral-600">סכום ביניים:</span>
                <span className="font-normal">₪{order.pricing.subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-xs font-light text-neutral-500 pr-4">
                <span>כולל מע״מ (18%):</span>
                <span>₪{order.pricing.tax.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-sm font-light">
                <span className="text-neutral-600">משלוח:</span>
                {order.pricing.shipping === 0 ? (
                  <span className="font-normal">חינם</span>
                ) : (
                  <span className="font-normal">₪{order.pricing.shipping.toFixed(0)}</span>
                )}
              </div>
              <div className="border-t border-neutral-200 pt-3 mt-3" />
              <div className="flex justify-between text-xl font-normal">
                <span>סה״כ:</span>
                <span>₪{order.pricing.total.toFixed(0)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 no-print">
            <Link href="/orders">
              <button className="w-full px-4 py-3 border border-neutral-300 text-sm font-light tracking-wide hover:border-black transition-colors">
                ההזמנות שלי
              </button>
            </Link>
            <Link href="/products">
              <button className="w-full px-4 py-3 bg-black text-white text-sm font-light tracking-wide hover:bg-neutral-800 transition-colors inline-flex items-center justify-center gap-2">
                <ArrowRight className="h-4 w-4" />
                המשך בקניות
              </button>
            </Link>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}