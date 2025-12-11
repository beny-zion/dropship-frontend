/**
 * Order Statistics Panel
 *
 * פאנל סטטיסטיקות להזמנות - מציג מידע מרוכז על כל הפריטים
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import { ITEM_STATUS_LABELS } from '@/lib/constants/itemStatuses';
import { Package, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function OrderStatisticsPanel() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'item-statistics'],
    queryFn: async () => {
      const response = await adminApi.getItemStatistics();
      return response.data;
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="bg-white border border-neutral-200 p-6">
        <p className="text-sm text-neutral-500">טוען סטטיסטיקות...</p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    ordered_from_supplier: 'bg-blue-100 text-blue-800 border-blue-300',
    arrived_us_warehouse: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    shipped_to_israel: 'bg-purple-100 text-purple-800 border-purple-300',
    arrived_israel: 'bg-pink-100 text-pink-800 border-pink-300',
    ready_for_delivery: 'bg-orange-100 text-orange-800 border-orange-300',
    delivered: 'bg-green-100 text-green-800 border-green-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300'
  };

  return (
    <div className="bg-white border border-neutral-200">
      {/* Header */}
      <div className="border-b border-neutral-200 p-6">
        <h2 className="text-xl font-light tracking-wide flex items-center gap-2">
          <Package className="w-5 h-5" />
          סטטיסטיקות פריטים
        </h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 border-b border-neutral-200">
        <div className="bg-neutral-50 border border-neutral-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-neutral-600 mb-1">סך הכל פריטים</p>
              <p className="text-2xl font-light">{stats.totalItems}</p>
            </div>
            <Package className="w-8 h-8 text-neutral-400" />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600 mb-1">פריטים פעילים</p>
              <p className="text-2xl font-light text-blue-800">{stats.activeItems}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-red-600 mb-1">פריטים מבוטלים</p>
              <p className="text-2xl font-light text-red-800">{stats.cancelledItems}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-yellow-600 mb-1">פריטים תקועים</p>
              <p className="text-2xl font-light text-yellow-800">{stats.stuckItems}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="p-6">
        <h3 className="text-sm font-medium text-neutral-700 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          פילוח לפי סטטוס
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(stats.statusCounts || {}).map(([status, count]) => (
            <div
              key={status}
              className={`border p-3 ${statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-300'}`}
            >
              <p className="text-xs mb-1 opacity-80">
                {ITEM_STATUS_LABELS[status] || status}
              </p>
              <p className="text-xl font-light">{count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts Section */}
      {stats.stuckItems > 0 && (
        <div className="border-t border-neutral-200 p-6 bg-yellow-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800 mb-1">
                קיימים {stats.stuckItems} פריטים שלא התקדמו
              </p>
              <p className="text-xs text-yellow-700">
                לחץ על "הזמנות עם התראות" כדי לראות את הפרטים המלאים
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
