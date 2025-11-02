'use client';

import { useState } from 'react';
import { useCategories } from '@/lib/hooks/useCategories';
import { deleteCategory, createCategory, updateCategory } from '@/lib/api/categories';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Eye, MousePointer } from 'lucide-react';
import { toast } from 'sonner';
import CategoryForm from '@/components/admin/categories/CategoryForm';
import CategoryImageUpload from '@/components/admin/categories/CategoryImageUpload';

export default function AdminCategoriesPage() {
  const { categories, loading, error, refetch } = useCategories(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [uploadingCategory, setUploadingCategory] = useState(null);

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק את הקטגוריה?')) {
      return;
    }

    try {
      const response = await deleteCategory(id);
      if (response.success) {
        toast.success('הקטגוריה נמחקה בהצלחה');
        refetch();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'שגיאה במחיקת הקטגוריה');
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      let response;
      if (editingCategory) {
        response = await updateCategory(editingCategory._id, data);
        toast.success('הקטגוריה עודכנה בהצלחה');
      } else {
        response = await createCategory(data);
        toast.success('הקטגוריה נוצרה בהצלחה');
      }

      if (response.success) {
        setIsFormOpen(false);
        setEditingCategory(null);
        refetch();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'שגיאה בשמירת הקטגוריה');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
          <p className="font-semibold">שגיאה בטעינת הקטגוריות</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">ניהול קטגוריות</h1>
          <p className="text-gray-600 mt-2">
            נהל את הקטגוריות המוצגות בדף הבית
          </p>
        </div>
        <Button onClick={handleCreateCategory} className="gap-2">
          <Plus size={20} />
          קטגוריה חדשה
        </Button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div
            key={category._id}
            className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Category Image */}
            <div className="relative h-48 bg-gray-200">
              <img
                src={category.mainImage?.url}
                alt={category.name.he}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 bg-white rounded-full px-3 py-1 text-sm font-medium">
                {category.isActive ? (
                  <span className="text-green-600">פעיל</span>
                ) : (
                  <span className="text-red-600">לא פעיל</span>
                )}
              </div>
            </div>

            {/* Category Info */}
            <div className="p-4">
              <h3 className="text-xl font-bold mb-2">{category.name.he}</h3>
              {category.description?.he && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {category.description.he}
                </p>
              )}

              {/* Color Preview */}
              {category.styling && (
                <div className="flex gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">רקע:</span>
                    <div
                      className="w-8 h-8 rounded border-2 border-gray-300"
                      style={{ backgroundColor: category.styling.backgroundColor || '#ffffff' }}
                      title={category.styling.backgroundColor}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">טקסט:</span>
                    <div
                      className="w-8 h-8 rounded border-2 border-gray-300"
                      style={{ backgroundColor: category.styling.textColor || '#000000' }}
                      title={category.styling.textColor}
                    />
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="flex gap-4 mb-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Eye size={16} />
                  <span>{category.stats?.views || 0} צפיות</span>
                </div>
                <div className="flex items-center gap-1">
                  <MousePointer size={16} />
                  <span>{category.stats?.clicks || 0} לחיצות</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => setUploadingCategory(category)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  העלאת תמונה
                </Button>
                <Button
                  onClick={() => handleEditCategory(category)}
                  variant="outline"
                  size="sm"
                >
                  <Pencil size={16} />
                </Button>
                <Button
                  onClick={() => handleDeleteCategory(category._id)}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {categories.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg mb-4">
            עדיין לא נוצרו קטגוריות
          </p>
          <Button onClick={handleCreateCategory}>
            צור קטגוריה ראשונה
          </Button>
        </div>
      )}

      {/* Category Form Modal */}
      {isFormOpen && (
        <CategoryForm
          category={editingCategory}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setIsFormOpen(false);
            setEditingCategory(null);
          }}
        />
      )}

      {/* Image Upload Modal */}
      {uploadingCategory && (
        <CategoryImageUpload
          category={uploadingCategory}
          onClose={() => setUploadingCategory(null)}
          onSuccess={() => {
            setUploadingCategory(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
