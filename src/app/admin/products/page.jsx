// app/admin/products/page.jsx - Products Management Page

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Package,
  AlertCircle,
  Star,
  StarOff
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const statusConfig = {
  active: { label: 'פעיל', className: 'bg-green-100 text-green-800' },
  inactive: { label: 'לא פעיל', className: 'bg-gray-100 text-gray-800' },
  outOfStock: { label: 'אזל מהמלאי', className: 'bg-red-100 text-red-800' }
};

export default function ProductsManagementPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 20;

  // Fetch products
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'products', { search, status: statusFilter, page, limit }],
    queryFn: () => adminApi.getAllProducts({
      search,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      page,
      limit
    })
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteProduct(id),
    onSuccess: () => {
      toast.success('המוצר נמחק בהצלחה');
      queryClient.invalidateQueries(['admin', 'products']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'שגיאה במחיקת המוצר');
    }
  });

  // Toggle featured mutation
  const toggleFeaturedMutation = useMutation({
    mutationFn: (id) => adminApi.toggleFeatured(id),
    onSuccess: () => {
      toast.success('סטטוס מומלץ עודכן');
      queryClient.invalidateQueries(['admin', 'products']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'שגיאה בעדכון');
    }
  });

  // Extract products and pagination from response
  // Server returns: { success, data: [...products], pagination: {...} }
  const products = data?.data || data?.products || [];
  const pagination = data?.pagination || {};

  // Debug log
  console.log('📦 Products Page Data:', {
    rawData: data,
    productsCount: products.length,
    pagination
  });

  const handleDelete = (id, name) => {
    if (confirm(`האם אתה בטוח שברצונך למחוק את המוצר "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ניהול מוצרים</h1>
          <p className="text-gray-600 mt-1">
            {pagination.totalProducts || pagination.total || 0} מוצרים במערכת
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="w-4 h-4 ml-2" />
            הוסף מוצר חדש
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="חיפוש לפי שם או ASIN..."
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
            <option value="inactive">לא פעיל</option>
            <option value="outOfStock">אזל מהמלאי</option>
          </select>

          {/* Clear Filters */}
          {(search || statusFilter !== 'all') && (
            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
              }}
            >
              נקה סינון
            </Button>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">לא נמצאו מוצרים</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                      תמונה
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                      שם המוצר
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                      ASIN
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                      מחיר
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                      מלאי
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
                  {products.map((product) => (
                    <tr
                      key={product._id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      {/* Image */}
                      <td className="py-3 px-4">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name_he}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </td>

                      {/* Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">
                            {product.name_he}
                          </p>
                          {product.featured && (
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{product.category}</p>
                      </td>

                      {/* ASIN */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm text-gray-600">
                          {product.asin}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-900">
                          ₪{product.price?.toLocaleString()}
                        </span>
                      </td>

                      {/* Stock */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${
                            product.stock?.quantity < 10
                              ? 'text-red-600 font-semibold'
                              : 'text-gray-700'
                          }`}>
                            {product.stock?.quantity || 0}
                          </span>
                          {product.stock?.quantity < 10 && (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <Badge className={statusConfig[product.status]?.className}>
                          {statusConfig[product.status]?.label || product.status}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFeaturedMutation.mutate(product._id)}
                            title={product.featured ? 'הסר מומלץ' : 'סמן כמומלץ'}
                          >
                            {product.featured ? (
                              <StarOff className="w-4 h-4" />
                            ) : (
                              <Star className="w-4 h-4" />
                            )}
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/products/${product._id}`}>
                              <Edit className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(product._id, product.name_he)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
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
                  מציג {((page - 1) * limit) + 1} - {Math.min(page * limit, pagination.totalProducts || pagination.total || 0)} מתוך {pagination.totalProducts || pagination.total || 0}
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
