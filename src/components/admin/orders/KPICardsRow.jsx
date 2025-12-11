'use client';

import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Package, Clock, TrendingUp } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';

/**
 * KPI Card Component
 */
function KPICard({ icon, title, value, subtitle, color, onClick, isLoading }) {
  const colorClasses = {
    red: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      icon: 'text-red-600',
      border: 'border-red-200'
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      icon: 'text-blue-600',
      border: 'border-blue-200'
    },
    yellow: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-600',
      icon: 'text-yellow-600',
      border: 'border-yellow-200'
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      icon: 'text-green-600',
      border: 'border-green-200'
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div
      className={`
        ${colors.bg} border ${colors.border} rounded-lg p-4
        ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`${colors.icon}`}>
            {icon}
          </div>
          <div>
            <p className="text-sm text-neutral-600">{title}</p>
            {isLoading ? (
              <div className="h-8 w-16 bg-neutral-200 animate-pulse rounded mt-1" />
            ) : (
              <p className={`text-2xl font-bold ${colors.text}`}>{value}</p>
            )}
          </div>
        </div>
      </div>
      {subtitle && (
        <p className="text-xs text-neutral-500 mt-2">{subtitle}</p>
      )}
    </div>
  );
}

/**
 * KPI Cards Row - Main Component
 */
export default function KPICardsRow({ onFilterClick }) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'orders', 'kpis'],
    queryFn: async () => {
      const response = await adminApi.getOrdersKPIs();
      return response.data;
    },
    refetchInterval: 30000 // כל 30 שניות
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        icon={<AlertTriangle className="w-5 h-5" />}
        title="דחופות"
        value={stats?.urgent || 0}
        subtitle={`+${stats?.urgentToday || 0} היום`}
        color="red"
        onClick={() => onFilterClick?.('urgent')}
        isLoading={isLoading}
      />

      <KPICard
        icon={<Package className="w-5 h-5" />}
        title="בדרך"
        value={stats?.inTransit || 0}
        subtitle="משלוחים פעילים"
        color="blue"
        isLoading={isLoading}
      />

      <KPICard
        icon={<Clock className="w-5 h-5" />}
        title="תקועות"
        value={stats?.stuck || 0}
        subtitle={`${stats?.stuckAvgDays || 0} ימים ממוצע`}
        color="yellow"
        onClick={() => onFilterClick?.('stuck')}
        isLoading={isLoading}
      />

      <KPICard
        icon={<TrendingUp className="w-5 h-5" />}
        title="הושלמו היום"
        value={stats?.completedToday || 0}
        subtitle={`₪${(stats?.revenueToday || 0).toLocaleString()}`}
        color="green"
        isLoading={isLoading}
      />
    </div>
  );
}
