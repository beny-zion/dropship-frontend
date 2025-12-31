'use client';

import { useState, useEffect } from 'react';
import { getRefunds, getRefundStats } from '@/lib/api/refunds';
import Link from 'next/link';

// Status badge component
function StatusBadge({ status }) {
  const styles = {
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800'
  };

  const labels = {
    completed: 'הושלם',
    failed: 'נכשל',
    pending: 'ממתין'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {labels[status] || status}
    </span>
  );
}

// Stats Card component
function StatsCard({ title, amount, count, trend, trendLabel }) {
  const isPositive = trend === 'up';

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
      <div className="flex items-baseline">
        <span className="text-2xl font-bold text-gray-900">
          {amount.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })}
        </span>
        {count > 0 && (
          <span className="mr-2 text-sm text-gray-500">
            ({count} החזרים)
          </span>
        )}
      </div>
      {trendLabel && (
        <div className={`mt-2 text-sm ${isPositive ? 'text-red-600' : 'text-green-600'}`}>
          {trendLabel}
        </div>
      )}
    </div>
  );
}

export default function RefundsDashboard() {
  const [refunds, setRefunds] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState(null);

  // Fetch refunds and stats
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const [refundsRes, statsRes] = await Promise.all([
          getRefunds(filters),
          getRefundStats()
        ]);

        if (refundsRes.success) {
          setRefunds(refundsRes.data.refunds || []);
          setPagination(refundsRes.data.pagination);
        }

        if (statsRes.success) {
          setStats(statsRes.data);
        }
      } catch (err) {
        console.error('Error fetching refunds:', err);
        setError(err.message || 'שגיאה בטעינת ההחזרים');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [filters]);

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset page on filter change
    }));
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && refunds.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6" dir="rtl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">ניהול החזרים</h1>
        <p className="text-gray-600 mt-1">צפייה וניהול החזרים כספיים</p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatsCard
            title="החזרים החודש"
            amount={stats.thisMonth?.amount || 0}
            count={stats.thisMonth?.count || 0}
          />
          <StatsCard
            title="החזרים חודש שעבר"
            amount={stats.lastMonth?.amount || 0}
            count={stats.lastMonth?.count || 0}
          />
          <StatsCard
            title="החזרים שנכשלו"
            amount={stats.failed?.amount || 0}
            count={stats.failed?.count || 0}
            trend={stats.failed?.count > 0 ? 'up' : 'down'}
            trendLabel={stats.failed?.count > 0 ? 'דורש טיפול' : ''}
          />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">סטטוס</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">הכל</option>
              <option value="completed">הושלם</option>
              <option value="failed">נכשל</option>
              <option value="pending">ממתין</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">תאריך התחלה</label>
            <input
              type="date"
              value={filters.fromDate || ''}
              onChange={(e) => handleFilterChange('fromDate', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">תאריך סיום</label>
            <input
              type="date"
              value={filters.toDate || ''}
              onChange={(e) => handleFilterChange('toDate', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <button
            onClick={() => setFilters({ status: '', page: 1, limit: 20 })}
            className="mt-6 text-sm text-blue-600 hover:text-blue-800"
          >
            נקה פילטרים
          </button>
        </div>
      </div>

      {/* Refunds Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  הזמנה
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  לקוח
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  סכום
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  סיבה
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  סטטוס
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  מבצע
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  תאריך
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  פעולות
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {refunds.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    {loading ? 'טוען...' : 'לא נמצאו החזרים'}
                  </td>
                </tr>
              ) : (
                refunds.map((refund) => (
                  <tr key={refund.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/admin/orders/${refund.orderId}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        #{refund.orderNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {refund.customer?.name || refund.customer?.email || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-gray-900">
                        {refund.amount?.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={refund.reason}>
                        {refund.reason || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={refund.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {refund.processedBy?.name || refund.processedBy?.email || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(refund.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        href={`/admin/orders/${refund.orderId}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        צפה בהזמנה
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-500">
              עמוד {pagination.page} מתוך {pagination.pages} ({pagination.total} סה"כ)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                הקודם
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                הבא
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
