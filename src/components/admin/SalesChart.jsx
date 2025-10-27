// components/admin/SalesChart.jsx - Week 5: Sales Chart

'use client';

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function SalesChart({ data = [] }) {
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
    sales: item.sales,
    orders: item.orders
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          stroke="#999"
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          stroke="#999"
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            direction: 'rtl'
          }}
          formatter={(value, name) => {
            if (name === 'sales') return [`₪${value.toLocaleString()}`, 'מכירות'];
            if (name === 'orders') return [value, 'הזמנות'];
            return value;
          }}
        />
        <Line 
          type="monotone" 
          dataKey="sales" 
          stroke="#3b82f6" 
          strokeWidth={2}
          dot={{ fill: '#3b82f6', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
