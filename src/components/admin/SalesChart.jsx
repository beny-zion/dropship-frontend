// components/admin/SalesChart.jsx - Phase 11: Enhanced Sales Chart

'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function SalesChart({ data = [] }) {
  const [chartType, setChartType] = useState('area'); // 'area' or 'line'

  // Ensure data is an array
  const salesData = Array.isArray(data) ? data : [];

  if (!salesData || salesData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        אין נתונים להצגה
      </div>
    );
  }

  // Format data for chart
  const chartData = salesData.map(item => ({
    date: new Date(item.date).toLocaleDateString('he-IL', {
      day: '2-digit',
      month: '2-digit'
    }),
    sales: item.sales || 0,
    orders: item.orders || 0
  }));

  // Calculate trends
  const calculateTrend = () => {
    if (chartData.length < 2) return { trend: 'neutral', percentage: 0 };

    const lastValue = chartData[chartData.length - 1].sales;
    const firstValue = chartData[0].sales;

    if (firstValue === 0) return { trend: 'up', percentage: 100 };

    const change = ((lastValue - firstValue) / firstValue) * 100;

    return {
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
      percentage: Math.abs(change).toFixed(1)
    };
  };

  const { trend, percentage } = calculateTrend();
  const totalSales = chartData.reduce((sum, item) => sum + item.sales, 0);
  const totalOrders = chartData.reduce((sum, item) => sum + item.orders, 0);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg" dir="rtl">
        <p className="font-medium text-gray-900 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600">
              {entry.name === 'sales' ? 'מכירות:' : 'הזמנות:'}
            </span>
            <span className="font-medium">
              {entry.name === 'sales'
                ? `₪${entry.value.toLocaleString()}`
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-6">
          {/* Total Sales */}
          <div>
            <p className="text-xs text-gray-500">סה״כ מכירות</p>
            <p className="text-lg font-semibold">₪{totalSales.toLocaleString()}</p>
          </div>

          {/* Total Orders */}
          <div>
            <p className="text-xs text-gray-500">סה״כ הזמנות</p>
            <p className="text-lg font-semibold">{totalOrders}</p>
          </div>

          {/* Trend */}
          <div className="flex items-center gap-1">
            {trend === 'up' && (
              <>
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">+{percentage}%</span>
              </>
            )}
            {trend === 'down' && (
              <>
                <TrendingDown className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-600">-{percentage}%</span>
              </>
            )}
            {trend === 'neutral' && (
              <>
                <Minus className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-500">ללא שינוי</span>
              </>
            )}
          </div>
        </div>

        {/* Chart Type Toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setChartType('area')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              chartType === 'area'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            שטח
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              chartType === 'line'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            קו
          </button>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={280}>
        {chartType === 'area' ? (
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              stroke="#999"
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              stroke="#999"
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => value === 'sales' ? 'מכירות' : 'הזמנות'}
              wrapperStyle={{ paddingTop: '10px' }}
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#salesGradient)"
              dot={{ fill: '#3b82f6', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
            />
            <Area
              type="monotone"
              dataKey="orders"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#ordersGradient)"
              dot={{ fill: '#10b981', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
            />
          </AreaChart>
        ) : (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              stroke="#999"
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              stroke="#999"
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => value === 'sales' ? 'מכירות' : 'הזמנות'}
              wrapperStyle={{ paddingTop: '10px' }}
            />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 3 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="orders"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 3 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
