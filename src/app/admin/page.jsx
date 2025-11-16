// app/admin/page.jsx - Week 5: Dashboard Page

'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import StatsCard from '@/components/admin/StatsCard';
import SalesChart from '@/components/admin/SalesChart';
import RecentOrders from '@/components/admin/RecentOrders';
import TopProducts from '@/components/admin/TopProducts';
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  AlertCircle
} from 'lucide-react';

export default function AdminDashboard() {
  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn: async () => {
      try {
        const result = await adminApi.getDashboardStats();
        console.log('✅ Dashboard Stats RAW:', result);
        console.log('✅ Dashboard Stats TYPE:', typeof result);
        console.log('✅ Dashboard Stats KEYS:', result ? Object.keys(result) : 'null');
        return result;
      } catch (err) {
        console.error('❌ Dashboard Stats Error:', err.message || err);
        throw err;
      }
    },
    retry: 1,
    staleTime: 30000
  });

  // Fetch recent orders - only when stats loaded
  const { data: recentOrders, error: ordersError } = useQuery({
    queryKey: ['admin', 'dashboard', 'recent-orders'],
    queryFn: async () => {
      try {
        const result = await adminApi.getRecentOrders();
        console.log('✅ Recent Orders RAW:', result);
        console.log('✅ Recent Orders TYPE:', typeof result, Array.isArray(result));
        return result;
      } catch (err) {
        console.error('❌ Recent Orders Error:', err.message || err);
        throw err;
      }
    },
    enabled: !!stats,
    retry: 1,
    staleTime: 30000
  });

  // Fetch top products - only when stats loaded
  const { data: topProducts, error: productsError } = useQuery({
    queryKey: ['admin', 'dashboard', 'top-products'],
    queryFn: async () => {
      try {
        const result = await adminApi.getTopProducts();
        console.log('✅ Top Products:', result);
        return result;
      } catch (err) {
        console.error('❌ Top Products Error:', err.message || err);
        throw err;
      }
    },
    enabled: !!stats,
    retry: 1,
    staleTime: 30000
  });

  // Fetch sales chart data - only when stats loaded
  const { data: salesData, error: salesError } = useQuery({
    queryKey: ['admin', 'dashboard', 'sales-chart', 7],
    queryFn: async () => {
      try {
        const result = await adminApi.getSalesChart(7);
        console.log('✅ Sales Chart:', result);
        return result;
      } catch (err) {
        console.error('❌ Sales Chart Error:', err.message || err);
        throw err;
      }
    },
    enabled: !!stats,
    retry: 1,
    staleTime: 30000
  });

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

  // Debug logs
  console.log('📊 Dashboard Data:', {
    rawStats: stats,
    overview,
    growth,
    alerts,
    recentOrders: Array.isArray(recentOrders?.data) ? `Array(${recentOrders.data.length})` : typeof recentOrders,
    topProducts: Array.isArray(topProducts?.data) ? `Array(${topProducts.data.length})` : typeof topProducts,
    salesData: Array.isArray(salesData?.data) ? `Array(${salesData.data.length})` : typeof salesData
  });

  // Show errors if any
  if (statsError || ordersError || productsError || salesError) {
    console.error('Dashboard Errors:', { statsError, ordersError, productsError, salesError });
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">לוח בקרה</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">סקירה כללית של המערכת</p>
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

      {/* Stats Cards */}
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
          title="הכנסות"
          value={`₪${(overview.totalRevenue || 0).toLocaleString()}`}
          subtitle="סה״כ הכנסות"
          icon={DollarSign}
          color="yellow"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold mb-4">מכירות - 7 ימים אחרונים</h2>
          <SalesChart data={salesData?.data || []} />
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold mb-4">מוצרים מובילים</h2>
          <TopProducts products={topProducts?.data || []} />
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold mb-4">הזמנות אחרונות</h2>
        <RecentOrders orders={recentOrders?.data || []} />
      </div>
    </div>
  );
}
