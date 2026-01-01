// app/admin/page.jsx - Phase 11: Advanced Dashboard with Real-time Updates

'use client';

import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api/admin';
import KPICards from '@/components/admin/dashboard/KPICards';
import StatsCard from '@/components/admin/StatsCard';
import SalesChart from '@/components/admin/SalesChart';
import OrderStatusChart from '@/components/admin/dashboard/OrderStatusChart';
import LiveIndicator from '@/components/admin/dashboard/LiveIndicator';
import RecentOrders from '@/components/admin/RecentOrders';
import TopProducts from '@/components/admin/TopProducts';
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  AlertCircle
} from 'lucide-react';

// Auto-refresh interval: 60 seconds
const REFRESH_INTERVAL = 60000;

export default function AdminDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handle KPI card click - navigate to orders with filter
  const handleFilterClick = (filter) => {
    router.push(`/admin/orders?filter=${filter}`);
  };

  // Fetch dashboard stats with auto-refresh
  const { data: stats, isLoading: statsLoading, error: statsError, dataUpdatedAt } = useQuery({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn: async () => {
      const result = await adminApi.getDashboardStats();
      setLastUpdated(new Date());
      return result;
    },
    retry: 1,
    staleTime: 30000,
    refetchInterval: REFRESH_INTERVAL,
    refetchIntervalInBackground: false
  });

  // Fetch recent orders - only when stats loaded, with auto-refresh
  const { data: recentOrders, error: ordersError } = useQuery({
    queryKey: ['admin', 'dashboard', 'recent-orders'],
    queryFn: async () => {
      const result = await adminApi.getRecentOrders();
      return result;
    },
    enabled: !!stats,
    retry: 1,
    staleTime: 30000,
    refetchInterval: REFRESH_INTERVAL
  });

  // Fetch top products - only when stats loaded
  const { data: topProducts, error: productsError } = useQuery({
    queryKey: ['admin', 'dashboard', 'top-products'],
    queryFn: async () => {
      const result = await adminApi.getTopProducts();
      return result;
    },
    enabled: !!stats,
    retry: 1,
    staleTime: 60000
  });

  // Fetch sales chart data - only when stats loaded
  const { data: salesData, error: salesError } = useQuery({
    queryKey: ['admin', 'dashboard', 'sales-chart', 7],
    queryFn: async () => {
      const result = await adminApi.getSalesChart(7);
      console.log("result:",result)
      return result;
    },
    enabled: !!stats,
    retry: 1,
    staleTime: 60000
  });

  // Manual refresh all dashboard data
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries(['admin', 'dashboard']);
      await queryClient.invalidateQueries(['admin', 'orders', 'kpis']);
      setLastUpdated(new Date());
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient]);

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const overview = stats?.data?.overview || {};
  const growth = stats?.data?.growth || {};
  const alerts = stats?.data?.alerts || {};

  // Show errors if any
  if (statsError || ordersError || productsError || salesError) {
    console.error('Dashboard Errors:', { statsError, ordersError, productsError, salesError });
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Title with Live Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">לוח בקרה</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">סקירה כללית של המערכת</p>
        </div>
        <LiveIndicator
          lastUpdated={lastUpdated}
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
          refreshInterval={REFRESH_INTERVAL}
        />
      </div>

      {/* KPI Cards - Orders Status */}
      <KPICards onFilterClick={handleFilterClick} />

      {/* General Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        <StatsCard
          title="סה״כ מוצרים"
          value={overview.totalProducts || 0}
          subtitle={`${overview.activeProducts || 0} פעילים`}
          icon={Package}
          color="blue"
        />

        <StatsCard
          title="סה״כ הזמנות"
          value={overview.totalOrders || 0}
          subtitle={`${overview.completedOrders || 0} הושלמו`}
          icon={ShoppingCart}
          color="green"
          trend={growth.orders?.percentage}
        />

        <StatsCard
          title="משתמשים"
          value={overview.totalUsers || 0}
          subtitle="משתמשים רשומים"
          icon={Users}
          color="purple"
        />

        <StatsCard
          title="הכנסות כללי"
          value={`₪${(overview.totalRevenue || 0).toLocaleString()}`}
          subtitle="סה״כ מאז ההתחלה"
          icon={DollarSign}
          color="yellow"
        />
      </div>

      {/* Alerts */}
      {(alerts.lowStock || alerts.pendingOrders) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-900">התראות</h3>
              <ul className="mt-2 space-y-1 text-sm text-yellow-800">
                {alerts.lowStock && (
                  <li>• {overview.lowStockProducts} מוצרים עם מלאי נמוך</li>
                )}
                {alerts.pendingOrders && (
                  <li>• {overview.pendingOrders} הזמנות ממתינות לטיפול</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Sales Chart - Takes 2 columns on large screens */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold mb-4">מכירות - 7 ימים אחרונים</h2>
          <SalesChart data={salesData?.data || []} />
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold mb-4">התפלגות סטטוסים</h2>
          <OrderStatusChart />
        </div>
      </div>

      {/* Top Products Row */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold mb-4">מוצרים מובילים</h2>
        <TopProducts products={topProducts?.data || []} />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-semibold">הזמנות אחרונות</h2>
          <button
            onClick={() => router.push('/admin/orders')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            צפה בכל ההזמנות
          </button>
        </div>
        <RecentOrders orders={recentOrders?.data || []} />
      </div>
    </div>
  );
}
