// app/admin/orders/[id]/page.jsx - Enhanced Order Detail Page with Item Management

'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Package,
  MapPin,
  CreditCard,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { sanitizeHTML } from '@/lib/utils/sanitize';
import SafeText from '@/components/ui/SafeText';

// ✅ ייבוא הקומפוננטות החדשות
import ItemStatusBadge from '@/components/admin/orders/ItemStatusBadge';
import UpdateStatusModal from '@/components/admin/orders/UpdateStatusModal';
import OrderFromSupplierModal from '@/components/admin/orders/OrderFromSupplierModal';
import CancelItemModal from '@/components/admin/orders/CancelItemModal';
import OrderMinimumWarning from '@/components/admin/orders/OrderMinimumWarning';
import ItemHistoryModal from '@/components/admin/orders/ItemHistoryModal';
import { ITEM_STATUS } from '@/lib/constants/itemStatuses';
import {
  updateItemStatus,
  orderItemFromSupplier,
  cancelOrderItem
} from '@/lib/api/orderItems';

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

  // ✅ מצב למודלים
  const [orderSupplierModal, setOrderSupplierModal] = useState(null);
  const [cancelModal, setCancelModal] = useState(null);
  const [historyModal, setHistoryModal] = useState(null);
  const [updateStatusModal, setUpdateStatusModal] = useState(null);

  // Fetch order
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'order', params.id],
    queryFn: () => adminApi.getOrderById(params.id)
  });

  const order = data?.data;

  // ✅ Mutation להזמנה מספק
  const orderFromSupplierMutation = useMutation({
    mutationFn: ({ itemId, data }) => orderItemFromSupplier(params.id, itemId, data),
    onSuccess: (response) => {
      // ✅ התגובה היא { success: true, data: {...} }
      const data = response.data || response;

      toast.success(data.message || 'הפריט הוזמן בהצלחה מהספק');
      queryClient.invalidateQueries(['admin', 'order', params.id]);
      setOrderSupplierModal(null);

      // בדוק אם יש הצעה לעדכון סטטוס ראשי
      const suggestion = data?.orderStatusSuggestion;
      console.log('📦 Order From Supplier Response:', {
        fullResponse: response,
        data,
        suggestion,
        hasSuggestion: !!suggestion,
        hasMessage: !!suggestion?.message
      });

      if (suggestion && suggestion.message) {
        toast(suggestion.message, {
          duration: 10000,
          action: {
            label: 'עדכן עכשיו',
            onClick: () => {
              updateOrderStatusMutation.mutate(suggestion.suggestedStatus);
            }
          }
        });
      }
    },
    onError: (error) => {
      const errorData = error.data || error.response?.data;
      const errorMsg = errorData?.message || 'שגיאה בהזמנה מספק';
      const errorDetails = errorData?.error;

      if (errorDetails) {
        toast.error(errorMsg, {
          description: `פרטים: ${errorDetails}`,
          duration: 6000
        });
      } else {
        toast.error(errorMsg, { duration: 6000 });
      }
    }
  });

  // ✅ Mutation לעדכון סטטוס ראשי של ההזמנה
  const updateOrderStatusMutation = useMutation({
    mutationFn: (newStatus) => adminApi.updateOrderStatus(params.id, newStatus),
    onSuccess: () => {
      toast.success('סטטוס ההזמנה עודכן בהצלחה!');
      queryClient.invalidateQueries(['admin', 'order', params.id]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'שגיאה בעדכון סטטוס ההזמנה');
    }
  });

  // ✅ Mutation לעדכון סטטוס פריט
  const updateStatusMutation = useMutation({
    mutationFn: ({ itemId, newStatus, notes }) => updateItemStatus(params.id, itemId, newStatus, notes),
    onSuccess: (response) => {
      // ✅ התגובה היא { success: true, data: {...} }
      const data = response.data || response;

      console.log('📊 Status Update Response:', {
        fullResponse: response,
        data,
        message: data?.message,
        orderStatusSuggestion: data?.orderStatusSuggestion
      });

      toast.success(data.message || 'הסטטוס עודכן בהצלחה');
      queryClient.invalidateQueries(['admin', 'order', params.id]);
      setUpdateStatusModal(null);

      // בדוק אם יש הצעה לעדכון סטטוס ראשי
      const suggestion = data?.orderStatusSuggestion;

      if (suggestion && suggestion.message) {
        // הצג toast עם כפתור לעדכון מהיר
        toast(suggestion.message, {
          duration: 10000,
          action: {
            label: 'עדכן עכשיו',
            onClick: () => {
              updateOrderStatusMutation.mutate(suggestion.suggestedStatus);
            }
          }
        });
      }
    },
    onError: (error) => {
      // הנתונים נמצאים ישירות ב-error.data (לא ב-error.response.data)
      const errorData = error.data || error.response?.data;

      // אם יש מידע מפורט על הסטטוסים המותרים
      if (errorData?.allowedTransitions && errorData.allowedTransitions.length > 0) {
        const allowedList = errorData.allowedTransitions.map(t => t.label).join(', ');
        toast.error(errorData.message, {
          description: `סטטוסים מותרים: ${allowedList}`,
          duration: 8000
        });
      } else {
        toast.error(errorData?.message || 'שגיאה בעדכון הסטטוס');
      }
    }
  });

  // ✅ Mutation לביטול פריט
  const cancelItemMutation = useMutation({
    mutationFn: ({ itemId, reason }) => cancelOrderItem(params.id, itemId, reason),
    onSuccess: (response) => {
      // ✅ התגובה היא { success: true, data: {...} }
      const data = response.data || response;

      console.log('🗑️ Cancel Item Response:', {
        fullResponse: response,
        data,
        message: data?.message,
        orderUpdate: data?.orderUpdate
      });

      toast.success(data.message || 'הפריט בוטל בהצלחה');

      // הצג אזהרה אם לא עומד במינימום
      if (data.orderUpdate && !data.orderUpdate.meetsMinimum) {
        toast.warning('שים לב: ההזמנה לא עומדת במינימום!', {
          duration: 5000
        });
      }

      // בדוק אם יש הצעה לעדכון סטטוס ראשי
      const suggestion = data.orderStatusSuggestion;
      if (suggestion && suggestion.message) {
        toast(suggestion.message, {
          duration: 10000,
          action: {
            label: 'עדכן עכשיו',
            onClick: () => {
              updateOrderStatusMutation.mutate(suggestion.suggestedStatus);
            }
          }
        });
      }

      queryClient.invalidateQueries(['admin', 'order', params.id]);
      setCancelModal(null);
    },
    onError: (error) => {
      const errorData = error.data || error.response?.data;
      const errorMsg = errorData?.message || 'שגיאה בביטול הפריט';
      const errorDetails = errorData?.error;

      if (errorDetails) {
        toast.error(errorMsg, {
          description: `פרטים: ${errorDetails}`,
          duration: 6000
        });
      } else {
        toast.error(errorMsg, { duration: 6000 });
      }
    }
  });

  const handleOrderFromSupplier = (item) => {
    setOrderSupplierModal(item);
  };

  const handleCancelItem = (item) => {
    setCancelModal(item);
  };

  const handleShowHistory = (item) => {
    setHistoryModal(item);
  };

  const handleUpdateStatus = (item) => {
    setUpdateStatusModal(item);
  };

  const handleStatusChange = (newStatus, notes) => {
    if (newStatus && updateStatusModal) {
      updateStatusMutation.mutate({
        itemId: updateStatusModal._id,
        newStatus,
        notes
      });
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

        <div className="flex items-center gap-3">
          <Badge className={statusConfig[order.status]?.className + ' text-base px-4 py-2'}>
            {statusConfig[order.status]?.label || order.status}
          </Badge>

          <select
            value={order.status}
            onChange={(e) => {
              if (e.target.value !== order.status) {
                if (confirm(`האם לעדכן את סטטוס ההזמנה ל"${statusConfig[e.target.value]?.label}"?`)) {
                  updateOrderStatusMutation.mutate(e.target.value);
                }
              }
            }}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">שנה סטטוס...</option>
            {Object.entries(statusConfig).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ✅ אזהרת מינימום */}
      <OrderMinimumWarning order={order} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* ✅ Order Items with Management */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Package className="w-5 h-5" />
                ניהול פריטים ({order.items?.length || 0})
              </h2>
            </div>

            <div className="space-y-6">
              {order.items?.map((item) => {
                const isCancelled = item.cancellation?.cancelled;
                const isPending = item.itemStatus === ITEM_STATUS.PENDING;

                return (
                  <div
                    key={item._id}
                    className={`border border-gray-200 p-4 rounded ${isCancelled ? 'bg-red-50 opacity-75' : 'bg-white'
                      }`}
                  >
                    {/* Item Header */}
                    <div className="flex items-start gap-4 mb-4">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded border"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <SafeText as="p" className="font-medium text-gray-900">
                              {item.name}
                            </SafeText>

                            {/* Variant Details */}
                            {item.variantDetails && (
                              <div className="flex gap-2 mt-1">
                                {item.variantDetails.color && (
                                  <Badge variant="outline" className="text-xs">
                                    <SafeText>{item.variantDetails.color}</SafeText>
                                  </Badge>
                                )}
                                {item.variantDetails.size && (
                                  <Badge variant="outline" className="text-xs">
                                    <SafeText>{item.variantDetails.size}</SafeText>
                                  </Badge>
                                )}
                              </div>
                            )}

                            <p className="text-sm text-gray-500 mt-1">
                              כמות: {item.quantity} × ₪{item.price?.toLocaleString()} = ₪{(item.quantity * item.price)?.toLocaleString()}
                            </p>

                            {item.supplierName && (
                              <p className="text-xs text-gray-400 mt-1">
                                ספק: <SafeText>{item.supplierName}</SafeText>
                              </p>
                            )}
                          </div>

                          {/* ✅ Item Status Badge */}
                          <ItemStatusBadge status={item.itemStatus} />
                        </div>

                        {/* ✅ Cancellation Notice */}
                        {isCancelled && (
                          <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded">
                            <p className="text-sm font-medium text-red-900">
                              ❌ פריט בוטל
                            </p>
                            <p className="text-xs text-red-700 mt-1">
                              סיבה: <SafeText>{item.cancellation.reason}</SafeText>
                            </p>
                            <p className="text-xs text-red-700">
                              החזר: ₪{item.cancellation.refundAmount}
                            </p>
                          </div>
                        )}

                        {/* ✅ Supplier Order Info */}
                        {item.supplierOrder?.supplierOrderNumber && !isCancelled && (
                          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-sm font-medium text-blue-900">
                              📦 הוזמן מספק
                            </p>
                            <p className="text-xs text-blue-700 mt-1">
                              מספר הזמנה: {item.supplierOrder.supplierOrderNumber}
                            </p>
                            {item.supplierOrder.supplierTrackingNumber && (
                              <p className="text-xs text-blue-700">
                                מעקב: {item.supplierOrder.supplierTrackingNumber}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ✅ Item Actions */}
                    {!isCancelled && (
                      <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                        {/* Order from Supplier Button */}
                        {isPending && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleOrderFromSupplier(item)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <ShoppingBag className="w-4 h-4 ml-2" />
                            הזמן מספק
                          </Button>
                        )}

                        {/* Update Status Button */}
                        {!isPending && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateStatus(item)}
                            disabled={updateStatusMutation.isPending}
                          >
                            עדכן סטטוס
                          </Button>
                        )}

                        {/* Supplier Link */}
                        {item.supplierLink && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(item.supplierLink, '_blank')}
                          >
                            קישור ספק
                            <ExternalLink className="w-3 h-3 mr-2" />
                          </Button>
                        )}

                        {/* History Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShowHistory(item)}
                        >
                          היסטוריה
                        </Button>

                        {/* Cancel Item Button */}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancelItem(item)}
                          className="mr-auto"
                        >
                          בטל פריט
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ✅ Pricing Summary with Refunds */}
            <div className="mt-6 pt-6 border-t-2 border-gray-300 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">סכום ביניים:</span>
                <span>₪{order.pricing?.subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">משלוח:</span>
                {order.pricing?.shipping === 0 ? (
                  <span className="text-green-600 font-medium">חינם 🎉</span>
                ) : (
                  <span>₪{order.pricing?.shipping?.toLocaleString()}</span>
                )}
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">מע"מ:</span>
                <span>₪{order.pricing?.tax?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium pt-2 border-t border-gray-200">
                <span className="text-gray-600">סכום מקורי:</span>
                <span>₪{order.pricing?.total?.toLocaleString()}</span>
              </div>
              {order.pricing?.totalRefunds > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>סה"כ החזרים:</span>
                  <span>-₪{order.pricing?.totalRefunds?.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                <span>סה"כ לתשלום:</span>
                <span>₪{(order.pricing?.adjustedTotal || order.pricing?.total)?.toLocaleString()}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar - Customer Info */}
        <div className="space-y-6">
          {/* Customer Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5" />
              פרטי לקוח
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">שם:</p>
                <SafeText as="p" className="font-medium">{order.shippingAddress?.fullName}</SafeText>
              </div>
              <div>
                <p className="text-gray-500">טלפון:</p>
                <SafeText as="p" className="font-medium">{order.shippingAddress?.phone}</SafeText>
              </div>
              <div>
                <p className="text-gray-500">אימייל:</p>
                <SafeText as="p" className="font-medium">{order.shippingAddress?.email}</SafeText>
              </div>
              <div className="pt-3 border-t">
                <p className="text-gray-500">כתובת:</p>
                <p className="font-medium">
                  <SafeText>{order.shippingAddress?.street}</SafeText>
                  {order.shippingAddress?.apartment && <>, דירה <SafeText>{order.shippingAddress.apartment}</SafeText></>}
                </p>
                <p className="font-medium">
                  <SafeText>{order.shippingAddress?.city}</SafeText>, <SafeText>{order.shippingAddress?.zipCode}</SafeText>
                </p>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5" />
              תשלום
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">סטטוס:</span>
                <Badge variant={order.payment?.status === 'completed' ? 'success' : 'warning'}>
                  {order.payment?.status === 'completed' ? 'שולם' : 'ממתין'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">אמצעי:</span>
                <span className="font-medium">{order.payment?.method}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Modals */}
      {orderSupplierModal && (
        <OrderFromSupplierModal
          item={orderSupplierModal}
          onConfirm={(data) => orderFromSupplierMutation.mutate({
            itemId: orderSupplierModal._id,
            data
          })}
          onClose={() => setOrderSupplierModal(null)}
        />
      )}

      {cancelModal && (
        <CancelItemModal
          item={cancelModal}
          onConfirm={(reason) => cancelItemMutation.mutate({
            itemId: cancelModal._id,
            reason
          })}
          onClose={() => setCancelModal(null)}
        />
      )}

      {historyModal && (
        <ItemHistoryModal
          item={historyModal}
          onClose={() => setHistoryModal(null)}
        />
      )}

      {updateStatusModal && (
        <UpdateStatusModal
          item={updateStatusModal}
          onConfirm={handleStatusChange}
          onClose={() => setUpdateStatusModal(null)}
        />
      )}
    </div>
  );
}
