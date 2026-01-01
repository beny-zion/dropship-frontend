// components/admin/orders/QuickFilters.jsx
// Phase 11: Enhanced Quick Filters

'use client';

import {
  List,
  AlertTriangle,
  Clock,
  XCircle,
  MapPin,
  Truck,
  CreditCard,
  CheckCircle
} from 'lucide-react';

const QUICK_FILTERS = [
  {
    id: 'all',
    label: 'הכל',
    icon: List,
    color: 'blue'
  },
  {
    id: 'urgent',
    label: 'דחופות',
    icon: AlertTriangle,
    color: 'red'
  },
  {
    id: 'pending_payment',
    label: 'ממתין לתשלום',
    icon: CreditCard,
    color: 'yellow'
  },
  {
    id: 'in_transit',
    label: 'במשלוח',
    icon: Truck,
    color: 'indigo'
  },
  {
    id: 'stuck',
    label: 'תקועות 7+ ימים',
    icon: Clock,
    color: 'orange'
  },
  {
    id: 'needs_tracking',
    label: 'טעון מספר מעקב',
    icon: MapPin,
    color: 'purple'
  },
  {
    id: 'completed_today',
    label: 'הושלמו היום',
    icon: CheckCircle,
    color: 'green'
  },
  {
    id: 'cancelled_today',
    label: 'בוטלו היום',
    icon: XCircle,
    color: 'gray'
  }
];

export default function QuickFilters({ activeFilter, onFilterChange }) {
  const getButtonClasses = (filter) => {
    const isActive = activeFilter === filter.id;
    const baseClasses = 'flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 text-sm font-medium whitespace-nowrap';

    const colorClasses = {
      blue: isActive ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100',
      red: isActive ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100',
      yellow: isActive ? 'bg-yellow-500 text-white' : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100',
      orange: isActive ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-700 hover:bg-orange-100',
      gray: isActive ? 'bg-gray-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
      purple: isActive ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700 hover:bg-purple-100',
      green: isActive ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100',
      indigo: isActive ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
    };

    return `${baseClasses} ${colorClasses[filter.color] || colorClasses.blue}`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3">
      <div className="flex flex-wrap gap-2">
        {QUICK_FILTERS.map(filter => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={getButtonClasses(filter)}
          >
            <filter.icon className="w-4 h-4" />
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}
