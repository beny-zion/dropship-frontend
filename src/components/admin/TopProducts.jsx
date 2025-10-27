// components/admin/TopProducts.jsx - Week 5: Top Selling Products

'use client';

import Image from 'next/image';
import { TrendingUp } from 'lucide-react';

export default function TopProducts({ products = [] }) {
  // Ensure products is an array
  const productList = Array.isArray(products) ? products : [];

  if (!productList || productList.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        אין נתונים להצגה
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {productList.map((product, index) => (
        <div 
          key={product.productId} 
          className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
        >
          {/* Rank */}
          <div className="flex-shrink-0">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm
              ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                index === 1 ? 'bg-gray-100 text-gray-700' : 
                index === 2 ? 'bg-orange-100 text-orange-700' : 
                'bg-gray-50 text-gray-600'}
            `}>
              {index + 1}
            </div>
          </div>

          {/* Product Image */}
          {product.image && (
            <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">
              {product.name}
            </p>
            <p className="text-sm text-gray-500">
              {product.totalSold} יחידות נמכרו
            </p>
          </div>

          {/* Revenue */}
          <div className="text-left flex-shrink-0">
            <p className="font-semibold text-gray-900">
              ₪{product.totalRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              הכנסה
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
