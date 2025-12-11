'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Store, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { adminApi } from '@/lib/api/admin';
import BrowserOrderModal from './BrowserOrderModal';

function calculateSelectedTotal(items, selectedIds) {
  return items
    .filter(item => selectedIds.includes(item.itemId))
    .reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

export default function SupplierBulkCard({ supplier }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Mutation להזמנה מרוכזת
  const bulkOrderMutation = useMutation({
    mutationFn: async (itemIds) => {
      const response = await adminApi.bulkOrderFromSupplier({
        supplierName: supplier.supplierName,
        itemIds,
        supplierOrderData: {
          notes: `הוזמן מרוכז מ-${supplier.supplierName}`
        }
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || `${data.totalOrdered} פריטים הוזמנו בהצלחה`);

      if (data.totalFailed > 0) {
        toast.warning(`${data.totalFailed} פריטים נכשלו`, {
          description: 'בדוק את הפרטים לפרטים נוספים'
        });
      }

      // רענן את הנתונים
      queryClient.invalidateQueries(['admin', 'suppliers', 'pending-items']);
      setSelectedItems([]);
    },
    onError: (error) => {
      toast.error('שגיאה בהזמנה מרוכזת', {
        description: error.response?.data?.message || error.message
      });
    }
  });

  const handleBulkOrder = () => {
    // פתיחת המודל החדש במקום הזמנה ישירה
    setOrderModalOpen(true);
  };

  const toggleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(supplier.items.map(i => i.itemId));
    } else {
      setSelectedItems([]);
    }
  };

  const toggleItemSelection = (itemId, checked) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    }
  };

  const allSelected = selectedItems.length === supplier.items.length && supplier.items.length > 0;
  const someSelected = selectedItems.length > 0 && selectedItems.length < supplier.items.length;

  return (
    <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-blue-50 border-b border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>

            <div>
              <h3 className="text-lg font-medium">{supplier.supplierName}</h3>
              <p className="text-sm text-neutral-600">
                {supplier.totalItems} פריטים •
                ₪{supplier.totalCost.toLocaleString()} סה"כ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="outline"
              className="bg-white"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {isExpanded ? 'סגור' : 'הרחב'}
            </Button>

            <Button
              onClick={handleBulkOrder}
              disabled={bulkOrderMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Package className="w-4 h-4 ml-2" />
              {selectedItems.length > 0
                ? `התחל הזמנה (${selectedItems.length})`
                : 'התחל הזמנה'
              }
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded Items List */}
      {isExpanded && (
        <div className="p-6">
          {/* Select All */}
          <div className="mb-4 flex items-center gap-2 pb-3 border-b border-neutral-200">
            <Checkbox
              checked={allSelected}
              onCheckedChange={toggleSelectAll}
              className="data-[state=checked]:bg-blue-600"
            />
            <span className="text-sm font-medium">
              בחר הכל ({supplier.items.length} פריטים)
            </span>
          </div>

          {/* Items List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {supplier.items.map(item => (
              <div
                key={item.itemId}
                className="flex items-center gap-4 p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <Checkbox
                  checked={selectedItems.includes(item.itemId)}
                  onCheckedChange={(checked) => toggleItemSelection(item.itemId, checked)}
                  className="data-[state=checked]:bg-blue-600"
                />

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      href={`/admin/orders/${item.orderId}`}
                      className="text-sm font-medium hover:underline text-blue-600"
                    >
                      הזמנה #{item.orderNumber}
                    </Link>
                    <span className="text-xs text-neutral-500">
                      {item.customer.name}
                    </span>
                  </div>

                  <p className="text-sm text-neutral-700 line-clamp-1">
                    {item.itemName}
                  </p>

                  {/* Variant Details */}
                  {item.variantDetails && (item.variantDetails.color || item.variantDetails.size) && (
                    <div className="flex gap-2 mt-1">
                      {item.variantDetails.color && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                          צבע: {item.variantDetails.color}
                        </span>
                      )}
                      {item.variantDetails.size && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                          מידה: {item.variantDetails.size}
                        </span>
                      )}
                    </div>
                  )}

                  {item.supplierLink && (
                    <a
                      href={item.supplierLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                    >
                      קישור למוצר ↗
                    </a>
                  )}
                </div>

                <div className="text-left">
                  <p className="text-sm font-medium">
                    ₪{item.price.toLocaleString()}
                  </p>
                  <p className="text-xs text-neutral-500">
                    כמות: {item.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">
                  {selectedItems.length > 0
                    ? `נבחרו ${selectedItems.length} מתוך ${supplier.items.length} פריטים`
                    : `סה"כ ${supplier.items.length} פריטים`
                  }
                </span>
                {selectedItems.length > 0 && (
                  <button
                    onClick={() => setSelectedItems([])}
                    className="text-sm text-blue-600 hover:underline mr-3"
                  >
                    נקה בחירה
                  </button>
                )}
              </div>
              <span className="text-lg font-bold text-blue-600">
                ₪{(selectedItems.length > 0
                  ? calculateSelectedTotal(supplier.items, selectedItems)
                  : supplier.totalCost
                ).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Browser Order Modal */}
      <BrowserOrderModal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        supplier={supplier}
        items={selectedItems.length > 0
          ? supplier.items.filter(item => selectedItems.includes(item.itemId))
          : supplier.items
        }
        onOrderComplete={async (orderData) => {
          // שליחת הזמנה לשרת
          const response = await adminApi.bulkOrderFromSupplier({
            supplierName: orderData.supplierName,
            orderedItems: orderData.orderedItems.map(item => item.itemId),
            unavailableItems: orderData.unavailableItems.map(item => ({
              itemId: item.itemId,
              productId: item.productId,
              variantSku: item.variantSku
            })),
            supplierOrderData: {
              supplierOrderNumber: orderData.supplierOrderNumber,
              trackingNumber: orderData.trackingNumber,
              notes: orderData.notes
            }
          });

          // רענון נתונים
          queryClient.invalidateQueries(['admin', 'suppliers', 'pending-items']);
          setSelectedItems([]);

          return response;
        }}
      />
    </div>
  );
}
