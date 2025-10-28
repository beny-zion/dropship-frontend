// app/admin/users/[id]/page.jsx - User Detail Page

'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  User,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  MapPin,
  Shield
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
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

const orderStatusConfig = {
  pending: { label: 'ממתינה', className: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'אושרה', className: 'bg-blue-100 text-blue-800' },
  processing: { label: 'בטיפול', className: 'bg-purple-100 text-purple-800' },
  shipped: { label: 'נשלחה', className: 'bg-orange-100 text-orange-800' },
  delivered: { label: 'נמסרה', className: 'bg-green-100 text-green-800' },
  cancelled: { label: 'בוטלה', className: 'bg-red-100 text-red-800' }
};

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const [newStatus, setNewStatus] = useState('');

  // Fetch user
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'user', params.id],
    queryFn: () => adminApi.getUserById(params.id)
  });

  // Fetch user orders
  const { data: ordersData } = useQuery({
    queryKey: ['admin', 'user', params.id, 'orders'],
    queryFn: () => adminApi.getUserOrders(params.id)
  });

  // Extract user data from response
  const user = data?.data?.user || data?.data;
  const stats = data?.data?.stats || {};
  const recentOrders = data?.data?.recentOrders || [];
  const orders = ordersData?.data || recentOrders;

  // Debug log
  console.log('👤 User Detail:', {
    rawData: data,
    user,
    stats,
    recentOrders,
    ordersData
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (status) => adminApi.updateUserStatus(params.id, status),
    onSuccess: () => {
      toast.success('סטטוס המשתמש עודכן בהצלחה');
      queryClient.invalidateQueries(['admin', 'user', params.id]);
      queryClient.invalidateQueries(['admin', 'users']);
      setNewStatus('');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'שגיאה בעדכון הסטטוס');
    }
  });

  const handleUpdateStatus = () => {
    if (newStatus) {
      updateStatusMutation.mutate(newStatus);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">המשתמש לא נמצא</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/users">
              <ArrowRight className="w-4 h-4 ml-2" />
              חזרה לרשימה
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-gray-600 mt-1">
              הצטרף {user.createdAt && !isNaN(new Date(user.createdAt).getTime()) ? (
                formatDistanceToNow(new Date(user.createdAt), {
                  addSuffix: true,
                  locale: he
                })
              ) : (
                'לא זמין'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className={roleConfig[user.role]?.className + ' text-base px-4 py-2'}>
            {roleConfig[user.role]?.label || user.role}
          </Badge>
          <Badge className={statusConfig[user.accountStatus]?.className + ' text-base px-4 py-2'}>
            {statusConfig[user.accountStatus]?.label || user.accountStatus}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              פרטי המשתמש
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <User className="w-4 h-4" />
                  <span className="text-sm">שם מלא</span>
                </div>
                <p className="font-medium">
                  {user.firstName} {user.lastName}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">אימייל</span>
                </div>
                <p className="font-medium">{user.email}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">טלפון</span>
                </div>
                <p className="font-medium">{user.phone || '-'}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">תאריך הצטרפות</span>
                </div>
                <p className="font-medium">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('he-IL') : 'לא זמין'}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">תפקיד</span>
                </div>
                <p className="font-medium">
                  {roleConfig[user.role]?.label || user.role}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">עדכון אחרון</span>
                </div>
                <p className="font-medium">
                  {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('he-IL') : 'לא זמין'}
                </p>
              </div>
            </div>
          </div>

          {/* User Orders */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              הזמנות ({orders.length})
            </h2>

            {orders.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                אין הזמנות למשתמש זה
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                        מספר הזמנה
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                        תאריך
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                        סכום
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                        סטטוס
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                        פעולות
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order._id?.toString() || order.id || order.orderNumber}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm font-medium">
                            {order.orderNumber}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-700">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('he-IL') : '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold">
                            ₪{order.pricing?.total?.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={orderStatusConfig[order.status]?.className}>
                            {orderStatusConfig[order.status]?.label || order.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/orders/${String(order._id || order.id)}`}>
                              צפייה
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600">סה״כ הזמנות</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {stats.totalOrders || 0}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600">סה״כ הוצאות</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                ₪{(stats.totalSpent || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600">הזמנות שהושלמו</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {stats.completedOrders || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Update Status */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">עדכון סטטוס</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  סטטוס חדש
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">בחר סטטוס</option>
                  <option value="active">פעיל</option>
                  <option value="suspended">מושהה</option>
                  <option value="pending">ממתין</option>
                </select>
              </div>

              <Button
                onClick={handleUpdateStatus}
                disabled={!newStatus || updateStatusMutation.isPending}
                className="w-full"
              >
                עדכן סטטוס
              </Button>

              <p className="text-xs text-gray-500">
                שינוי הסטטוס למושהה ימנע מהמשתמש להתחבר למערכת
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">פעולות מהירות</h2>

            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href={`mailto:${user.email}`}>
                  <Mail className="w-4 h-4 ml-2" />
                  שלח אימייל
                </a>
              </Button>
              {user.phone && (
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href={`tel:${user.phone}`}>
                    <Phone className="w-4 h-4 ml-2" />
                    התקשר
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Activity */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">פעילות אחרונה</h2>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">הצטרף למערכת</p>
                  <p className="text-xs text-gray-500">
                    {user.createdAt ? new Date(user.createdAt).toLocaleString('he-IL') : 'לא זמין'}
                  </p>
                </div>
              </div>

              {user.updatedAt && user.updatedAt !== user.createdAt && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">עדכון פרופיל</p>
                    <p className="text-xs text-gray-500">
                      {new Date(user.updatedAt).toLocaleString('he-IL')}
                    </p>
                  </div>
                </div>
              )}

              {orders.length > 0 && orders[0].createdAt && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">הזמנה אחרונה</p>
                    <p className="text-xs text-gray-500">
                      {new Date(orders[0].createdAt).toLocaleString('he-IL')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
