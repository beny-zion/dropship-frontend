'use client';

import { useState } from 'react';
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
  Tag
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
  const galleryImages = [imageData.main, ...imageData.gallery].filter(img => img && img !== '/placeholder.png');

  const [selectedImage, setSelectedImage] = useState(imageData.main);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [trackingClick, setTrackingClick] = useState(false);

  // Variant selection
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  const hasDiscount = product.discount > 0;
  const freeShipping = product.shipping?.freeShipping || false;
  const hasVariants = product.variants && product.variants.length > 0;

  // Get available colors and sizes
  const availableColors = hasVariants
    ? [...new Set(product.variants.filter(v => v.stock?.available).map(v => v.color).filter(Boolean))]
    : [];

  const availableSizes = hasVariants && selectedColor
    ? [...new Set(product.variants.filter(v => v.color === selectedColor && v.stock?.available).map(v => v.size).filter(Boolean))]
    : hasVariants
    ? [...new Set(product.variants.filter(v => v.stock?.available).map(v => v.size).filter(Boolean))]
    : [];

  // Update selected variant when color or size changes
  const updateSelectedVariant = (color, size) => {
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
      // Update image if variant has images
      if (variant.images && variant.images.length > 0) {
        const primaryImg = variant.images.find(img => img.isPrimary) || variant.images[0];
        setSelectedImage(primaryImg.url);
      }
    } else {
      // אם לא נמצא ווריאנט, נקה את הבחירה
      setSelectedVariant(null);
    }
  };

  // Handle color selection - עדכון מיידי של התמונה הראשית בלבד
  const handleColorSelect = (color) => {
    setSelectedColor(color);

    // מצא ווריאנט עם הצבע הנבחר ועדכן רק את התמונה הראשית
    const variantWithColor = product.variants?.find(v => v.color === color);
    if (variantWithColor?.images && variantWithColor.images.length > 0) {
      const primaryImg = variantWithColor.images.find(img => img.isPrimary) || variantWithColor.images[0];
      setSelectedImage(primaryImg.url);
    }

    // ⭐ תיקון: אם אין מידות זמינות, עדכן ווריאנט מיד (מוצרים עם צבעים בלבד)
    if (availableSizes.length === 0) {
      updateSelectedVariant(color, null);
    } else if (selectedSize) {
      updateSelectedVariant(color, selectedSize);
    } else if (availableSizes.length === 1) {
      // Auto-select if only one size available
      setSelectedSize(availableSizes[0]);
      updateSelectedVariant(color, availableSizes[0]);
    }
  };

  // Handle size selection
  const handleSizeSelect = (size) => {
    setSelectedSize(size);

    // ⭐ תיקון: אם אין צבעים זמינים, עדכן ווריאנט מיד (מוצרים עם מידות בלבד)
    if (availableColors.length === 0) {
      updateSelectedVariant(null, size);
    } else if (selectedColor) {
      updateSelectedVariant(selectedColor, size);
    } else if (availableColors.length === 1) {
      // Auto-select if only one color available
      setSelectedColor(availableColors[0]);
      updateSelectedVariant(availableColors[0], size);
    }
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
      // בדוק שבחרו צבע אם יש צבעים זמינים
      if (!selectedColor && availableColors.length > 0) {
        toast.error('אנא בחר צבע');
        return;
      }
      // בדוק שבחרו מידה אם יש מידות זמינות
      if (!selectedSize && availableSizes.length > 0) {
        toast.error('אנא בחר מידה');
        return;
      }
      // ⭐ תיקון: אם יש ווריאנטים אבל לא נבחר אף אחד - נסה למצוא אוטומטית
      if (!selectedVariant) {
        // אם אין צבעים ומידות כלל, זה אומר שהמוצר לא זמין
        if (availableColors.length === 0 && availableSizes.length === 0) {
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
        {/* תמונה ראשית עם זום */}
        <div
          className="relative aspect-square bg-neutral-50 overflow-hidden cursor-zoom-in"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
        >
          {selectedImage && selectedImage !== '/placeholder.png' ? (
            selectedImage.startsWith('data:') ? (
              <img
                src={selectedImage}
                alt={product.name_he}
                className={`w-full h-full object-contain p-4 md:p-8 transition-transform duration-200 ${
                  isZoomed ? 'scale-150' : 'scale-100'
                }`}
                style={
                  isZoomed
                    ? {
                        transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                      }
                    : {}
                }
              />
            ) : (
              <div className="relative w-full h-full">
                <Image
                  src={selectedImage}
                  alt={product.name_he}
                  fill
                  className={`object-contain p-4 md:p-8 transition-transform duration-200 ${
                    isZoomed ? 'scale-150' : 'scale-100'
                  }`}
                  style={
                    isZoomed
                      ? {
                          transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                        }
                      : {}
                  }
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            )
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm md:text-lg">
              אין תמונה זמינה
            </div>
          )}

          {/* Badges on Image - Minimal */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            {hasDiscount && (
              <div className="bg-black text-white px-3 py-1 text-xs font-light tracking-wider">
                -{product.discount}%
              </div>
            )}
          </div>
        </div>

        {/* תמונות ממוזערות - Minimal Gallery */}
        {galleryImages.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {galleryImages.slice(0, 4).map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(image)}
                className={`relative aspect-square bg-neutral-50 overflow-hidden transition-all hover:opacity-75 ${
                  selectedImage === image
                    ? 'ring-2 ring-black'
                    : ''
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
        )}

        {/* Variant Selectors - Minimal Design */}
        {hasVariants && (
          <div className="space-y-4 border-t border-neutral-200 pt-4">
            {/* Color Selector */}
            {availableColors.length > 0 && (
              <div>
                <h4 className="text-xs font-light tracking-widest uppercase text-neutral-600 mb-3">
                  צבע {selectedColor && `- ${selectedColor}`}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorSelect(color)}
                      className={`px-4 py-2 text-sm font-light tracking-wide transition-all border ${
                        selectedColor === color
                          ? 'border-black bg-black text-white'
                          : 'border-neutral-300 hover:border-black bg-white'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {availableSizes.length > 0 && (
              <div>
                <h4 className="text-xs font-light tracking-widest uppercase text-neutral-600 mb-3">
                  מידה {selectedSize && `- ${selectedSize}`}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => handleSizeSelect(size)}
                      className={`px-4 py-2 text-sm font-light tracking-wide transition-all border min-w-[60px] ${
                        selectedSize === size
                          ? 'border-black bg-black text-white'
                          : 'border-neutral-300 hover:border-black bg-white'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
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
