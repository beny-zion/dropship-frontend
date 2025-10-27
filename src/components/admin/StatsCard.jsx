// components/admin/StatsCard.jsx - Week 5: Statistics Card

import { TrendingUp, TrendingDown } from 'lucide-react';

const colorClasses = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  purple: 'bg-purple-100 text-purple-600',
  yellow: 'bg-yellow-100 text-yellow-600',
  red: 'bg-red-100 text-red-600'
};

export default function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'blue',
  trend 
}) {
  const trendPositive = trend > 0;
  const trendNegative = trend < 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          
          {/* Trend */}
          {trend !== undefined && trend !== null && (
            <div className="flex items-center gap-1 mt-2">
              {trendPositive && <TrendingUp className="w-4 h-4 text-green-600" />}
              {trendNegative && <TrendingDown className="w-4 h-4 text-red-600" />}
              <span className={`text-sm font-medium ${
                trendPositive ? 'text-green-600' : 
                trendNegative ? 'text-red-600' : 
                'text-gray-600'
              }`}>
                {trend > 0 && '+'}{trend}%
              </span>
              <span className="text-xs text-gray-500">מהחודש הקודם</span>
            </div>
          )}
        </div>

        {Icon && (
          <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
}
