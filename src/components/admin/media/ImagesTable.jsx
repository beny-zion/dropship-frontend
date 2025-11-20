'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getImages } from '@/lib/api/media';
import { ExternalLink, Trash2 } from 'lucide-react';

export default function ImagesTable() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, used, unused
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalImages: 0
  });

  useEffect(() => {
    fetchImages();
  }, [filter]);

  const fetchImages = async (page = 1) => {
    try {
      setLoading(true);
      const response = await getImages({
        page,
        limit: 20,
        status: filter === 'all' ? undefined : filter
      });

      console.log('Images response:', response);

      if (response.success && response.data) {
        setImages(response.data.images || []);
        setPagination(response.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalImages: 0
        });
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(2)} KB` : `${mb.toFixed(2)} MB`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>תמונות</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">טוען תמונות...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>תמונות ({pagination.totalImages})</CardTitle>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded text-sm ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              הכל
            </button>
            <button
              onClick={() => setFilter('used')}
              className={`px-3 py-1 rounded text-sm ${
                filter === 'used'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              בשימוש
            </button>
            <button
              onClick={() => setFilter('unused')}
              className={`px-3 py-1 rounded text-sm ${
                filter === 'unused'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              לא בשימוש
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {images.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            אין תמונות להצגה
          </div>
        ) : (
          <div className="space-y-4">
            {images.map((image) => (
              <div
                key={image._id || image.publicId}
                className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50"
              >
                {/* Image Thumbnail */}
                <div className="w-20 h-20 flex-shrink-0">
                  <img
                    src={image.url}
                    alt={image.publicId}
                    className="w-full h-full object-cover rounded"
                  />
                </div>

                {/* Image Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {image.publicId}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatSize(image.size)} • {image.format?.toUpperCase()} • {formatDate(image.uploadedAt)}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        image.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : image.status === 'unused'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {image.status === 'active'
                        ? 'בשימוש'
                        : image.status === 'unused'
                        ? 'לא בשימוש'
                        : 'ממתין'}
                    </span>
                  </div>

                  {/* Usage Info */}
                  {image.usedIn && image.usedIn.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-600 mb-1">משויך ל:</p>
                      <div className="flex flex-wrap gap-2">
                        {image.usedIn.map((use, idx) => (
                          <a
                            key={idx}
                            href={`/admin/products/${use.id}`}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs hover:bg-blue-100"
                          >
                            {use.type === 'product' && '📦'}
                            {use.type === 'category' && '📁'}
                            {use.type === 'homepage' && '🏠'}
                            <span className="truncate max-w-[200px]">{use.name}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Uploaded By */}
                  {image.uploadedBy && (
                    <p className="text-xs text-gray-500 mt-2">
                      הועלה על ידי: {image.uploadedBy.name || image.uploadedBy.email}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <a
                    href={image.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-600 hover:text-blue-600"
                    title="פתח תמונה"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  {image.status === 'unused' && (
                    <button
                      className="p-2 text-gray-600 hover:text-red-600"
                      title="מחק תמונה"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <p className="text-sm text-gray-600">
              עמוד {pagination.currentPage} מתוך {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fetchImages(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                הקודם
              </button>
              <button
                onClick={() => fetchImages(pagination.currentPage + 1)}
                disabled={!pagination.hasMore}
                className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                הבא
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
