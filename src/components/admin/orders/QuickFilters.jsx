'use client';

import { List, AlertTriangle, Clock, XCircle, MapPin } from 'lucide-react';

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
    id: 'stuck',
    label: 'תקועות 7+ ימים',
    icon: Clock,
    color: 'yellow'
  },
  {
    id: 'cancelled_today',
    label: 'בוטלו היום',
    icon: XCircle,
    color: 'gray'
  },
  {
    id: 'needs_tracking',
    label: 'טעון מספר מעקב',
    icon: MapPin,
    color: 'purple'
  }
];

export default function QuickFilters({ activeFilter, onFilterChange }) {
  const getButtonClasses = (filter) => {
    const isActive = activeFilter === filter.id;
    const baseClasses = 'flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 text-sm font-medium';

    const colorClasses = {
      blue: isActive ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100',
      red: isActive ? 'bg-red-500 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100',
      yellow: isActive ? 'bg-yellow-500 text-white' : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100',
      gray: isActive ? 'bg-gray-500 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100',
      purple: isActive ? 'bg-purple-500 text-white' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
    };

    return `${baseClasses} ${colorClasses[filter.color] || colorClasses.blue}`;
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-4">
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
