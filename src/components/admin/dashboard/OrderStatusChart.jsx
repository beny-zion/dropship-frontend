// components/admin/dashboard/OrderStatusChart.jsx
// Phase 11: Pie chart for order status distribution

'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';
import { Loader2 } from 'lucide-react';

const STATUS_COLORS = {
  pending: '#f59e0b',      // amber - ממתין
  in_progress: '#3b82f6',  // blue - בתהליך
  completed: '#059669',    // emerald - הושלם
  cancelled: '#ef4444',    // red - בוטל
  // Legacy statuses
  processing: '#3b82f6',
  ordered: '#8b5cf6',
  shipped: '#6366f1',
  delivered: '#10b981',
  refunded: '#6b7280'
};

const STATUS_LABELS = {
  pending: 'ממתין',
  in_progress: 'בתהליך',
  completed: 'הושלם',
  cancelled: 'בוטל',
  // Legacy
  processing: 'בעיבוד',
  ordered: 'הוזמן מספק',
  shipped: 'נשלח',
  delivered: 'נמסר',
  refunded: 'הוחזר'
};

export default function OrderStatusChart() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'dashboard', 'status-distribution'],
    queryFn: async () => {
      const result = await adminApi.getOrderStats();
      return result.data;
    },
    staleTime: 60000
  });

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        שגיאה בטעינת הנתונים
      </div>
    );
  }

  // Transform data for pie chart - use breakdown (computed.overallProgress)
  const statusCounts = data?.breakdown || {};
  const chartData = Object.entries(statusCounts)
    .filter(([status, count]) => count > 0 && status) // Filter out null/undefined keys
    .map(([status, count]) => ({
      name: STATUS_LABELS[status] || status,
      value: count,
      color: STATUS_COLORS[status] || '#9ca3af'
    }));

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        אין נתונים להצגה
      </div>
    );
  }

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    const percentage = ((data.value / total) * 100).toFixed(1);

    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg" dir="rtl">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: data.color }}
          />
          <span className="font-medium">{data.name}</span>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {data.value} הזמנות ({percentage}%)
        </p>
      </div>
    );
  };

  const renderCustomLegend = ({ payload }) => (
    <div className="flex flex-wrap justify-center gap-3 mt-4">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-1.5 text-xs">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-600">{entry.value}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-2">
      <div className="text-center">
        <p className="text-2xl font-bold text-gray-900">{total}</p>
        <p className="text-xs text-gray-500">סה״כ הזמנות</p>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderCustomLegend} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
