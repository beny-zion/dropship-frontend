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

  const hasDiscount = product.price.discount > 0;
  const freeShipping = product.shipping.cost === 0;

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
          {product.images?.main ? (
            <Image
              src={product.images.main}
              alt={product.name_he}
              fill
              className="object-contain p-4"
              sizes="(max-width: 768px) 100vw, 25vw"
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
                -{product.price.discount}%
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
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium mr-1">
                {product.rating.average.toFixed(1)}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              ({product.rating.count})
            </span>
          </div>

          {/* Price */}
          <div className="mb-3">
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through ml-2">
                ₪{product.price.original.toFixed(2)}
              </span>
            )}
            <span className="text-2xl font-bold text-blue-600">
              ₪{product.price.ils.toFixed(2)}
            </span>
          </div>

          {/* ⭐ Add to Cart Button */}
          <Button
            className="w-full"
            onClick={handleAddToCart}
            disabled={adding || !product.stock.available
            }
          >
            {adding ? (
              'מוסיף...'
            ) : product.stock.available
              ? (
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