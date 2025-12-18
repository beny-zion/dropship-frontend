'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

export default function ProductCard({ product }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const hasDiscount = product.discount > 0;
  const hasVariants = product.variants && product.variants.length > 0;

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

  // הוספה לעגלה רק למוצרים ללא וריאנטים
  const handleAddToCart = async (e) => {
    e.preventDefault(); // Prevent navigation

    if (hasVariants) {
      return;
    }

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

  const handleTagClick = (e, tag) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/products?tags=${encodeURIComponent(tag)}`);
  };

  return (
    <Link href={`/products/${product.slug || product._id}`}>
      <div
        className={`group relative bg-white overflow-hidden transition-all duration-500 hover:shadow-2xl ${
          !product.stock?.available ? 'border-2 border-red-200' : ''
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container - Large & Elegant */}
        <div className="relative aspect-[3/4] bg-neutral-50 overflow-hidden">
          {imageUrl ? (
            <>
              <Image
                src={imageUrl}
                alt={product.name_he || 'מוצר'}
                fill
                className={`object-contain transition-all duration-700 ${
                  !product.stock?.available ? 'opacity-40 grayscale' : 'group-hover:scale-105'
                }`}
                sizes="(max-width: 768px) 100vw, 33vw"
                unoptimized={imageUrl.startsWith('data:')}
              />
              {/* Unavailable Overlay */}
              {!product.stock?.available && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="bg-red-600 text-white px-6 py-3 text-sm font-medium tracking-wider shadow-lg">
                    אזל מהמלאי
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-neutral-300">
              <span className="text-sm font-light tracking-widest">NO IMAGE</span>
            </div>
          )}

          {/* Discount Badge - Minimal */}
          {hasDiscount && (
            <div className="absolute top-4 right-4 bg-black text-white px-3 py-1 text-xs font-light tracking-wider">
              -{product.discount}%
            </div>
          )}

          {/* Hover Overlay with CTA */}
          <div className={`absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500 flex items-end justify-center pb-8 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <button
              onClick={handleAddToCart}
              disabled={adding || !product.stock?.available || hasVariants}
              className="bg-white text-black px-8 py-3 text-sm font-light tracking-widest hover:bg-black hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {adding ? (
                'מוסיף...'
              ) : hasVariants ? (
                <>
                  בחר אפשרויות
                  <ArrowLeft className="h-4 w-4" />
                </>
              ) : product.stock?.available ? (
                <>
                  הוסף לעגלה
                  <ArrowLeft className="h-4 w-4" />
                </>
              ) : (
                'אזל מהמלאי'
              )}
            </button>
          </div>
        </div>

        {/* Content - Minimal & Elegant */}
        <div className="p-4 text-center">
          {/* Product Name - Aesthetic Font */}
          <h3 className="font-light text-sm tracking-widest text-neutral-800 mb-2 uppercase line-clamp-1">
            {product.name_he}
          </h3>

          {/* Price - Clean & Simple */}
          <div className="flex items-center justify-center gap-2 mb-2">
            {hasDiscount && product.originalPrice?.ils && (
              <span className="text-xs text-neutral-400 line-through font-light">
                ₪{product.originalPrice.ils.toFixed(0)}
              </span>
            )}
            <span className="text-base font-normal text-black tracking-wide">
              ₪{product.price?.ils?.toFixed(0) || '0'}
            </span>
          </div>

          {/* Tags - Clickable Pills */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-center mt-2">
              {product.tags.slice(0, 2).map((tag) => (
                <button
                  key={tag}
                  onClick={(e) => handleTagClick(e, tag)}
                  className="px-2 py-0.5 text-xs font-light tracking-wide bg-neutral-100 hover:bg-black hover:text-white transition-all rounded-full"
                >
                  {tag}
                </button>
              ))}
              {product.tags.length > 2 && (
                <span className="px-2 py-0.5 text-xs font-light text-neutral-400">
                  +{product.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}