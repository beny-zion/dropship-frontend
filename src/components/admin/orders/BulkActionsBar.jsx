// components/admin/orders/BulkActionsBar.jsx
// Phase 11: Bulk Actions for Multiple Orders

'use client';

import { useState } from 'react';
import {
  CheckSquare,
  Square,
  Package,
  Truck,
  Download,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { toast } from 'sonner';

export default function BulkActionsBar({
  selectedOrders,
  totalOrders,
  onSelectAll,
  onClearSelection,
  onActionComplete
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState('');

  const selectedCount = selectedOrders.length;
  const isAllSelected = selectedCount === totalOrders && totalOrders > 0;

  // Export selected orders to CSV
  const handleExportCSV = async () => {
    if (selectedCount === 0) return;

    setIsLoading(true);
    setLoadingAction('export');

    try {
      // Build CSV content
      const headers = [
        'מספר הזמנה',
        'תאריך',
        'לקוח',
        'אימייל',
        'טלפון',
        'סכום',
        'סטטוס תשלום',
        'סטטוס הזמנה'
      ];

      const rows = selectedOrders.map(order => [
        order.orderNumber || '',
        new Date(order.createdAt).toLocaleDateString('he-IL'),
        `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim(),
        order.user?.email || '',
        order.user?.phone || '',
        order.pricing?.adjustedTotal || order.pricing?.total || 0,
        order.payment?.status || '',
        order.computed?.overallProgress || order.status || ''
      ]);

      // Create CSV string
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      // Add BOM for Hebrew support
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' });

      // Download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orders-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`${selectedCount} הזמנות יוצאו בהצלחה`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('שגיאה בייצוא הנתונים');
    } finally {
      setIsLoading(false);
      setLoadingAction('');
    }
  };

  // Bulk update status (mark as ordered from supplier)
  const handleBulkMarkOrdered = async () => {
    if (selectedCount === 0) return;

    setIsLoading(true);
    setLoadingAction('ordered');

    try {
      // Get order IDs
      const orderIds = selectedOrders.map(o => o._id);

      // Call API (we'll implement this endpoint)
      const response = await adminApi.bulkUpdateOrderStatus(orderIds, 'ordered');

      if (response.success) {
        toast.success(`${response.updated || selectedCount} הזמנות עודכנו בהצלחה`);
        onActionComplete?.();
        onClearSelection();
      } else {
        throw new Error(response.message || 'שגיאה בעדכון');
      }
    } catch (error) {
      console.error('Bulk update error:', error);
      toast.error(error.message || 'שגיאה בעדכון ההזמנות');
    } finally {
      setIsLoading(false);
      setLoadingAction('');
    }
  };

  // Bulk mark as shipped
  const handleBulkMarkShipped = async () => {
    if (selectedCount === 0) return;

    setIsLoading(true);
    setLoadingAction('shipped');

    try {
      const orderIds = selectedOrders.map(o => o._id);
      const response = await adminApi.bulkUpdateOrderStatus(orderIds, 'shipped');

      if (response.success) {
        toast.success(`${response.updated || selectedCount} הזמנות עודכנו בהצלחה`);
        onActionComplete?.();
        onClearSelection();
      } else {
        throw new Error(response.message || 'שגיאה בעדכון');
      }
    } catch (error) {
      console.error('Bulk update error:', error);
      toast.error(error.message || 'שגיאה בעדכון ההזמנות');
    } finally {
      setIsLoading(false);
      setLoadingAction('');
    }
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 sticky top-0 z-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Selection Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={isAllSelected ? onClearSelection : onSelectAll}
            className="flex items-center gap-2 text-blue-700 hover:text-blue-900 font-medium"
          >
            {isAllSelected ? (
              <CheckSquare className="w-5 h-5" />
            ) : (
              <Square className="w-5 h-5" />
            )}
            <span className="text-sm">
              {isAllSelected ? 'בטל הכל' : 'בחר הכל'}
            </span>
          </button>

          <div className="h-6 w-px bg-blue-300" />

          <span className="text-sm text-blue-800 font-medium">
            נבחרו {selectedCount} הזמנות
          </span>

          <button
            onClick={onClearSelection}
            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-300 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-50 disabled:opacity-50 transition-colors"
          >
            {loadingAction === 'export' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            ייצוא CSV
          </button>

          {/* Mark as Ordered */}
          <button
            onClick={handleBulkMarkOrdered}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-300 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-50 disabled:opacity-50 transition-colors"
          >
            {loadingAction === 'ordered' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Package className="w-4 h-4" />
            )}
            סמן כהוזמן
          </button>

          {/* Mark as Shipped */}
          <button
            onClick={handleBulkMarkShipped}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loadingAction === 'shipped' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Truck className="w-4 h-4" />
            )}
            סמן כנשלח
          </button>
        </div>
      </div>
    </div>
  );
}
