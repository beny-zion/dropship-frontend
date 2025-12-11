'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import KPICardsRow from './KPICardsRow';
import QuickFilters from './QuickFilters';
import OrdersListWidget from './OrdersListWidget';
import { toast } from 'sonner';

export default function OrdersDashboard() {
  const [activeFilter, setActiveFilter] = useState('all');
  const router = useRouter();

  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId);
  };

  const handleQuickAction = (action, orderId) => {
    switch (action) {
      case 'print_label':
        toast.info('פונקציית הדפסת תווית - בפיתוח');
        break;

      case 'update_status':
        router.push(`/admin/orders/${orderId}`);
        break;

      default:
        break;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* KPI Cards */}
      <KPICardsRow onFilterClick={handleFilterChange} />

      {/* Quick Filters */}
      <QuickFilters
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
      />

      {/* Orders List */}
      <OrdersListWidget
        activeFilter={activeFilter}
        onQuickAction={handleQuickAction}
      />
    </div>
  );
}
