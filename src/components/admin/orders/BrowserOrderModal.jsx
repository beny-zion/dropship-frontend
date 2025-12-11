'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { X, ExternalLink, CheckCircle2, Circle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { adminApi } from '@/lib/api/admin';
import ProductAvailabilityModal from './ProductAvailabilityModal';

export default function BrowserOrderModal({
  isOpen,
  onClose,
  supplier,
  items,
  onOrderComplete
}) {
  const queryClient = useQueryClient();

  const [orderItems, setOrderItems] = useState(() =>
    items.map(item => ({
      ...item,
      addedToCart: false,
      ordered: false,
      markedUnavailable: false
    }))
  );

  const [supplierOrderNumber, setSupplierOrderNumber] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal למוצר לא זמין
  const [unavailableModalOpen, setUnavailableModalOpen] = useState(false);
  const [selectedUnavailableItem, setSelectedUnavailableItem] = useState(null);

  // Ref לקונטיינר המודל
  const modalContainerRef = useRef(null);

  // Ref לחלון popup
  const popupWindowRef = useRef(null);
  const popupCheckIntervalRef = useRef(null);

  // גלילה למעלה כשהמודל נפתח
  useEffect(() => {
    if (isOpen) {
      // גלילה למעלה של הקונטיינר
      if (modalContainerRef.current) {
        modalContainerRef.current.scrollTop = 0;
      }
      // גם גלילה למעלה של החלון
      window.scrollTo({ top: 0, behavior: 'instant' });
      // נעילת הגוף כדי למנוע גלילה ברקע
      document.body.style.overflow = 'hidden';
    } else {
      // שחרור הנעילה כשהמודל נסגר
      document.body.style.overflow = 'unset';
    }

    // ניקוי
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // עדכון סטטוס פריט בודד
  const updateItemStatus = (itemId, field, value) => {
    setOrderItems(prev => prev.map(item =>
      item.itemId === itemId
        ? { ...item, [field]: value }
        : item
    ));
  };

  // פתיחת קישור ספציפי של מוצר בחלון popup
  const openProductLink = (e, productUrl, itemName) => {
    e.preventDefault();
    e.stopPropagation();

    if (!productUrl) {
      toast.warning('אין קישור למוצר זה');
      return;
    }

    // פתיחת חלון popup
    const width = 1200;
    const height = 800;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    popupWindowRef.current = window.open(
      productUrl,
      'productOrder',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    // התחל לעקוב אחרי החלון
    if (popupWindowRef.current) {
      toast.info(`נפתח חלון למוצר`, {
        description: itemName,
        duration: 3000
      });

      // בדיקה כל שנייה אם החלון נסגר
      popupCheckIntervalRef.current = setInterval(() => {
        if (popupWindowRef.current && popupWindowRef.current.closed) {
          clearInterval(popupCheckIntervalRef.current);
          popupWindowRef.current = null;

          // החלון נסגר - הצג שאלון
          handlePopupClosed();
        }
      }, 1000);
    } else {
      toast.error('לא הצלחנו לפתוח חלון', {
        description: 'אנא בדוק שהדפדפן לא חוסם חלונות קופצים'
      });
    }
  };

  // פונקציה שמופעלת כשהחלון נסגר
  const handlePopupClosed = () => {
    // הצג toast עם שאלה
    toast.info('החלון נסגר - האם הצלחת להזמין?', {
      description: 'אם כן, סמן את המוצרים שהוזמנו למטה',
      duration: 5000
    });

    // גלול למעלה למודל
    if (modalContainerRef.current) {
      modalContainerRef.current.scrollTop = 0;
    }
  };

  // ניקוי interval כשהמודל נסגר
  useEffect(() => {
    return () => {
      if (popupCheckIntervalRef.current) {
        clearInterval(popupCheckIntervalRef.current);
      }
    };
  }, []);

  // פתיחת מודל "סמן כלא זמין"
  const handleMarkUnavailable = (item) => {
    setSelectedUnavailableItem(item);
    setUnavailableModalOpen(true);
  };

  // אחרי סימון כלא זמין
  const handleUnavailableConfirmed = async () => {
    if (!selectedUnavailableItem) return;

    try {
      // שליחה מיידית לשרת לסימון המוצר כלא זמין
      const response = await adminApi.bulkOrderFromSupplier({
        supplierName: supplier.supplierName,
        orderedItems: [], // אין פריטים מוזמנים
        unavailableItems: [{
          itemId: selectedUnavailableItem.itemId,
          productId: selectedUnavailableItem.productId,
          variantSku: selectedUnavailableItem.variantSku
        }],
        supplierOrderData: {
          supplierOrderNumber: 'N/A - Item Unavailable',
          notes: 'מוצר לא זמין באתר הספק'
        }
      });

      // עדכון State המקומי
      updateItemStatus(selectedUnavailableItem.itemId, 'markedUnavailable', true);
      updateItemStatus(selectedUnavailableItem.itemId, 'ordered', false);

      // רענון הרשימה כדי שהפריט יוסר או יופיע בצבע אדום
      queryClient.invalidateQueries(['admin', 'suppliers', 'pending-items']);

      toast.success('המוצר סומן כלא זמין והוסר מהמלאי', {
        description: 'הפריט בוטל והמוצר לא יופיע יותר באתר'
      });
    } catch (error) {
      toast.error('שגיאה בסימון המוצר כלא זמין', {
        description: error.response?.data?.message || error.message
      });
    } finally {
      setUnavailableModalOpen(false);
      setSelectedUnavailableItem(null);
    }
  };

  // סטטיסטיקות
  const stats = useMemo(() => {
    const addedToCart = orderItems.filter(item => item.addedToCart).length;
    const ordered = orderItems.filter(item => item.ordered).length;
    const unavailable = orderItems.filter(item => item.markedUnavailable).length;
    const pending = orderItems.length - ordered - unavailable;

    return { addedToCart, ordered, unavailable, pending };
  }, [orderItems]);

  // ולידציה לפני שמירה
  const validateAndSubmit = async () => {
    // בדיקה 1: מספר הזמנה
    if (!supplierOrderNumber.trim()) {
      toast.error('חובה להזין מספר הזמנה של הספק');
      return;
    }

    // בדיקה 2: לפחות פריט אחד הוזמן
    if (stats.ordered === 0) {
      toast.error('לא נבחרו פריטים שהוזמנו', {
        description: 'נא לסמן לפחות פריט אחד כ"הוזמן"'
      });
      return;
    }

    // בדיקה 3: פריטים שלא טופלו
    const unhandledItems = orderItems.filter(
      item => !item.ordered && !item.markedUnavailable
    );

    if (unhandledItems.length > 0) {
      const confirmed = confirm(
        `⚠️ יש ${unhandledItems.length} פריטים שלא טופלו.\n` +
        `האם להמשיך ולשמור רק את הפריטים שהוזמנו?\n\n` +
        `(הפריטים שלא טופלו יישארו בסטטוס "ממתין")`
      );

      if (!confirmed) return;
    }

    // שליחה
    setIsSubmitting(true);

    try {
      const orderedItemsList = orderItems.filter(item => item.ordered);
      const unavailableItemsList = orderItems.filter(item => item.markedUnavailable);

      await onOrderComplete({
        supplierName: supplier.supplierName,
        orderedItems: orderedItemsList,
        unavailableItems: unavailableItemsList,
        supplierOrderNumber: supplierOrderNumber.trim(),
        trackingNumber: trackingNumber.trim() || null,
        notes: notes.trim() || `הוזמן מרוכז מ-${supplier.supplierName}`
      });

      toast.success('ההזמנה הושלמה בהצלחה!', {
        description: `${stats.ordered} פריטים הוזמנו • ${stats.unavailable} לא זמינים`
      });

      onClose();
    } catch (error) {
      toast.error('שגיאה בשמירת ההזמנה', {
        description: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div ref={modalContainerRef} className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
        <div className="min-h-screen flex items-start justify-center p-4 py-8">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-neutral-200 bg-blue-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">
                  הזמנה מ-{supplier.supplierName}
                </h2>
                <p className="text-sm text-neutral-600 mt-1">
                  {items.length} פריטים • ₪{supplier.totalCost.toLocaleString()}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Stats Bar */}
            <div className="mt-4 grid grid-cols-4 gap-3">
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="text-xs text-neutral-500">בסל</p>
                <p className="text-lg font-bold text-blue-600">{stats.addedToCart}</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="text-xs text-neutral-500">הוזמנו</p>
                <p className="text-lg font-bold text-green-600">{stats.ordered}</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="text-xs text-neutral-500">לא זמינים</p>
                <p className="text-lg font-bold text-red-600">{stats.unavailable}</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="text-xs text-neutral-500">ממתינים</p>
                <p className="text-lg font-bold text-neutral-600">{stats.pending}</p>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="p-6">
            {/* הוראות */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                💡 <strong>איך להזמין:</strong> לחץ על "קישור" ליד כל מוצר כדי לפתוח את המוצר באתר הספק.
                החלון ייפתח, הזמן את המוצר, וסגור את החלון. אחר כך סמן כאן מה הוזמן.
              </p>
            </div>

            <div className="space-y-3">
              {orderItems.map((item) => (
                <div
                  key={item.itemId}
                  className={`border rounded-lg p-4 transition-all ${
                    item.markedUnavailable
                      ? 'bg-red-50 border-red-200'
                      : item.ordered
                      ? 'bg-green-50 border-green-200'
                      : item.addedToCart
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white border-neutral-200'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Image */}
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.itemName}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-neutral-900 line-clamp-1">
                            {item.itemName}
                          </h4>

                          {/* Variant Details */}
                          {item.variantDetails && (item.variantDetails.color || item.variantDetails.size) && (
                            <div className="flex gap-2 mt-1">
                              {item.variantDetails.color && (
                                <span className="text-xs bg-neutral-100 px-2 py-1 rounded">
                                  צבע: {item.variantDetails.color}
                                </span>
                              )}
                              {item.variantDetails.size && (
                                <span className="text-xs bg-neutral-100 px-2 py-1 rounded">
                                  מידה: {item.variantDetails.size}
                                </span>
                              )}
                            </div>
                          )}

                          <p className="text-xs text-neutral-500 mt-1">
                            <Link
                              href={`/admin/orders/${item.orderId}`}
                              className="text-blue-600 hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              הזמנה #{item.orderNumber}
                            </Link>
                            {' • '}
                            {item.customer.name}
                          </p>
                        </div>

                        <div className="text-left">
                          <p className="text-sm font-medium">₪{item.price.toLocaleString()}</p>
                          <p className="text-xs text-neutral-500">כמות: {item.quantity}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-4 mt-3">
                        {!item.markedUnavailable && (
                          <>
                            {/* Added to Cart */}
                            <label className="flex items-center gap-2 cursor-pointer">
                              <Checkbox
                                checked={item.addedToCart}
                                onCheckedChange={(checked) =>
                                  updateItemStatus(item.itemId, 'addedToCart', checked)
                                }
                                className="data-[state=checked]:bg-blue-600"
                              />
                              <span className="text-sm text-neutral-700">נכנס לסל</span>
                            </label>

                            {/* Ordered */}
                            <label className="flex items-center gap-2 cursor-pointer">
                              <Checkbox
                                checked={item.ordered}
                                onCheckedChange={(checked) =>
                                  updateItemStatus(item.itemId, 'ordered', checked)
                                }
                                className="data-[state=checked]:bg-green-600"
                              />
                              <span className="text-sm text-neutral-700">הוזמן</span>
                            </label>
                          </>
                        )}

                        {/* Mark Unavailable */}
                        {!item.markedUnavailable && (
                          <button
                            onClick={() => handleMarkUnavailable(item)}
                            className="text-xs text-red-600 hover:underline flex items-center gap-1"
                          >
                            <AlertTriangle className="w-3 h-3" />
                            דווח: לא זמין
                          </button>
                        )}

                        {item.markedUnavailable && (
                          <div className="flex items-center gap-1 text-red-600">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-sm font-medium">סומן כלא זמין</span>
                          </div>
                        )}

                        {/* Supplier Link */}
                        {item.supplierLink && (
                          <a
                            href={item.supplierLink}
                            onClick={(e) => openProductLink(e, item.supplierLink, item.itemName)}
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <ExternalLink className="w-3 h-3" />
                            קישור
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer - Order Details */}
          <div className="p-6 border-t border-neutral-200 bg-neutral-50">
            <div className="space-y-4">
              <div className="text-sm font-medium text-neutral-700 mb-3">
                פרטי ההזמנה מהספק
              </div>

              {/* Supplier Order Number */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  מספר הזמנה של {supplier.supplierName} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={supplierOrderNumber}
                  onChange={(e) => setSupplierOrderNumber(e.target.value)}
                  placeholder="לדוגמה: AMZ-123456789"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Tracking Number */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  מספר מעקב (אופציונלי)
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="לדוגמה: 1Z999AA1012345678"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  הערות
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="הערות נוספות..."
                  rows={2}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  ביטול
                </Button>
                <Button
                  onClick={validateAndSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {isSubmitting ? 'שומר...' : 'שמור והשלם הזמנה'}
                </Button>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Unavailable Modal */}
      {selectedUnavailableItem && (
        <ProductAvailabilityModal
          isOpen={unavailableModalOpen}
          onClose={() => {
            setUnavailableModalOpen(false);
            setSelectedUnavailableItem(null);
          }}
          item={selectedUnavailableItem}
          onConfirm={handleUnavailableConfirmed}
        />
      )}
    </>
  );
}
