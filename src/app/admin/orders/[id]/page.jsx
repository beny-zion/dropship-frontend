// app/admin/orders/[id]/page.jsx - Enhanced Order Detail Page with Item Management
//
// ✅ זה הקובץ המשודרג - להחליף את page.jsx הקיים

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
  ExternalLink,
  Lock
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

// ✅ ייבוא הקומפוננטות החדשות
import ItemStatusBadge from '@/components/admin/orders/ItemStatusBadge';
import ItemStatusSelector from '@/components/admin/orders/ItemStatusSelector';
import OrderFromSupplierModal from '@/components/admin/orders/OrderFromSupplierModal';
import CancelItemModal from '@/components/admin/orders/CancelItemModal';
import { AddTrackingModal } from '@/components/admin/orders/AddTrackingModal';
import OrderMinimumWarning from '@/components/admin/orders/OrderMinimumWarning';
import ManualStatusOverrideModal from '@/components/admin/orders/ManualStatusOverrideModal';
import { CopyableText } from '@/components/admin/CopyButton';
import { ITEM_STATUS } from '@/lib/constants/itemStatuses';
import {
  updateItemStatus,
  orderItemFromSupplier,
  cancelOrderItem,
  updateIsraelTracking,
  updateCustomerTracking,
  manualStatusOverride
} from '@/lib/api/orderItems';

// ✅ ייבוא מקור מרכזי לסטטוסים
import { getAllStatusConfigs, getStatusConfig } from '@/lib/constants/orderStatuses';

// ✅ קבלת כל הסטטוסים מהמקור המרכזי (כולל Legacy)
const statusConfig = getAllStatusConfigs(false);

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();

  // ✅ מצב למודלים
  const [orderSupplierModal, setOrderSupplierModal] = useState(null);
  const [cancelModal, setCancelModal] = useState(null);
  const [trackingModal, setTrackingModal] = useState(null); // { itemId, type: 'israel' | 'customer' }
  const [manualOverrideModal, setManualOverrideModal] = useState(null); // Phase 9.3
  const [statusSuggestion, setStatusSuggestion] = useState(null);

  // Fetch order
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'order', params.id],
    queryFn: () => adminApi.getOrderById(params.id)
  });

  const order = data?.data;

  // ✅ Mutation להזמנה מספק
  const orderFromSupplierMutation = useMutation({
    mutationFn: ({ itemId, data }) => orderItemFromSupplier(params.id, itemId, data),
    onSuccess: () => {
      toast.success('הפריט הוזמן בהצלחה מהספק');
      queryClient.invalidateQueries(['admin', 'order', params.id]);
      setOrderSupplierModal(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'שגיאה בהזמנה מספק');
    }
  });

  // ✅ Mutation לעדכון סטטוס
  const updateStatusMutation = useMutation({
    mutationFn: ({ itemId, newStatus }) => updateItemStatus(params.id, itemId, newStatus),
    onSuccess: (response) => {
      toast.success('הסטטוס עודכן בהצלחה');

      // שמור הצעת עדכון סטטוס
      if (response.data?.data?.orderStatusSuggestion) {
        setStatusSuggestion(response.data.data.orderStatusSuggestion);
      }

      queryClient.invalidateQueries(['admin', 'order', params.id]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'שגיאה בעדכון הסטטוס');
    }
  });

  // ✅ Mutation לביטול פריט
  const cancelItemMutation = useMutation({
    mutationFn: ({ itemId, reason }) => cancelOrderItem(params.id, itemId, reason),
    onSuccess: (response) => {
      // Handle both nested and direct data structure
      const data = response?.data?.data || response?.data;

      console.log('Cancel item response:', response.data);

      toast.success(data?.message || 'הפריט בוטל בהצלחה');

      // הצג אזהרה אם לא עומד במינימום
      if (data?.orderUpdate && !data.orderUpdate.meetsMinimum) {
        toast.warning('שים לב: ההזמנה לא עומדת במינימום!', {
          duration: 5000
        });
      }

      // שמור הצעת עדכון סטטוס - תומך בשני מבנים אפשריים
      const suggestion = data?.orderStatusSuggestion || response?.data?.orderStatusSuggestion;
      if (suggestion) {
        // אם זה אובייקט עם מבנה מלא, המר אותו לטקסט
        if (typeof suggestion === 'object' && suggestion.message) {
          setStatusSuggestion(suggestion.message);
        } else if (typeof suggestion === 'string') {
          setStatusSuggestion(suggestion);
        }
      }

      queryClient.invalidateQueries(['admin', 'order', params.id]);
      setCancelModal(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'שגיאה בביטול הפריט');
    }
  });

  // ✅ Mutation לעדכון סטטוס ראשי
  const updateOrderStatusMutation = useMutation({
    mutationFn: (newStatus) => adminApi.updateOrderStatus(params.id, newStatus),
    onSuccess: () => {
      toast.success('סטטוס ההזמנה עודכן בהצלחה');
      setStatusSuggestion(null);
      queryClient.invalidateQueries(['admin', 'order', params.id]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'שגיאה בעדכון סטטוס ההזמנה');
    }
  });

  // ✅ Mutation לעדכון tracking
  const updateTrackingMutation = useMutation({
    mutationFn: ({ itemId, data, type }) => {
      if (type === 'israel') {
        return updateIsraelTracking(params.id, itemId, data);
      } else {
        return updateCustomerTracking(params.id, itemId, data);
      }
    },
    onSuccess: () => {
      toast.success('מספר מעקב נוסף בהצלחה');
      queryClient.invalidateQueries(['admin', 'order', params.id]);
      setTrackingModal(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'שגיאה בהוספת מספר מעקב');
    }
  });

  // ✅ Phase 9.3: Mutation לנעילת/שחרור סטטוס ידני
  const manualOverrideMutation = useMutation({
    mutationFn: ({ itemId, data }) => manualStatusOverride(params.id, itemId, data),
    onSuccess: (response) => {
      const message = response.data?.message || 'הפעולה בוצעה בהצלחה';
      toast.success(message);

      if (response.data?.warning) {
        toast.warning(response.data.warning, { duration: 5000 });
      }

      queryClient.invalidateQueries(['admin', 'order', params.id]);
      setManualOverrideModal(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'שגיאה בנעילת הסטטוס');
    }
  });

  const handleOrderFromSupplier = (item) => {
    setOrderSupplierModal(item);
  };

  const handleCancelItem = (item) => {
    setCancelModal(item);
  };

  const handleStatusChange = (itemId, newStatus) => {
    if (newStatus) {
      updateStatusMutation.mutate({ itemId, newStatus });
    }
  };

  const handleAddTracking = (itemId, type) => {
    setTrackingModal({ itemId, type });
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
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">הזמנה</h1>
              <CopyableText
                text={order.orderNumber}
                label="מספר הזמנה"
                mono={true}
                className="text-base"
              />
            </div>
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
              if (window.confirm(`האם לעדכן את סטטוס ההזמנה ל-${statusConfig[e.target.value]?.label}?`)) {
                updateOrderStatusMutation.mutate(e.target.value);
              }
            }}
            className="text-sm border border-gray-300 rounded px-3 py-1.5 focus:border-blue-500 focus:outline-none"
          >
            {Object.entries(statusConfig).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ✅ אזהרת מינימום */}
      <OrderMinimumWarning order={order} />

      {/* ✅ הצעת עדכון סטטוס */}
      {statusSuggestion && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900">הצעה לעדכון סטטוס הזמנה</h3>
                <p className="text-sm text-blue-700 mt-1">{statusSuggestion}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  // חלץ את הסטטוס החדש מההודעה
                  const match = statusSuggestion.match(/ל-'(.+?)'/);
                  if (match && match[1]) {
                    const statusMap = {
                      'ממתין לאישור': 'pending',
                      'מסגרת אשראי תפוסה': 'payment_hold',
                      'הוזמן מארה"ב': 'ordered',
                      'הגיע למחסן ארה"ב': 'arrived_us_warehouse',
                      'נשלח לישראל': 'shipped_to_israel',
                      'במכס בישראל': 'customs_israel',
                      'הגיע למחסן בישראל': 'arrived_israel_warehouse',
                      'נשלח ללקוח': 'shipped_to_customer',
                      'נמסר': 'delivered',
                      'בוטל': 'cancelled'
                    };
                    const newStatus = statusMap[match[1]];
                    if (newStatus) {
                      updateOrderStatusMutation.mutate(newStatus);
                    }
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                עדכן עכשיו
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setStatusSuggestion(null)}
              >
                התעלם
              </Button>
            </div>
          </div>
        </div>
      )}

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
              {order.items?.map((item, idx) => {
                const isCancelled = item.cancellation?.cancelled;
                const isPending = item.itemStatus === ITEM_STATUS.PENDING;

                return (
                  <div
                    key={item._id || `item-${idx}`}
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
                            <p className="font-medium text-gray-900">
                              {item.name}
                            </p>

                            {/* Variant Details */}
                            {item.variantDetails && (
                              <div className="flex gap-2 mt-1">
                                {item.variantDetails.color && (
                                  <Badge variant="outline" className="text-xs">
                                    {item.variantDetails.color}
                                  </Badge>
                                )}
                                {item.variantDetails.size && (
                                  <Badge variant="outline" className="text-xs">
                                    {item.variantDetails.size}
                                  </Badge>
                                )}
                              </div>
                            )}

                            <p className="text-sm text-gray-500 mt-1">
                              כמות: {item.quantity} × ₪{item.price?.toLocaleString()} = ₪{(item.quantity * item.price)?.toLocaleString()}
                            </p>

                            {item.supplierName && (
                              <p className="text-xs text-gray-400 mt-1">
                                ספק: {item.supplierName}
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
                              סיבה: {item.cancellation.reason}
                            </p>
                            <p className="text-xs text-red-700">
                              החזר: ₪{item.cancellation.refundAmount}
                            </p>
                          </div>
                        )}

                        {/* ✅ Supplier Order Info */}
                        {item.supplierOrder?.supplierOrderNumber && !isCancelled && (
                          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-sm font-medium text-blue-900 mb-2">
                              📦 הוזמן מספק
                            </p>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-blue-700">מספר הזמנה:</span>
                              <CopyableText
                                text={item.supplierOrder.supplierOrderNumber}
                                label="מספר הזמנה מספק"
                                mono={true}
                                className="bg-blue-100 border-blue-300"
                              />
                            </div>
                            {item.supplierOrder.supplierTrackingNumber && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-blue-700">מעקב:</span>
                                <CopyableText
                                  text={item.supplierOrder.supplierTrackingNumber}
                                  label="מספר מעקב ספק"
                                  mono={true}
                                  className="bg-blue-100 border-blue-300"
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {/* ✅ Israel Tracking Info */}
                        {item.israelTracking?.trackingNumber && !isCancelled && (
                          <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded">
                            <p className="text-sm font-medium text-purple-900 mb-2">
                              ✈️ משלוח בינלאומי
                            </p>
                            <p className="text-xs text-purple-700 mb-1">
                              חברה: {item.israelTracking.carrier}
                            </p>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-purple-700">מעקב:</span>
                              <CopyableText
                                text={item.israelTracking.trackingNumber}
                                label="מספר מעקב בינלאומי"
                                mono={true}
                                className="bg-purple-100 border-purple-300"
                              />
                            </div>
                            {item.israelTracking.estimatedArrival && (
                              <p className="text-xs text-purple-700">
                                הגעה משוערת: {new Date(item.israelTracking.estimatedArrival).toLocaleDateString('he-IL')}
                              </p>
                            )}
                          </div>
                        )}

                        {/* ✅ Customer Tracking Info */}
                        {item.customerTracking?.trackingNumber && !isCancelled && (
                          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                            <p className="text-sm font-medium text-green-900 mb-2">
                              🚚 משלוח ללקוח
                            </p>
                            <p className="text-xs text-green-700 mb-1">
                              חברה: {item.customerTracking.carrier}
                            </p>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-green-700">מעקב:</span>
                              <CopyableText
                                text={item.customerTracking.trackingNumber}
                                label="מספר מעקב ללקוח"
                                mono={true}
                                className="bg-green-100 border-green-300"
                              />
                            </div>
                            {item.customerTracking.estimatedDelivery && (
                              <p className="text-xs text-green-700">
                                משלוח משוער: {new Date(item.customerTracking.estimatedDelivery).toLocaleDateString('he-IL')}
                              </p>
                            )}
                          </div>
                        )}

                        {/* ✅ Item Status History */}
                        {item.statusHistory && item.statusHistory.length > 0 && (
                          <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded">
                            <p className="text-sm font-medium text-gray-900 mb-2">
                              📋 היסטוריית סטטוסים ({item.statusHistory.length})
                            </p>
                            <div className="space-y-1.5">
                              {item.statusHistory.map((history, historyIdx) => (
                                <div key={historyIdx} className="flex flex-col text-xs bg-white p-2 rounded border border-gray-200">
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                      <ItemStatusBadge status={history.status} />
                                    </div>
                                    <span className="text-gray-500 whitespace-nowrap">
                                      {new Date(history.changedAt).toLocaleString('he-IL', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                  {history.notes && (
                                    <p className="text-gray-600 mr-4 text-xs">{history.notes}</p>
                                  )}
                                  {history.changedBy && (
                                    <p className="text-gray-400 mr-4 text-xs mt-1">
                                      על ידי: {history.changedBy.firstName} {history.changedBy.lastName}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
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

                        {/* Status Selector */}
                        {!isPending && (
                          <ItemStatusSelector
                            currentStatus={item.itemStatus}
                            onSelect={(newStatus) => handleStatusChange(item._id, newStatus)}
                            disabled={updateStatusMutation.isPending}
                          />
                        )}

                        {/* Phase 9.3: Manual Override Lock Button */}
                        {!isPending && (
                          <Button
                            variant={item.manualStatusOverride ? "default" : "outline"}
                            size="sm"
                            onClick={() => setManualOverrideModal(item)}
                            className={item.manualStatusOverride ? "bg-amber-600 hover:bg-amber-700 text-white" : "text-neutral-600"}
                            title={item.manualStatusOverride ? "סטטוס נעול - האוטומציה לא תשנה" : "נעל סטטוס (למקרים חריגים)"}
                          >
                            {item.manualStatusOverride ? '🔒 נעול' : '🔓'}
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

                        {/* Add Israel Tracking Button */}
                        {item.itemStatus === 'ordered' && !item.israelTracking?.trackingNumber && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddTracking(item._id, 'israel')}
                            className="bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100"
                          >
                            ✈️ הוסף מעקב בינלאומי
                          </Button>
                        )}

                        {/* Add Customer Tracking Button */}
                        {item.itemStatus === 'arrived_israel' && !item.customerTracking?.trackingNumber && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddTracking(item._id, 'customer')}
                            className="bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
                          >
                            🚚 הוסף מעקב ללקוח
                          </Button>
                        )}

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
              {order.pricing?.adjustedTotal !== undefined && order.pricing?.adjustedTotal !== order.pricing?.total ? (
                <>
                  {/* יש ביטולים - הצגה מפורטת */}
                  <div className="bg-gray-50 p-3 rounded border border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">סכומים מקוריים:</p>
                    <div className="flex justify-between text-sm text-gray-400">
                      <span className="line-through">סכום פריטים:</span>
                      <span className="line-through">₪{order.pricing?.subtotal?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span className="line-through">מתוכם מע"מ:</span>
                      <span className="line-through">₪{order.pricing?.tax?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-400">
                      <span className="line-through">משלוח:</span>
                      <span className="line-through">₪{order.pricing?.shipping?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 font-medium pt-1 border-t border-gray-300 mt-1">
                      <span className="line-through">סה"כ מקורי:</span>
                      <span className="line-through">₪{order.pricing?.total?.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="bg-green-50 p-3 rounded border border-green-200 mt-3">
                    <p className="text-xs text-green-700 mb-2">סכומים לחיוב:</p>
                    <div className="flex justify-between text-sm text-green-800">
                      <span>פריטים פעילים:</span>
                      <span>₪{order.pricing?.adjustedSubtotal?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between text-xs text-green-700">
                      <span>מתוכם מע"מ (18%):</span>
                      <span>₪{order.pricing?.adjustedTax?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm text-green-800">
                      <span>משלוח:</span>
                      {order.pricing?.adjustedShipping === 0 ? (
                        <span className="font-medium">בוטל - ₪0</span>
                      ) : (
                        <span>₪{order.pricing?.adjustedShipping?.toLocaleString() || 0}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-300 mt-2 text-red-600">
                    <span>הפרש (לא יגבה):</span>
                    <span>-₪{order.pricing?.totalRefunds?.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-xl font-bold pt-2 border-t-2 border-gray-400 text-green-700">
                    <span>סה"כ לחיוב בפועל:</span>
                    <span>₪{order.pricing?.adjustedTotal?.toLocaleString()}</span>
                  </div>

                  {order.pricing?.allItemsCancelled && (
                    <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-center">
                      <p className="text-sm font-medium text-red-900">
                        ⚠️ כל הפריטים בוטלו - אין חיוב
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* אין ביטולים - הצגה רגילה */}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">סכום פריטים:</span>
                    <span>₪{order.pricing?.subtotal?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>מתוכם מע"מ:</span>
                    <span>₪{order.pricing?.tax?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">משלוח:</span>
                    <span>₪{order.pricing?.shipping?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                    <span>סה"כ לתשלום:</span>
                    <span>₪{order.pricing?.total?.toLocaleString()}</span>
                  </div>
                </>
              )}
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
                <p className="font-medium">{order.shippingAddress?.fullName}</p>
              </div>
              <div>
                <p className="text-gray-500">טלפון:</p>
                <p className="font-medium">{order.shippingAddress?.phone}</p>
              </div>
              <div>
                <p className="text-gray-500">אימייל:</p>
                <p className="font-medium">{order.shippingAddress?.email}</p>
              </div>
              <div className="pt-3 border-t">
                <p className="text-gray-500">כתובת:</p>
                <p className="font-medium">
                  {order.shippingAddress?.street}
                  {order.shippingAddress?.apartment && `, דירה ${order.shippingAddress.apartment}`}
                </p>
                <p className="font-medium">
                  {order.shippingAddress?.city}, {order.shippingAddress?.zipCode}
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
            <div className="space-y-3 text-sm">
              {/* Payment Status */}
              <div>
                <p className="text-gray-500 mb-1">סטטוס:</p>
                <div>
                  {order.payment?.status === 'pending' && (
                    <Badge className="bg-gray-100 text-gray-700">⏱️ ממתין לתשלום</Badge>
                  )}
                  {order.payment?.status === 'hold' && (
                    <Badge className="bg-blue-100 text-blue-700">💳 מסגרת תפוסה</Badge>
                  )}
                  {order.payment?.status === 'ready_to_charge' && (
                    <Badge className="bg-yellow-100 text-yellow-700">⏳ מוכן לחיוב</Badge>
                  )}
                  {order.payment?.status === 'charged' && (
                    <Badge className="bg-green-100 text-green-700">✅ חויב בהצלחה</Badge>
                  )}
                  {order.payment?.status === 'cancelled' && (
                    <Badge className="bg-red-100 text-red-700">❌ בוטל</Badge>
                  )}
                  {order.payment?.status === 'failed' && (
                    <Badge className="bg-red-100 text-red-700">⚠️ נכשל</Badge>
                  )}
                </div>
              </div>

              {/* Transaction ID */}
              {order.payment?.hypTransactionId && (
                <div>
                  <p className="text-gray-500 mb-1">מזהה עסקה:</p>
                  <CopyableText
                    text={order.payment.hypTransactionId}
                    label="מזהה עסקה"
                    mono={true}
                  />
                </div>
              )}

              {/* Hold Amount */}
              {order.payment?.holdAmount && (
                <div>
                  <p className="text-gray-500">מסגרת שתפסנו:</p>
                  <p className="font-medium">₪{order.payment.holdAmount.toLocaleString()}</p>
                  {order.payment.holdAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      בתאריך: {new Date(order.payment.holdAt).toLocaleString('he-IL')}
                    </p>
                  )}
                </div>
              )}

              {/* Charged Amount */}
              {order.payment?.chargedAmount && (
                <div>
                  <p className="text-gray-500">סכום שחויב:</p>
                  <p className="font-medium text-green-600">₪{order.payment.chargedAmount.toLocaleString()}</p>
                  {order.payment.chargedAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      בתאריך: {new Date(order.payment.chargedAt).toLocaleString('he-IL')}
                    </p>
                  )}
                </div>
              )}

              {/* Payment Method */}
              {order.payment?.method && (
                <div>
                  <p className="text-gray-500">אמצעי:</p>
                  <p className="font-medium">{order.payment.method === 'credit_card' ? 'כרטיס אשראי' : order.payment.method}</p>
                </div>
              )}

              {/* Last Error */}
              {order.payment?.lastError && (
                <div className="p-2 bg-red-50 border border-red-200 rounded">
                  <p className="text-xs font-medium text-red-900">שגיאה אחרונה:</p>
                  <p className="text-xs text-red-700 mt-1">{order.payment.lastError}</p>
                </div>
              )}

              {/* Payment History */}
              {order.payment?.history && order.payment.history.length > 0 && (
                <div className="pt-3 border-t">
                  <p className="text-gray-500 mb-2">היסטוריה:</p>
                  <div className="space-y-2">
                    {order.payment.history.map((event, idx) => (
                      <div key={idx} className="text-xs bg-gray-50 p-2 rounded border">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-700">{event.status}</span>
                          <span className="text-gray-500">
                            {new Date(event.timestamp).toLocaleString('he-IL', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        {event.amount && (
                          <p className="text-gray-600 mt-1">סכום: ₪{event.amount.toLocaleString()}</p>
                        )}
                        {event.message && (
                          <p className="text-gray-600 mt-1">{event.message}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Order Timeline */}
      {order.timeline && order.timeline.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-6">
            <Package className="w-5 h-5" />
            ציר זמן של ההזמנה ({order.timeline.length} אירועים)
          </h2>
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
                  <div className="flex items-start justify-between">
                    <p className="font-medium text-sm text-gray-900">{event.message}</p>
                    <p className="text-xs text-gray-500 mr-4 whitespace-nowrap">
                      {new Date(event.timestamp).toLocaleString('he-IL', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  {event.details && (
                    <p className="text-xs text-gray-600 mt-1">{event.details}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {trackingModal && (
        <AddTrackingModal
          isOpen={true}
          onClose={() => setTrackingModal(null)}
          type={trackingModal.type}
          onConfirm={(data) => updateTrackingMutation.mutate({
            itemId: trackingModal.itemId,
            data,
            type: trackingModal.type
          })}
        />
      )}

      {/* Phase 9.3: Manual Status Override Modal */}
      {manualOverrideModal && (
        <ManualStatusOverrideModal
          item={manualOverrideModal}
          onClose={() => setManualOverrideModal(null)}
          onConfirm={(data) => manualOverrideMutation.mutate({
            itemId: manualOverrideModal._id,
            data
          })}
          isLoading={manualOverrideMutation.isPending}
        />
      )}
    </div>
  );
}
