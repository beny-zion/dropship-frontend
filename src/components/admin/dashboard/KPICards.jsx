// components/admin/dashboard/KPICards.jsx
// Phase 11: Smart KPI Cards for Dashboard

'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import {
  AlertTriangle,
  Truck,
  Clock,
  CheckCircle,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Package
} from 'lucide-react';

// KPI Card Component
function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  trend,
  onClick,
  loading = false,
  pulse = false
}) {
  const colorClasses = {
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'bg-red-100 text-red-600',
      text: 'text-red-900',
      subtitle: 'text-red-600',
      pulse: 'animate-pulse bg-red-100'
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: 'bg-orange-100 text-orange-600',
      text: 'text-orange-900',
      subtitle: 'text-orange-600',
      pulse: 'animate-pulse bg-orange-100'
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'bg-yellow-100 text-yellow-600',
      text: 'text-yellow-900',
      subtitle: 'text-yellow-600',
      pulse: 'animate-pulse bg-yellow-100'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'bg-green-100 text-green-600',
      text: 'text-green-900',
      subtitle: 'text-green-600',
      pulse: ''
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'bg-blue-100 text-blue-600',
      text: 'text-blue-900',
      subtitle: 'text-blue-600',
      pulse: ''
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      icon: 'bg-purple-100 text-purple-600',
      text: 'text-purple-900',
      subtitle: 'text-purple-600',
      pulse: ''
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  if (loading) {
    return (
      <div className={`${colors.bg} ${colors.border} border rounded-xl p-4 animate-pulse`}>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
            <div className="h-3 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        ${colors.bg} ${colors.border} border rounded-xl p-4
        ${pulse && value > 0 ? colors.pulse : ''}
        ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm font-medium ${colors.subtitle}`}>{title}</p>
          <p className={`text-2xl sm:text-3xl font-bold ${colors.text} mt-1`}>
            {typeof value === 'number' && title.includes('הכנסות')
              ? `₪${value.toLocaleString()}`
              : value.toLocaleString()
            }
          </p>
          {subtitle && (
            <p className={`text-xs ${colors.subtitle} mt-1`}>{subtitle}</p>
          )}
          {trend !== undefined && trend !== 0 && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className={`w-3 h-3 ${trend < 0 ? 'rotate-180' : ''}`} />
              <span>{trend > 0 ? '+' : ''}{trend}% מאתמול</span>
            </div>
          )}
        </div>
        <div className={`${colors.icon} p-2.5 rounded-lg`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

// Main KPI Cards Component
export default function KPICards({ onFilterClick }) {
  const { data: kpis, isLoading, error } = useQuery({
    queryKey: ['admin', 'orders', 'kpis'],
    queryFn: async () => {
      const result = await adminApi.getOrdersKPIs();
      return result?.data || result;
    },
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000
  });

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span>שגיאה בטעינת נתונים</span>
        </div>
      </div>
    );
  }

  const cards = [
    {
      id: 'urgent',
      title: 'דחוף לטיפול',
      value: kpis?.urgent || 0,
      subtitle: kpis?.urgentToday > 0 ? `+${kpis.urgentToday} חדשות היום` : 'הזמנות שדורשות תשומת לב',
      icon: AlertTriangle,
      color: 'red',
      pulse: true,
      filter: 'urgent'
    },
    {
      id: 'pendingPayment',
      title: 'ממתין לתשלום',
      value: kpis?.pendingPayment || 0,
      subtitle: kpis?.pendingPaymentAmount > 0
        ? `₪${kpis.pendingPaymentAmount.toLocaleString()} לגבייה`
        : 'הזמנות מוכנות לגבייה',
      icon: Package,
      color: 'yellow',
      pulse: kpis?.pendingPayment > 0,
      filter: 'pending_payment'
    },
    {
      id: 'inTransit',
      title: 'במשלוח',
      value: kpis?.inTransit || 0,
      subtitle: 'הזמנות בדרך ללקוח',
      icon: Truck,
      color: 'blue',
      filter: 'in_transit'
    },
    {
      id: 'stuck',
      title: 'תקועות',
      value: kpis?.stuck || 0,
      subtitle: kpis?.stuckAvgDays ? `ממוצע ${kpis.stuckAvgDays} ימים` : 'ללא עדכון 7+ ימים',
      icon: Clock,
      color: 'orange',
      pulse: kpis?.stuck > 0,
      filter: 'stuck'
    },
    {
      id: 'completedToday',
      title: 'הושלמו היום',
      value: kpis?.completedToday || 0,
      subtitle: 'הזמנות שנמסרו',
      icon: CheckCircle,
      color: 'green',
      filter: 'completed_today'
    },
    {
      id: 'revenueThisMonth',
      title: 'הכנסות החודש',
      value: kpis?.revenueThisMonth || 0,
      subtitle: kpis?.revenueToday > 0 ? `+₪${kpis.revenueToday.toLocaleString()} היום` : 'סה"כ גבינו החודש',
      icon: DollarSign,
      color: 'purple'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">מצב הזמנות</h2>
        <span className="text-xs text-gray-500">
          מתעדכן אוטומטית כל דקה
        </span>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {cards.map((card) => (
          <KPICard
            key={card.id}
            title={card.title}
            value={card.value}
            subtitle={card.subtitle}
            icon={card.icon}
            color={card.color}
            pulse={card.pulse}
            loading={isLoading}
            onClick={card.filter && onFilterClick ? () => onFilterClick(card.filter) : undefined}
          />
        ))}
      </div>

      {/* Urgent Alert Banner */}
      {kpis?.urgent > 0 && (
        <div className="bg-red-100 border border-red-300 rounded-lg p-3 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">
              יש {kpis.urgent} הזמנות שדורשות טיפול מיידי!
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              הזמנות ללא tracking או בסטטוס pending יותר מדי זמן
            </p>
          </div>
          {onFilterClick && (
            <button
              onClick={() => onFilterClick('urgent')}
              className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              צפה בהכל
            </button>
          )}
        </div>
      )}
    </div>
  );
}
