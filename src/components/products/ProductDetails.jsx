'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import {
  ShoppingCart,
  Heart,
  Truck,
  Package,
  Shield,
  RotateCcw,
  Plus,
  Minus,
  Clock,
  Plane,
  CheckCircle,
  Info,
  Globe,
  Tag,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProductDetails({ product }) {
  const router = useRouter();
  const { addToCart } = useCart();

  // תמיכה בשני מבני תמונות
  const getImageData = () => {
    if (Array.isArray(product.images)) {
      const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
      return {
        main: primaryImage?.url || '/placeholder.png',
        gallery: product.images.filter(img => !img.isPrimary).map(img => img.url)
      };
    }
    return {
      main: product.images?.main || '/placeholder.png',
      gallery: product.images?.gallery || []
    };
  };

  const imageData = getImageData();

  // שמור את התמונות ב-useMemo כדי למנוע re-calculation
  const galleryImages = useMemo(() => {
    // תמונות ראשיות של המוצר עם מידע נוסף
    const baseImagesData = Array.isArray(product.images)
      ? product.images
      : [{ url: imageData.main, alt: 'main' }, ...imageData.gallery.map((url, i) => ({ url, alt: `gallery-${i}` }))];

    // הוספת תמונות מכל הווריאנטים
    const variantImagesData = product.variants?.flatMap(v => v.images || []) || [];

    // איחוד כל התמונות
    const allImagesData = [...baseImagesData, ...variantImagesData].filter(img => img.url && img.url !== '/placeholder.png');

    // הסרת כפילויות - קודם לפי alt (שם תמונה), אחר כך לפי URL
    const uniqueImages = [];
    const seenAlts = new Set();
    const seenUrls = new Set();

    for (const img of allImagesData) {
      const identifier = img.alt || img.url;

      // אם יש alt ולא ראינו אותו, או אם אין alt ולא ראינו את ה-URL
      if (img.alt && !seenAlts.has(img.alt)) {
        seenAlts.add(img.alt);
        seenUrls.add(img.url);
        uniqueImages.push(img.url);
      } else if (!img.alt && !seenUrls.has(img.url)) {
        seenUrls.add(img.url);
        uniqueImages.push(img.url);
      }
    }

    return uniqueImages.length > 0 ? uniqueImages : [imageData.main];
  }, [product.images, product.variants, imageData.main, imageData.gallery]);

  const [selectedImage, setSelectedImage] = useState(imageData.main);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [trackingClick, setTrackingClick] = useState(false);

  // Image carousel ref for scrolling
  const imageCarouselRef = useRef(null);
  const isScrollingProgrammatically = useRef(false);

  // Variant selection
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  const hasDiscount = product.discount > 0;
  const freeShipping = product.shipping?.freeShipping || false;
  const hasVariants = product.variants && product.variants.length > 0;

  // Get ALL colors and sizes (including unavailable ones for scarcity marketing)
  const allColors = hasVariants
    ? [...new Set(product.variants.map(v => v.color).filter(Boolean))]
    : [];

  const allSizes = hasVariants && selectedColor
    ? [...new Set(product.variants.filter(v => v.color === selectedColor).map(v => v.size).filter(Boolean))]
    : hasVariants
    ? [...new Set(product.variants.map(v => v.size).filter(Boolean))]
    : [];

  // Helper functions to check availability
  const isColorAvailable = (color) => {
    return product.variants.some(v => v.color === color && v.stock?.available);
  };

  const isSizeAvailable = (size) => {
    if (selectedColor) {
      return product.variants.some(v => v.color === selectedColor && v.size === size && v.stock?.available);
    }
    return product.variants.some(v => v.size === size && v.stock?.available);
  };

  // Calculate current price (base + variant additional cost)
  const getCurrentPrice = () => {
    const basePrice = product.price?.ils || 0;
    const additionalCost = selectedVariant?.additionalCost?.ils || 0;
    return basePrice + additionalCost;
  };

  const currentPrice = getCurrentPrice();

  // Handle Add to Cart
  const handleAddToCart = async () => {
    // Validate variant selection if product has variants
    if (hasVariants) {
      // בדוק שבחרו צבע אם יש צבעים
      if (!selectedColor && allColors.length > 0) {
        toast.error('אנא בחר צבע');
        return;
      }
      // בדוק שבחרו מידה אם יש מידות
      if (!selectedSize && allSizes.length > 0) {
        toast.error('אנא בחר מידה');
        return;
      }
      // ⭐ תיקון: אם יש ווריאנטים אבל לא נבחר אף אחד - נסה למצוא אוטומטית
      if (!selectedVariant) {
        // אם אין צבעים ומידות כלל, זה אומר שהמוצר לא זמין
        if (allColors.length === 0 && allSizes.length === 0) {
          toast.error('מוצר זה לא זמין כרגע');
          return;
        }
        toast.error('אנא בחר אפשרויות מוצר');
        return;
      }
    }

    setAdding(true);
    try {
      addToCart(product, quantity, selectedVariant?.sku);
      const variantText = selectedVariant
        ? ` - ${selectedColor} ${selectedSize}`
        : '';
      toast.success(`${quantity} פריטים נוספו לעגלה!`, {
        description: product.name_he + variantText,
        duration: 3000,
      });
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('שגיאה בהוספה לעגלה');
    } finally {
      setAdding(false);
    }
  };

  // Handle Buy on Amazon
  const handleAmazonClick = async () => {
    setTrackingClick(true);

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${product._id}/click`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Track click error:', error);
    } finally {
      setTrackingClick(false);
    }

    window.open(product.links?.affiliateUrl || product.links?.amazon, '_blank', 'noopener,noreferrer');
  };

  // Image zoom handlers
  const handleMouseEnter = () => {
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  // Image navigation handlers - with RTL support
  const scrollToImage = useCallback((index) => {
    // Prevent any interference from scroll event handler
    isScrollingProgrammatically.current = true;

    // Update state
    setSelectedImageIndex(index);
    setSelectedImage(galleryImages[index]);

    // Perform scroll with RTL support
    if (imageCarouselRef.current) {
      const container = imageCarouselRef.current;
      const imageWidth = container.offsetWidth;

      // In RTL browsers, scrollLeft goes negative as you scroll right
      // So we need to negate the value: index 0 = 0, index 1 = -imageWidth, index 2 = -2*imageWidth
      const targetScroll = -1 * imageWidth * index;

      // Use scrollLeft directly for instant positioning
      container.scrollLeft = targetScroll;
    }

    // Reset flag after a short delay
    setTimeout(() => {
      isScrollingProgrammatically.current = false;
    }, 300);
  }, [galleryImages]);

  // פונקציית עזר לסנכרון הגלריה עם תמונה ספציפית
  const syncCarouselToImage = useCallback((imageUrl) => {
    if (!imageUrl) return;

    const index = galleryImages.findIndex(url => url === imageUrl);
    if (index !== -1) {
      // השתמש בפונקציה הקיימת שכבר מטפלת בגלילה ובעדכון ה-State
      scrollToImage(index);
    } else {
      // מקרה קצה: התמונה לא בגלריה, עדיין נציג אותה
      setSelectedImage(imageUrl);
    }
  }, [galleryImages, scrollToImage]);

  // Update selected variant when color or size changes
  const updateSelectedVariant = useCallback((color, size) => {
    if (!hasVariants) return;

    // ⭐ תיקון: חיפוש מדויק שתומך בערכי null
    // השוואה מדויקת: אם שני הצדדים null/undefined - זה התאמה
    const variant = product.variants.find(v => {
      const colorMatch = (v.color || null) === (color || null);
      const sizeMatch = (v.size || null) === (size || null);
      return colorMatch && sizeMatch && v.stock?.available;
    });

    if (variant) {
      setSelectedVariant(variant);
      // Update image if variant has images - סנכרון הקרוסלה
      if (variant.images && variant.images.length > 0) {
        const primaryImg = variant.images.find(img => img.isPrimary) || variant.images[0];
        syncCarouselToImage(primaryImg.url);
      }
    } else {
      // אם לא נמצא ווריאנט, נקה את הבחירה
      setSelectedVariant(null);
    }
  }, [hasVariants, product.variants, syncCarouselToImage]);

  // Handle color selection - עדכון מיידי של התמונה הראשית בלבד
  const handleColorSelect = (color) => {
    setSelectedColor(color);

    // מצא ווריאנט עם הצבע הנבחר ועדכן רק את התמונה הראשית - עם סנכרון הקרוסלה
    const variantWithColor = product.variants?.find(v => v.color === color);
    if (variantWithColor?.images && variantWithColor.images.length > 0) {
      const primaryImg = variantWithColor.images.find(img => img.isPrimary) || variantWithColor.images[0];
      // סנכרון הקרוסלה לתמונה של הצבע הנבחר
      syncCarouselToImage(primaryImg.url);
    }

    // ⭐ תיקון: אם אין מידות, עדכן ווריאנט מיד (מוצרים עם צבעים בלבד)
    if (allSizes.length === 0) {
      updateSelectedVariant(color, null);
    } else if (selectedSize) {
      updateSelectedVariant(color, selectedSize);
    } else if (allSizes.length === 1 && isSizeAvailable(allSizes[0])) {
      // Auto-select if only one size available and it's in stock
      setSelectedSize(allSizes[0]);
      updateSelectedVariant(color, allSizes[0]);
    }
  };

  // Handle size selection
  const handleSizeSelect = (size) => {
    setSelectedSize(size);

    // ⭐ תיקון: אם אין צבעים, עדכן ווריאנט מיד (מוצרים עם מידות בלבד)
    if (allColors.length === 0) {
      updateSelectedVariant(null, size);
    } else if (selectedColor) {
      updateSelectedVariant(selectedColor, size);
    } else if (allColors.length === 1 && isColorAvailable(allColors[0])) {
      // Auto-select if only one color available and it's in stock
      setSelectedColor(allColors[0]);
      updateSelectedVariant(allColors[0], size);
    }
  };

  const goToNextImage = () => {
    if (galleryImages.length <= 1) return;
    const nextIndex = (selectedImageIndex + 1) % galleryImages.length;
    scrollToImage(nextIndex);
  };

  const goToPrevImage = () => {
    if (galleryImages.length <= 1) return;
    const prevIndex = selectedImageIndex === 0 ? galleryImages.length - 1 : selectedImageIndex - 1;
    scrollToImage(prevIndex);
  };

  const selectImageByIndex = (index) => {
    scrollToImage(index);
  };

  // Track scroll position to update selected image
  useEffect(() => {
    const container = imageCarouselRef.current;
    if (!container) return;

    let scrollTimeout;
    const handleScroll = () => {
      // Don't update state if we're scrolling programmatically
      if (isScrollingProgrammatically.current) return;

      // Debounce scroll updates to prevent race conditions
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollLeft = container.scrollLeft;
        const imageWidth = container.offsetWidth;

        // Handle RTL: scrollLeft can be negative
        // Use absolute value and calculate index
        const newIndex = Math.round(Math.abs(scrollLeft) / imageWidth);

        if (newIndex >= 0 && newIndex < galleryImages.length) {
          setSelectedImageIndex(newIndex);
          setSelectedImage(galleryImages[newIndex]);
        }
      }, 50);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [galleryImages]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        goToNextImage();
      } else if (e.key === 'ArrowLeft') {
        goToPrevImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, galleryImages]);

  // Quantity handlers
  const increaseQuantity = () => {
    if (quantity < 2) {
      setQuantity(prev => prev + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
      {/* תמונות */}
      <div className="space-y-4">
        {/* גלריית תמונות עם גלילה אופקית */}
        <div className="relative group">
          {/* חיצי ניווט - מוצגים רק אם יש יותר מתמונה אחת */}
          {galleryImages.length > 1 && (
            <>
              <button
                onClick={goToPrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 md:p-3 transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                aria-label="תמונה קודמת"
              >
                <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 text-black" />
              </button>
              <button
                onClick={goToNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 md:p-3 transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                aria-label="תמונה הבאה"
              >
                <ChevronRight className="h-5 w-5 md:h-6 md:w-6 text-black" />
              </button>

              {/* אינדיקטור תמונות */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
                {galleryImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => selectImageByIndex(index)}
                    className={`h-1.5 rounded-full transition-all ${
                      index === selectedImageIndex
                        ? 'w-6 bg-white'
                        : 'w-1.5 bg-white/50 hover:bg-white/75'
                    }`}
                    aria-label={`תמונה ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Carousel עם scroll אופקי */}
          <div
            ref={imageCarouselRef}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth"
            style={{
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {galleryImages.map((image, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-full snap-center"
              >
                <div
                  className="relative aspect-square bg-neutral-50 cursor-zoom-in"
                  onMouseEnter={index === selectedImageIndex ? handleMouseEnter : undefined}
                  onMouseLeave={index === selectedImageIndex ? handleMouseLeave : undefined}
                  onMouseMove={index === selectedImageIndex ? handleMouseMove : undefined}
                >
                  {image && image !== '/placeholder.png' ? (
                    image.startsWith('data:') ? (
                      <img
                        src={image}
                        alt={`${product.name_he} ${index + 1}`}
                        className={`w-full h-full object-contain p-4 md:p-8 transition-transform duration-200 ${
                          index === selectedImageIndex && isZoomed ? 'scale-150' : 'scale-100'
                        }`}
                        style={
                          index === selectedImageIndex && isZoomed
                            ? {
                                transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                              }
                            : {}
                        }
                      />
                    ) : (
                      <div className="relative w-full h-full">
                        <Image
                          src={image}
                          alt={`${product.name_he} ${index + 1}`}
                          fill
                          className={`object-contain p-4 md:p-8 transition-transform duration-200 ${
                            index === selectedImageIndex && isZoomed ? 'scale-150' : 'scale-100'
                          }`}
                          style={
                            index === selectedImageIndex && isZoomed
                              ? {
                                  transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                                }
                              : {}
                          }
                          priority={index === 0}
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                    )
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm md:text-lg">
                      אין תמונה זמינה
                    </div>
                  )}

                  {/* Badges on first image only */}
                  {index === 0 && (
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      {hasDiscount && (
                        <div className="bg-black text-white px-3 py-1 text-xs font-light tracking-wider">
                          -{product.discount}%
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </div>

        {/* תמונות ממוזערות - Minimal Gallery - תמיד מוצג */}
        <div className="grid grid-cols-4 gap-2">
          {galleryImages.map((image, index) => (
            <button
              key={index}
              onClick={() => selectImageByIndex(index)}
              className={`relative aspect-square bg-neutral-50 overflow-hidden transition-all hover:opacity-75 ${
                selectedImageIndex === index
                  ? 'ring-2 ring-black'
                  : 'ring-1 ring-neutral-200'
              }`}
            >
              {image.startsWith('data:') ? (
                <img
                  src={image}
                  alt={`${product.name_he} ${index + 1}`}
                  className="w-full h-full object-contain p-1.5 md:p-2"
                />
              ) : (
                <Image
                  src={image}
                  alt={`${product.name_he} ${index + 1}`}
                  fill
                  className="object-contain p-1.5 md:p-2"
                  sizes="(max-width: 768px) 25vw, 100px"
                />
              )}
            </button>
          ))}
        </div>

        {/* Variant Selectors - Minimal Design */}
        {hasVariants && (
          <div className="space-y-4 border-t border-neutral-200 pt-4">
            {/* Color Selector */}
            {allColors.length > 0 && (
              <div>
                <h4 className="text-xs font-light tracking-widest uppercase text-neutral-600 mb-3">
                  צבע {selectedColor && `- ${selectedColor}`}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {allColors.map((color) => {
                    const available = isColorAvailable(color);
                    return (
                      <button
                        key={color}
                        onClick={() => available && handleColorSelect(color)}
                        disabled={!available}
                        className={`px-4 py-2 text-sm font-light tracking-wide transition-all border relative ${
                          selectedColor === color
                            ? 'border-black bg-black text-white'
                            : available
                            ? 'border-neutral-300 hover:border-black bg-white'
                            : 'border-neutral-200 bg-neutral-50 text-neutral-400 cursor-not-allowed'
                        }`}
                      >
                        <span className={!available ? 'line-through' : ''}>
                          {color}
                        </span>
                        {!available && (
                          <span className="block text-[10px] text-red-500 font-medium mt-0.5">אזל</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {allSizes.length > 0 && (
              <div>
                <h4 className="text-xs font-light tracking-widest uppercase text-neutral-600 mb-3">
                  מידה {selectedSize && `- ${selectedSize}`}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {allSizes.map((size) => {
                    const available = isSizeAvailable(size);
                    return (
                      <button
                        key={size}
                        onClick={() => available && handleSizeSelect(size)}
                        disabled={!available}
                        className={`px-4 py-2 text-sm font-light tracking-wide transition-all border min-w-[60px] relative ${
                          selectedSize === size
                            ? 'border-black bg-black text-white'
                            : available
                            ? 'border-neutral-300 hover:border-black bg-white'
                            : 'border-neutral-200 bg-neutral-50 text-neutral-400 cursor-not-allowed'
                        }`}
                      >
                        <span className={!available ? 'line-through' : ''}>
                          {size}
                        </span>
                        {!available && (
                          <span className="block text-[10px] text-red-500 font-medium mt-0.5">אזל</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Selected Variant Info */}
            {selectedVariant && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs font-medium">
                    זמין במלאי - {selectedColor} {selectedSize}
                  </span>
                </div>
                {selectedVariant.additionalCost?.ils > 0 && (
                  <p className="text-xs text-green-700 mt-1">
                    מחיר: ₪{getCurrentPrice().toFixed(2)} (כולל תוספת)
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* פרטים */}
      <div className="space-y-6">
        {/* כותרת */}
        <div>
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="text-xs font-light tracking-widest uppercase text-neutral-500">
              {product.category === 'electronics' ? 'אלקטרוניקה' :
               product.category === 'fashion' ? 'אופנה' :
               product.category === 'home' ? 'בית וגינה' :
               product.category === 'sports' ? 'ספורט' :
               product.category === 'toys' ? 'צעצועים' :
               product.category}
            </span>
            {product.asin && (
              <span className="text-xs font-light text-neutral-400">ASIN: {product.asin}</span>
            )}
          </div>

          <h1 className="text-3xl lg:text-4xl font-light tracking-wide mb-4 leading-tight">
            {product.name_he}
          </h1>
        </div>

        <div className="border-t border-neutral-200 pt-6" />

        {/* מחיר */}
        <div className="space-y-3">
          <div className="flex items-baseline gap-3">
            <span className="text-4xl lg:text-5xl font-normal tracking-tight">
              ₪{currentPrice.toFixed(0)}
            </span>
            {hasDiscount && product.originalPrice?.ils && (
              <>
                <span className="text-xl text-neutral-400 line-through font-light">
                  ₪{product.originalPrice.ils.toFixed(0)}
                </span>
                <span className="text-sm font-light text-red-600">
                  -{product.discount}%
                </span>
              </>
            )}
          </div>

          <div className="space-y-2 text-sm">
            <div className="bg-white/70 backdrop-blur rounded-md p-3 border border-blue-200">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-900">
                  <p className="font-semibold mb-1">המחיר כולל:</p>
                  <ul className="space-y-0.5">
                    <li>✓ מחיר המוצר מהספק</li>
                    <li>✓ משלוח בינלאומי מארה&quot;ב/אירופה</li>
                    <li>✓ מכס ומע&quot;מ (18%)</li>
                    <li>✓ טיפול ושירות</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* תיאור המוצר */}
        {product.description_he && (
          <div className="border-t border-neutral-200 pt-6">
            <h3 className="text-xs font-light tracking-widest uppercase text-neutral-600 mb-4">תיאור</h3>
            <div className="text-neutral-700 text-sm font-light leading-relaxed whitespace-pre-line">
              {product.description_he}
            </div>
          </div>
        )}

        {/* תגים */}
        {product.tags && product.tags.length > 0 && (
          <div className="border-t border-neutral-200 pt-6">
            <h3 className="text-xs font-light tracking-widest uppercase text-neutral-600 mb-4 flex items-center gap-2">
              <Tag className="h-4 w-4" />
              תגים
            </h3>
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => router.push(`/products?tags=${encodeURIComponent(tag)}`)}
                  className="px-4 py-2 text-sm font-light tracking-wide bg-neutral-100 hover:bg-black hover:text-white transition-all rounded-full"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity Selector and Add to Cart */}
        <div className="border-t border-neutral-200 pt-6 space-y-4">
          {/* Quantity Selector */}
          <div>
            <h4 className="text-xs font-light tracking-widest uppercase text-neutral-600 mb-3">כמות</h4>
            <div className="flex items-center gap-3">
              <button
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
                className="h-10 w-10 border border-neutral-300 hover:border-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Minus className="h-4 w-4" />
              </button>
              <div className="flex-1 text-center border border-neutral-300 py-2">
                <span className="text-lg font-normal">{quantity}</span>
              </div>
              <button
                onClick={increaseQuantity}
                disabled={quantity >= 2}
                className="h-10 w-10 border border-neutral-300 hover:border-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs font-light text-neutral-500 mt-2 text-center tracking-wide">
              מקסימום 2 יחידות
            </p>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={adding || !product.stock?.available}
            className="w-full py-4 text-sm font-light tracking-widest uppercase bg-black text-white hover:bg-neutral-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {adding ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                מוסיף...
              </>
            ) : (
              <>
                הוסף לעגלה
                {quantity > 1 && ` (${quantity})`}
              </>
            )}
          </button>

          {/* Price reminder */}
          {quantity > 1 && (
            <div className="text-center py-2 border-t border-neutral-200">
              <p className="text-sm font-light text-neutral-600 tracking-wide">
                סה"כ: <span className="text-black font-normal">₪{(currentPrice * quantity).toFixed(0)}</span>
              </p>
            </div>
          )}
        </div>

        {/* תכונות */}
        {product.features && product.features.length > 0 && (
          <div className="border-t border-neutral-200 pt-6">
            <h3 className="text-xs font-light tracking-widest uppercase text-neutral-600 mb-4">תכונות</h3>
            <ul className="space-y-2">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm font-light text-neutral-700">
                  <span className="text-neutral-400 mt-1">•</span>
                  <span className="leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* מפרט טכני */}
        {product.specifications && Object.keys(product.specifications).filter(key => product.specifications[key]).length > 0 && (
          <div className="border-t border-neutral-200 pt-6">
            <h3 className="text-xs font-light tracking-widest uppercase text-neutral-600 mb-4">מפרט</h3>
            <dl className="space-y-2 text-sm">
              {Object.entries(product.specifications).map(([key, value]) => (
                value && (
                  <div key={key} className="flex justify-between py-2 border-b border-neutral-100 last:border-0">
                    <dt className="text-neutral-600 font-light">
                      {key === 'brand' ? 'מותג' :
                       key === 'color' ? 'צבע' :
                       key === 'size' ? 'גודל' :
                       key === 'weight' ? 'משקל' :
                       key === 'dimensions' ? 'מידות' :
                       key === 'material' ? 'חומר' :
                       key === 'model' ? 'דגם' : key}
                    </dt>
                    <dd className="font-normal text-black">{value}</dd>
                  </div>
                )
              ))}
            </dl>
          </div>
        )}

        {/* משלוח ותהליך */}
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <Clock className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-amber-900 mb-1">זמן אספקה משוער</p>
              <p className="text-sm text-amber-800">
                14-21 ימי עסקים (כולל משלוח בינלאומי ומכס)
              </p>
            </div>
          </div>

          {/* תהליך השילוח */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-4">
            <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
              <Plane className="w-4 h-4" />
              מסלול המשלוח שלך
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-purple-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-700 font-bold text-[10px]">1</span>
                </div>
                <div>
                  <p className="font-semibold text-purple-900">אישור הזמנה</p>
                  <p className="text-purple-700">אנחנו מאמתים את ההזמנה ומבצעים רכישה מהספק</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-purple-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-700 font-bold text-[10px]">2</span>
                </div>
                <div>
                  <p className="font-semibold text-purple-900">הזמנה מהספק</p>
                  <p className="text-purple-700">המוצר נרכש ונשלח לחברת השילוח שלנו בארה&quot;ב/אירופה</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-purple-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-700 font-bold text-[10px]">3</span>
                </div>
                <div>
                  <p className="font-semibold text-purple-900">בחברת השילוח</p>
                  <p className="text-purple-700">המוצר מתקבל בארה&quot;ב/אירופה ונארז למשלוח בינלאומי</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-purple-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-700 font-bold text-[10px]">4</span>
                </div>
                <div>
                  <p className="font-semibold text-purple-900">במרכז לוגיסטי בישראל</p>
                  <p className="text-purple-700">המשלוח עבר מכס והגיע למרכז החלוקה</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-purple-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-700 font-bold text-[10px]">5</span>
                </div>
                <div>
                  <p className="font-semibold text-purple-900">במשלוח אליך</p>
                  <p className="text-purple-700">המוצר בדרך לכתובת שלך</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-green-900">הגיע!</p>
                  <p className="text-green-700">המוצר התקבל בהצלחה</p>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-purple-200">
              <p className="text-xs text-purple-700">
                <strong>שימו לב:</strong> תקבלו עדכוני SMS ומייל בכל שלב + מספר מעקב בינלאומי
              </p>
            </div>
          </div>
        </div>

        {/* זמינות */}
        <div className="border-t border-neutral-200 pt-6">
          {product.stock?.available ? (
            <div className="flex items-center gap-2 text-sm font-light tracking-wide">
              <CheckCircle className="h-4 w-4 text-neutral-600" />
              <span className="text-neutral-700">זמין להזמנה</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm font-light tracking-wide">
              <Package className="h-4 w-4 text-neutral-400" />
              <span className="text-neutral-500">לא זמין כרגע</span>
            </div>
          )}
        </div>

        {/* Trust Badges - Minimal */}
        <div className="border-t border-neutral-200 pt-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <Shield className="h-5 w-5 mx-auto mb-2 text-neutral-600" />
              <p className="text-xs font-light text-neutral-600 tracking-wide">תשלום מאובטח</p>
            </div>
            <div>
              <RotateCcw className="h-5 w-5 mx-auto mb-2 text-neutral-600" />
              <p className="text-xs font-light text-neutral-600 tracking-wide">החזרות בקלות</p>
            </div>
            <div>
              <Truck className="h-5 w-5 mx-auto mb-2 text-neutral-600" />
              <p className="text-xs font-light text-neutral-600 tracking-wide">משלוח מעוקב</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
