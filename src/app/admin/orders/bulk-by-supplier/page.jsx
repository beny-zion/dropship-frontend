'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Loader2, Store } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import SupplierBulkCard from '@/components/admin/orders/SupplierBulkCard';
import { adminApi } from '@/lib/api/admin';

export default function BulkOrdersBySupplierPage() {
  const { data: suppliers, isLoading, error } = useQuery({
    queryKey: ['admin', 'suppliers', 'pending-items'],
    queryFn: async () => {
      const response = await adminApi.getItemsGroupedBySupplier();
      return response.data;
    },
    refetchInterval: 60000 // כל דקה
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-medium">שגיאה בטעינת נתונים</p>
          <p className="text-sm text-neutral-600 mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  const totalPendingItems = suppliers?.reduce((sum, s) => sum + s.totalItems, 0) || 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/orders">
                <ArrowRight className="w-4 h-4 ml-2" />
                חזרה לרשימה
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              הזמנות מרוכזות לפי ספק
            </h1>
          </div>
          <p className="text-neutral-600 mt-2">
            ריכוז פריטים ממתינים לפי ספק להזמנה קלה ומהירה
          </p>
        </div>

        {totalPendingItems > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <p className="text-sm text-neutral-600">סה"כ פריטים ממתינים</p>
            <p className="text-2xl font-bold text-blue-600">{totalPendingItems}</p>
          </div>
        )}
      </div>

      {/* Empty State */}
      {(!suppliers || suppliers.length === 0) && (
        <div className="bg-white border border-neutral-200 rounded-lg p-12 text-center">
          <Store className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 mb-2">
            אין פריטים ממתינים להזמנה
          </h3>
          <p className="text-neutral-600">
            כל הפריטים כבר הוזמנו מהספקים, או שאין הזמנות חדשות
          </p>
          <Link href="/admin/orders">
            <Button variant="outline" className="mt-4">
              חזרה לרשימת הזמנות
            </Button>
          </Link>
        </div>
      )}

      {/* Suppliers List */}
      {suppliers && suppliers.length > 0 && (
        <div className="space-y-4">
          {suppliers.map(supplier => (
            <SupplierBulkCard
              key={supplier.supplierName}
              supplier={supplier}
            />
          ))}
        </div>
      )}
    </div>
  );
}
