// app/admin/orders/[id]/page.jsx - Order Detail Page

'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowRight,
  Package,
  User,
  MapPin,
  CreditCard,
  Truck,
  Save,
  XCircle,
  ExternalLink,
  ShoppingBag
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const statusConfig = {
  pending: { label: 'ממתין לאישור', className: 'bg-yellow-100 text-yellow-800' },
  payment_hold: { label: 'מסגרת אשראי תפוסה', className: 'bg-orange-100 text-orange-800' },
  ordered: { label: 'הוזמן מארה"ב', className: 'bg-blue-100 text-blue-800' },
  cancelled: { label: 'בוטל', className: 'bg-red-100 text-red-800' },
  arrived_us_warehouse: { label: 'הגיע למחסן ארה"ב', className: 'bg-indigo-100 text-indigo-800' },
  shipped_to_israel: { label: 'נשלח לישראל', className: 'bg-purple-100 text-purple-800' },
  customs_israel: { label: 'במכס בישראל', className: 'bg-pink-100 text-pink-800' },
  arrived_israel_warehouse: { label: 'הגיע למחסן בישראל', className: 'bg-cyan-100 text-cyan-800' },
  shipped_to_customer: { label: 'נשלח ללקוח', className: 'bg-teal-100 text-teal-800' },
  delivered: { label: 'נמסר', className: 'bg-green-100 text-green-800' }
};

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingCompany, setTrackingCompany] = useState('');
  const [notes, setNotes] = useState('');

  // Fetch order
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'order', params.id],
    queryFn: () => adminApi.getOrderById(params.id)
  });

  const order = data?.data;

  // Debug log
  console.log('📦 Order Detail:', {
    fullData: data,
    order,
    shippingAddress: order?.shippingAddress
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (status) => adminApi.updateOrderStatus(params.id, status),
    onSuccess: () => {
      toast.success('הסטטוס עודכן בהצלחה');
      queryClient.invalidateQueries(['admin', 'order', params.id]);
      queryClient.invalidateQueries(['admin', 'orders']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'שגיאה בעדכון הסטטוס');
    }
  });

  // Update tracking mutation
  const updateTrackingMutation = useMutation({
    mutationFn: (data) => adminApi.updateTracking(params.id, data),
    onSuccess: () => {
      toast.success('פרטי המשלוח עודכנו בהצלחה');
      queryClient.invalidateQueries(['admin', 'order', params.id]);
      setTrackingNumber('');
      setTrackingCompany('');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'שגיאה בעדכון פרטי המשלוח');
    }
  });

  // Add notes mutation
  const addNotesMutation = useMutation({
    mutationFn: (notes) => adminApi.addOrderNotes(params.id, notes),
    onSuccess: () => {
      toast.success('ההערה נוספה בהצלחה');
      queryClient.invalidateQueries(['admin', 'order', params.id]);
      setNotes('');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'שגיאה בהוספת הערה');
    }
  });

  // Cancel order mutation
  const cancelMutation = useMutation({
    mutationFn: () => adminApi.cancelOrder(params.id),
    onSuccess: () => {
      toast.success('ההזמנה בוטלה בהצלחה');
      queryClient.invalidateQueries(['admin', 'order', params.id]);
      queryClient.invalidateQueries(['admin', 'orders']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'שגיאה בביטול ההזמנה');
    }
  });

  // Refresh order items mutation
  const refreshItemsMutation = useMutation({
    mutationFn: () => adminApi.refreshOrderItems(params.id),
    onSuccess: () => {
      toast.success('פרטי המוצרים עודכנו מהמסד הנתונים');
      queryClient.invalidateQueries(['admin', 'order', params.id]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'שגיאה בעדכון פרטי המוצרים');
    }
  });

  const handleUpdateStatus = () => {
    if (newStatus) {
      updateStatusMutation.mutate(newStatus);
    }
  };

  const handleUpdateTracking = () => {
    if (trackingNumber && trackingCompany) {
      updateTrackingMutation.mutate({
        trackingNumber,
        trackingCompany
      });
    } else {
      toast.error('יש למלא את כל שדות המשלוח');
    }
  };

  const handleAddNotes = () => {
    if (notes.trim()) {
      addNotesMutation.mutate(notes);
    }
  };

  const handleCancelOrder = () => {
    if (confirm('האם אתה בטוח שברצונך לבטל את ההזמנה?')) {
      cancelMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">ההזמנה לא נמצאה</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/orders">
              <ArrowRight className="w-4 h-4 ml-2" />
              חזרה לרשימה
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              הזמנה {order.orderNumber}
            </h1>
            <p className="text-gray-600 mt-1">
              נוצרה בתאריך {new Date(order.createdAt).toLocaleDateString('he-IL')}
            </p>
          </div>
        </div>

        <Badge className={statusConfig[order.status]?.className + ' text-base px-4 py-2'}>
          {statusConfig[order.status]?.label || order.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Package className="w-5 h-5" />
                פריטים בהזמנה
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refreshItemsMutation.mutate()}
                disabled={refreshItemsMutation.isPending}
              >
                {refreshItemsMutation.isPending ? 'מעדכן...' : 'עדכן מידע מהמוצרים'}
              </Button>
            </div>

            <div className="space-y-4">
              {order.items?.map((item, index) => (
                <div key={index} className="flex flex-col gap-3 pb-4 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-4">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {item.name}
                      </p>

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
                        כמות: {item.quantity} × ₪{item.price?.toLocaleString()}
                      </p>

                      {/* Supplier Info */}
                      {item.supplierName && (
                        <p className="text-xs text-gray-400 mt-1">
                          ספק: {item.supplierName}
                        </p>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">
                        ₪{(item.quantity * item.price)?.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Purchase Button */}
                  {item.supplierLink && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(item.supplierLink, '_blank')}
                      className="w-full sm:w-auto"
                    >
                      <ShoppingBag className="w-4 h-4 ml-2" />
                      קנה אצל {item.supplierName || 'הספק'}
                      <ExternalLink className="w-3 h-3 mr-2" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Pricing Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">סכום ביניים:</span>
                <span>₪{order.pricing?.subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">משלוח:</span>
                <span>₪{order.pricing?.shipping?.toLocaleString()}</span>
              </div>
              {order.pricing?.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>הנחה:</span>
                  <span>-₪{order.pricing.discount?.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                <span>סה״כ:</span>
                <span>₪{order.pricing?.total?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              פרטי הלקוח
            </h2>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">שם מלא</p>
                <p className="font-medium">
                  {order.user?.firstName} {order.user?.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">אימייל</p>
                <p className="font-medium">{order.user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">טלפון</p>
                <p className="font-medium">{order.user?.phone}</p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              כתובת למשלוח
            </h2>

            {order.shippingAddress ? (
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500">שם מלא</p>
                  <p className="font-medium">{order.shippingAddress.fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">כתובת</p>
                  <p className="text-gray-700">
                    {order.shippingAddress.street}
                    {order.shippingAddress.apartment && `, דירה ${order.shippingAddress.apartment}`}
                    {order.shippingAddress.floor && `, קומה ${order.shippingAddress.floor}`}
                    {order.shippingAddress.entrance && `, כניסה ${order.shippingAddress.entrance}`}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">עיר ומיקוד</p>
                  <p className="text-gray-700">
                    {order.shippingAddress.city}
                    {order.shippingAddress.zipCode && `, ${order.shippingAddress.zipCode}`}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">טלפון</p>
                  <p className="text-gray-700">{order.shippingAddress.phone}</p>
                </div>
                {order.shippingAddress.notes && (
                  <div>
                    <p className="text-xs text-gray-500">הערות</p>
                    <p className="text-gray-700 text-sm">{order.shippingAddress.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">אין כתובת משלוח</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Update Status */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">עדכון סטטוס</h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="status">סטטוס חדש</Label>
                <select
                  id="status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">בחר סטטוס</option>
                  <option value="pending">ממתין לאישור</option>
                  <option value="payment_hold">מסגרת אשראי תפוסה</option>
                  <option value="ordered">הוזמן מארה"ב</option>
                  <option value="arrived_us_warehouse">הגיע למחסן ארה"ב</option>
                  <option value="shipped_to_israel">נשלח לישראל</option>
                  <option value="customs_israel">במכס בישראל</option>
                  <option value="arrived_israel_warehouse">הגיע למחסן בישראל</option>
                  <option value="shipped_to_customer">נשלח ללקוח</option>
                  <option value="delivered">נמסר</option>
                  <option value="cancelled">בוטל</option>
                </select>
              </div>

              <Button
                onClick={handleUpdateStatus}
                disabled={!newStatus || updateStatusMutation.isPending}
                className="w-full"
              >
                <Save className="w-4 h-4 ml-2" />
                עדכן סטטוס
              </Button>
            </div>
          </div>

          {/* Tracking Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5" />
              מעקב משלוח
            </h2>

            {order.tracking?.trackingNumber ? (
              <div className="mb-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">חברת משלוח</p>
                <p className="font-medium">{order.tracking.trackingCompany}</p>
                <p className="text-sm text-gray-600 mt-2">מספר מעקב</p>
                <p className="font-mono font-medium">{order.tracking.trackingNumber}</p>
              </div>
            ) : null}

            <div className="space-y-4">
              <div>
                <Label htmlFor="trackingCompany">חברת משלוח</Label>
                <Input
                  id="trackingCompany"
                  value={trackingCompany}
                  onChange={(e) => setTrackingCompany(e.target.value)}
                  placeholder="לדוגמה: DHL, FedEx"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="trackingNumber">מספר מעקב</Label>
                <Input
                  id="trackingNumber"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="מספר המעקב"
                  className="mt-1"
                />
              </div>

              <Button
                onClick={handleUpdateTracking}
                disabled={updateTrackingMutation.isPending}
                className="w-full"
              >
                <Save className="w-4 h-4 ml-2" />
                עדכן מעקב
              </Button>
            </div>
          </div>

          {/* Admin Notes */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">הערות מנהל</h2>

            {order.adminNotes?.length > 0 && (
              <div className="mb-4 space-y-2">
                {order.adminNotes.map((note, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded text-sm">
                    <p className="text-gray-700">{note.note}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(note.createdAt).toLocaleString('he-IL')}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-4">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="הוסף הערה..."
                rows={3}
              />

              <Button
                onClick={handleAddNotes}
                disabled={addNotesMutation.isPending || !notes.trim()}
                className="w-full"
              >
                <Save className="w-4 h-4 ml-2" />
                הוסף הערה
              </Button>
            </div>
          </div>

          {/* Cancel Order */}
          {order.status !== 'cancelled' && order.status !== 'delivered' && (
            <div className="bg-white rounded-lg border border-red-200 p-6">
              <h2 className="text-lg font-semibold mb-4 text-red-600">ביטול הזמנה</h2>
              <p className="text-sm text-gray-600 mb-4">
                פעולה זו תבטל את ההזמנה ותחזיר את המוצרים למלאי
              </p>
              <Button
                variant="destructive"
                onClick={handleCancelOrder}
                disabled={cancelMutation.isPending}
                className="w-full"
              >
                <XCircle className="w-4 h-4 ml-2" />
                בטל הזמנה
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
