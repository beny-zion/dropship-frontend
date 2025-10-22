'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ordersApi } from '@/lib/api/orders';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, ChevronLeft } from 'lucide-react';

export default function OrdersPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/orders');
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await ordersApi.getMyOrders();
        if (response.success) {
          setOrders(response.data);
        }
      } catch (error) {
        console.error('Fetch orders error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">טוען הזמנות...</p>
      </div>
    );
  }

  const statusConfig = {
    pending: { label: 'ממתינה', color: 'bg-yellow-500' },
    confirmed: { label: 'אושרה', color: 'bg-blue-500' },
    processing: { label: 'בטיפול', color: 'bg-purple-500' },
    shipped: { label: 'נשלחה', color: 'bg-orange-500' },
    delivered: { label: 'נמסרה', color: 'bg-green-500' },
    cancelled: { label: 'בוטלה', color: 'bg-red-500' },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">ההזמנות שלי</h1>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">אין הזמנות</h2>
            <p className="text-gray-600 mb-6">עדיין לא ביצעת הזמנות</p>
            <Link href="/products">
              <Button>התחל לקנות</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order._id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg">
                      הזמנה #{order.orderNumber}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('he-IL')}
                    </p>
                  </div>
                  <Badge className={statusConfig[order.status].color}>
                    {statusConfig[order.status].label}
                  </Badge>
                </div>

                {/* Order Items Preview */}
                <div className="flex gap-3 mb-4 overflow-x-auto">
                  {order.items.slice(0, 3).map((item) => (
                    <div
                      key={item.product._id}
                      className="relative h-20 w-20 bg-gray-100 rounded flex-shrink-0"
                    >
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="h-20 w-20 bg-gray-100 rounded flex items-center justify-center text-gray-600 flex-shrink-0">
                      +{order.items.length - 3}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      {order.items.length} פריטים
                    </p>
                    <p className="text-xl font-bold text-blue-600">
                      ₪{order.pricing.total.toFixed(2)}
                    </p>
                  </div>
                  <Link href={`/orders/${order._id}`}>
                    <Button variant="outline">
                      צפה בפרטים
                      <ChevronLeft className="mr-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}