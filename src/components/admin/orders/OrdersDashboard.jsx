// components/admin/orders/OrdersDashboard.jsx
// Phase 11: Enhanced Orders Dashboard with Advanced Filters

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import KPICardsRow from './KPICardsRow';
import QuickFilters from './QuickFilters';
import AdvancedFilters from './AdvancedFilters';
import OrdersListWidget from './OrdersListWidget';
import OrderSearchBar from './OrderSearchBar';
import { toast } from 'sonner';

const DEFAULT_ADVANCED_FILTERS = {
  paymentStatus: 'all',
  itemStatus: 'all',
  dateRange: { from: '', to: '' },
  datePreset: ''
};

export default function OrdersDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get filter from URL (from KPI card click in dashboard)
  const urlFilter = searchParams.get('filter');

  const [activeFilter, setActiveFilter] = useState(urlFilter || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [advancedFilters, setAdvancedFilters] = useState(DEFAULT_ADVANCED_FILTERS);

  // Sync URL filter with state
  useEffect(() => {
    if (urlFilter && urlFilter !== activeFilter) {
      setActiveFilter(urlFilter);
      // Clear URL parameter after reading
      router.replace('/admin/orders', { scroll: false });
    }
  }, [urlFilter]);

  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId);
    setSearchTerm(''); // Clear search when changing filter
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term) {
      setActiveFilter('all'); // Reset filter when searching
    }
  };

  const handleAdvancedFiltersChange = (newFilters) => {
    setAdvancedFilters(newFilters);
  };

  const handleResetAdvancedFilters = () => {
    setAdvancedFilters(DEFAULT_ADVANCED_FILTERS);
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
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">ניהול הזמנות</h1>
        <p className="text-sm text-gray-600 mt-1">צפה ונהל את כל ההזמנות במערכת</p>
      </div>

      {/* KPI Cards */}
      <KPICardsRow onFilterClick={handleFilterChange} />

      {/* Search Bar */}
      <OrderSearchBar onSearch={handleSearch} />

      {/* Quick Filters */}
      <QuickFilters
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
      />

      {/* Advanced Filters */}
      <AdvancedFilters
        filters={advancedFilters}
        onFiltersChange={handleAdvancedFiltersChange}
        onReset={handleResetAdvancedFilters}
      />

      {/* Orders List */}
      <OrdersListWidget
        activeFilter={activeFilter}
        searchTerm={searchTerm}
        advancedFilters={advancedFilters}
        onQuickAction={handleQuickAction}
      />
    </div>
  );
}
