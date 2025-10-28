'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext'; // ⭐ חדש
import { toast } from 'sonner'; // ⭐ חדש
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingCart } from 'lucide-react'; // ⭐ חדש
import { useState } from 'react'; // ⭐ חדש

export default function ProductCard({ product }) {
  const { addToCart } = useCart(); // ⭐ חדש
  const [adding, setAdding] = useState(false); // ⭐ חדש

  const hasDiscount = product.discount > 0;
  const freeShipping = product.shipping?.freeShipping || product.shipping?.cost === 0;

  // Helper to get primary image URL
  const getPrimaryImageUrl = () => {
    if (!product.images || product.images.length === 0) return null;

    // If it's a string array
    if (typeof product.images[0] === 'string') {
      return product.images[0];
    }

    // If it's an object array, find primary or use first
    const primaryImage = product.images.find(img => img.isPrimary);
    return primaryImage?.url || product.images[0]?.url;
  };

  const imageUrl = getPrimaryImageUrl();

  // ⭐ חדש
  const handleAddToCart = async (e) => {
    e.preventDefault(); // Prevent navigation
    setAdding(true);

    try {
      addToCart(product, 1);
      toast.success('המוצר נוסף לעגלה!');
    } catch (error) {
      toast.error('שגיאה בהוספה לעגלה');
    } finally {
      setAdding(false);
    }
  };

  return (
    <Link href={`/products/${product.slug || product._id}`}>
      <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white">
        {/* Image */}
        <div className="relative h-48 bg-gray-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name_he || 'מוצר'}
              fill
              className="object-contain p-4"
              sizes="(max-width: 768px) 100vw, 25vw"
              unoptimized={imageUrl.startsWith('data:')}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              אין תמונה
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 right-2 flex flex-col gap-2">
            {hasDiscount && (
              <Badge className="bg-red-500">
                -{product.discount}%
              </Badge>
            )}
            {freeShipping && (
              <Badge className="bg-green-500">
                משלוח חינם
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Name */}
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 h-14">
            {product.name_he}
          </h3>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium mr-1">
                  {product.rating.average?.toFixed(1) || '0.0'}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                ({product.rating.count || 0} ביקורות)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="mb-3">
            {hasDiscount && product.originalPrice?.ils && (
              <span className="text-sm text-gray-400 line-through ml-2">
                ₪{product.originalPrice.ils.toFixed(2)}
              </span>
            )}
            <span className="text-2xl font-bold text-blue-600">
              ₪{product.price?.ils?.toFixed(2) || '0.00'}
            </span>
          </div>

          {/* ⭐ Add to Cart Button */}
          <Button
            className="w-full"
            onClick={handleAddToCart}
            disabled={adding || !product.stock?.available}
          >
            {adding ? (
              'מוסיף...'
            ) : product.stock?.available ? (
              <>
                <ShoppingCart className="h-4 w-4 ml-2" />
                הוסף לעגלה
              </>
            ) : (
              'אזל מהמלאי'
            )}
          </Button>
        </div>
      </div>
    </Link>
  );
}