// app/admin/users/page.jsx - Users Management Page

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Eye, Users as UsersIcon, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

const statusConfig = {
  active: { label: 'פעיל', className: 'bg-green-100 text-green-800' },
  suspended: { label: 'מושהה', className: 'bg-red-100 text-red-800' },
  pending: { label: 'ממתין', className: 'bg-yellow-100 text-yellow-800' },
  deleted: { label: 'נמחק', className: 'bg-gray-100 text-gray-800' }
};

const roleConfig = {
  user: { label: 'משתמש', className: 'bg-blue-100 text-blue-800' },
  admin: { label: 'מנהל', className: 'bg-purple-100 text-purple-800' }
};

export default function UsersManagementPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 20;

  // Fetch users
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', { search, status: statusFilter, role: roleFilter, page, limit }],
    queryFn: () => adminApi.getAllUsers({
      search,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      role: roleFilter !== 'all' ? roleFilter : undefined,
      page,
      limit
    })
  });

  // Fetch stats
  const { data: statsData } = useQuery({
    queryKey: ['admin', 'users', 'stats'],
    queryFn: () => adminApi.getUsersStats()
  });

  // Extract users and pagination from response
  // Server returns: { success, data: [...users], pagination: {...} }
  const users = data?.data || [];
  const pagination = data?.pagination || {};
  const stats = statsData?.data || {};

  // Debug log
  console.log('👥 Users Page Data:', {
    rawData: data,
    usersCount: users.length,
    pagination,
    stats
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ניהול משתמשים</h1>
        <p className="text-gray-600 mt-1">
          {pagination.totalUsers || pagination.total || 0} משתמשים במערכת
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">סה״כ משתמשים</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {stats.totalUsers || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">משתמשים פעילים</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {stats.activeUsers || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">משתמשים חדשים החודש</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {stats.newUsersThisMonth || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">מנהלים</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">
            {stats.adminUsers || 0}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="חיפוש לפי שם או אימייל..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">כל הסטטוסים</option>
            <option value="active">פעיל</option>
            <option value="suspended">מושהה</option>
            <option value="pending">ממתין</option>
          </select>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">כל התפקידים</option>
            <option value="user">משתמש</option>
            <option value="admin">מנהל</option>
          </select>
        </div>

        {/* Clear Filters */}
        {(search || statusFilter !== 'all' || roleFilter !== 'all') && (
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setRoleFilter('all');
              }}
            >
              נקה סינון
            </Button>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">לא נמצאו משתמשים</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                      משתמש
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                      אימייל
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                      טלפון
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                      תפקיד
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                      סטטוס
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                      הזמנות
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                      תאריך הצטרפות
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                      פעולות
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user._id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      {/* User */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-700">
                          {user.email}
                        </span>
                      </td>

                      {/* Phone */}
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-700">
                          {user.phone || '-'}
                        </span>
                      </td>

                      {/* Role */}
                      <td className="py-3 px-4">
                        <Badge className={roleConfig[user.role]?.className}>
                          {roleConfig[user.role]?.label || user.role}
                        </Badge>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <Badge className={statusConfig[user.accountStatus]?.className}>
                          {statusConfig[user.accountStatus]?.label || user.accountStatus}
                        </Badge>
                      </td>

                      {/* Orders Count */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <ShoppingBag className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">
                            {user.stats?.totalOrders || user.ordersCount || 0}
                          </span>
                        </div>
                      </td>

                      {/* Join Date */}
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm text-gray-700">
                            {new Date(user.createdAt).toLocaleDateString('he-IL')}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(user.createdAt), {
                              addSuffix: true,
                              locale: he
                            })}
                          </p>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/users/${user._id}`}>
                            <Eye className="w-4 h-4 ml-1" />
                            צפייה
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {(pagination.totalPages || pagination.pages) > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  מציג {((page - 1) * limit) + 1} - {Math.min(page * limit, pagination.totalUsers || pagination.total || 0)} מתוך {pagination.totalUsers || pagination.total || 0}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    הקודם
                  </Button>
                  <span className="px-4 py-2 text-sm">
                    עמוד {page} מתוך {pagination.totalPages || pagination.pages || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(pagination.totalPages || pagination.pages || 1, p + 1))}
                    disabled={page === (pagination.totalPages || pagination.pages)}
                  >
                    הבא
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
