// app/admin/products/page.jsx - Products Management Page

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import { getCategories } from '@/lib/api/categories';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  AlertCircle,
  Star,
  StarOff,
  Filter,
  X,
  SortAsc
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ProductsManagementPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('');
  const [inStock, setInStock] = useState('');
  const [featured, setFeatured] = useState('');
  const [lowStock, setLowStock] = useState('');
  const [sortBy, setSortBy] = useState('-createdAt');
  const limit = 20;

  // Fetch categories for filter
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(false)
  });
  const categories = categoriesData?.data || [];

  // Build filters object
  const filters = {
    search,
    page,
    limit,
    sortBy,
    ...(category && { category }),
    ...(inStock && { inStock }),
    ...(featured && { featured }),
    ...(lowStock && { lowStock })
  };

  // Fetch products
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'products', filters],
    queryFn: () => adminApi.getAllProducts(filters)
  });

  // Check if any filters are active
  const hasActiveFilters = category || inStock || featured || lowStock || search;

  // Clear all filters
  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setInStock('');
    setFeatured('');
    setLowStock('');
    setSortBy('-createdAt');
    setPage(1);
  };

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteProduct(id),
    onSuccess: () => {
      toast.success('המוצר נמחק בהצלחה');
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
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
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
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
    pagination,
    sampleProduct: products[0],
    productIds: products.slice(0, 3).map(p => ({
      _id: p._id,
      _idType: typeof p._id,
      _idToString: p._id?.toString?.(),
      id: p.id,
      asin: p.asin
    }))
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
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">סינון וחיפוש</span>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="mr-auto text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="w-4 h-4 ml-1" />
              נקה הכל
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="חיפוש לפי שם מוצר או ASIN..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pr-10"
            />
          </div>

          {/* Category Filter */}
          <Select value={category} onValueChange={(value) => { setCategory(value === 'all' ? '' : value); setPage(1); }}>
            <SelectTrigger>
              <SelectValue placeholder="כל הקטגוריות" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הקטגוריות</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat._id} value={cat._id}>
                  {cat.name?.he || cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Availability Filter */}
          <Select value={inStock} onValueChange={(value) => { setInStock(value === 'all' ? '' : value); setPage(1); }}>
            <SelectTrigger>
              <SelectValue placeholder="כל המצבים" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל המצבים</SelectItem>
              <SelectItem value="true">במלאי</SelectItem>
              <SelectItem value="false">לא במלאי</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Second Row - More Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {/* Featured Filter */}
          <Select value={featured} onValueChange={(value) => { setFeatured(value === 'all' ? '' : value); setPage(1); }}>
            <SelectTrigger>
              <SelectValue placeholder="הכל (מומלץ/לא)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">הכל (מומלץ/לא)</SelectItem>
              <SelectItem value="true">מוצרים מומלצים</SelectItem>
            </SelectContent>
          </Select>

          {/* Low Stock Filter */}
          <Select value={lowStock} onValueChange={(value) => { setLowStock(value === 'all' ? '' : value); setPage(1); }}>
            <SelectTrigger>
              <SelectValue placeholder="כל המלאי" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל המלאי</SelectItem>
              <SelectItem value="true">מלאי נמוך (פחות מ-10)</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort By */}
          <Select value={sortBy} onValueChange={(value) => { setSortBy(value); setPage(1); }}>
            <SelectTrigger>
              <SortAsc className="w-4 h-4 ml-2 text-gray-400" />
              <SelectValue placeholder="מיון" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-createdAt">חדש ביותר</SelectItem>
              <SelectItem value="createdAt">ישן ביותר</SelectItem>
              <SelectItem value="name_he">שם (א-ת)</SelectItem>
              <SelectItem value="-name_he">שם (ת-א)</SelectItem>
              <SelectItem value="-price.ils">מחיר (גבוה לנמוך)</SelectItem>
              <SelectItem value="price.ils">מחיר (נמוך לגבוה)</SelectItem>
              <SelectItem value="-stock.quantity">מלאי (גבוה לנמוך)</SelectItem>
              <SelectItem value="stock.quantity">מלאי (נמוך לגבוה)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100">
            <span className="text-xs text-gray-500">פילטרים פעילים:</span>
            {search && (
              <Badge variant="secondary" className="flex items-center gap-1">
                חיפוש: {search}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSearch('')} />
              </Badge>
            )}
            {category && (
              <Badge variant="secondary" className="flex items-center gap-1">
                קטגוריה: {categories.find(c => c._id === category)?.name?.he || 'נבחרה'}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setCategory('')} />
              </Badge>
            )}
            {inStock && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {inStock === 'true' ? 'במלאי' : 'לא במלאי'}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setInStock('')} />
              </Badge>
            )}
            {featured && (
              <Badge variant="secondary" className="flex items-center gap-1">
                מוצרים מומלצים
                <X className="w-3 h-3 cursor-pointer" onClick={() => setFeatured('')} />
              </Badge>
            )}
            {lowStock && (
              <Badge variant="secondary" className="flex items-center gap-1">
                מלאי נמוך
                <X className="w-3 h-3 cursor-pointer" onClick={() => setLowStock('')} />
              </Badge>
            )}
          </div>
        )}
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
                      זמינות
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                      פעולות
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product._id?.toString() || product.id || product.asin}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      {/* Image */}
                      <td className="py-3 px-4">
                        {product.images?.length > 0 ? (
                          <img
                            src={
                              typeof product.images[0] === 'string'
                                ? product.images[0]
                                : product.images.find(img => img.isPrimary)?.url || product.images[0]?.url
                            }
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
                        <p className="text-xs text-gray-500">
                          {product.category?.name?.he || product.categoryLegacy || 'ללא קטגוריה'}
                        </p>
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
                          ₪{(product.price?.ils || 0).toLocaleString()}
                        </span>
                      </td>

                      {/* Stock */}
                      <td className="py-3 px-4">
                        {product.stock?.trackInventory ? (
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
                        ) : (
                          <span className="text-sm text-gray-500">
                            לא עוקב
                          </span>
                        )}
                      </td>

                      {/* Availability Status */}
                      <td className="py-3 px-4">
                        <Badge className={product.stock?.available !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {product.stock?.available !== false ? 'זמין' : 'לא זמין'}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFeaturedMutation.mutate(String(product._id || product.id))}
                            title={product.featured ? 'הסר מומלץ' : 'סמן כמומלץ'}
                          >
                            {product.featured ? (
                              <StarOff className="w-4 h-4" />
                            ) : (
                              <Star className="w-4 h-4" />
                            )}
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/products/${String(product._id || product.id)}`}>
                              <Edit className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(String(product._id || product.id), product.name_he)}
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
