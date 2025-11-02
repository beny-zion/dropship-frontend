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
  Globe
} from 'lucide-react';

export default function ProductDetails({ product }) {
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

    const variant = product.variants.find(v =>
      v.color === color && v.size === size && v.stock?.available
    );

    if (variant) {
      setSelectedVariant(variant);
      // Update image if variant has images
      if (variant.images && variant.images.length > 0) {
        const primaryImg = variant.images.find(img => img.isPrimary) || variant.images[0];
        setSelectedImage(primaryImg.url);
      }
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

    if (selectedSize) {
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
    if (selectedColor) {
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
      if (!selectedColor && availableColors.length > 0) {
        toast.error('אנא בחר צבע');
        return;
      }
      if (!selectedSize && availableSizes.length > 0) {
        toast.error('אנא בחר מידה');
        return;
      }
      if (!selectedVariant) {
        toast.error('אנא בחר ווריאנט');
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
    <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
      {/* תמונות */}
      <div className="space-y-2 md:space-y-3">
        {/* תמונה ראשית עם זום */}
        <div
          className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 cursor-zoom-in"
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

          {/* Badges on Image */}
          <div className="absolute top-2 md:top-4 right-2 md:right-4 flex flex-col gap-1.5 md:gap-2">
            {hasDiscount && (
              <Badge className="bg-red-500 text-white shadow-lg text-xs">
                -{product.discount}%
              </Badge>
            )}
            {freeShipping && (
              <Badge className="bg-green-500 text-white shadow-lg text-xs">
                משלוח חינם
              </Badge>
            )}
            {product.featured && (
              <Badge className="bg-blue-500 text-white shadow-lg text-xs">
                מומלץ
              </Badge>
            )}
            <Badge className="bg-purple-500 text-white shadow-lg flex items-center gap-1 text-xs">
              <Globe className="w-3 h-3" />
              מארה&quot;ב
            </Badge>
          </div>
        </div>

        {/* תמונות ממוזערות - תמיד מציג את כל תמונות המוצר */}
        {galleryImages.length > 0 && (
          <div className="grid grid-cols-4 gap-1.5 md:gap-2">
            {galleryImages.slice(0, 4).map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(image)}
                className={`relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all hover:border-blue-400 ${
                  selectedImage === image
                    ? 'border-blue-600 ring-2 ring-blue-200'
                    : 'border-gray-200'
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

        {/* Variant Selectors - מתחת לגלריה */}
        {hasVariants && (
          <div className="space-y-2 md:space-y-3">
            {/* Color Selector */}
            {availableColors.length > 0 && (
              <div>
                <Label className="text-sm font-semibold mb-2 block">
                  בחר צבע {selectedColor && `(${selectedColor})`}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorSelect(color)}
                      className={`px-3 py-1.5 text-sm rounded-lg border-2 transition-all font-medium ${
                        selectedColor === color
                          ? 'border-blue-600 bg-blue-50 text-blue-900'
                          : 'border-gray-200 hover:border-blue-300 bg-white'
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
                <Label className="text-sm font-semibold mb-2 block">
                  בחר מידה {selectedSize && `(${selectedSize})`}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => handleSizeSelect(size)}
                      className={`px-3 py-1.5 text-sm rounded-lg border-2 transition-all font-medium min-w-[50px] ${
                        selectedSize === size
                          ? 'border-blue-600 bg-blue-50 text-blue-900'
                          : 'border-gray-200 hover:border-blue-300 bg-white'
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
      <div className="space-y-4">
        {/* כותרת */}
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {product.category === 'electronics' ? 'אלקטרוניקה' :
               product.category === 'fashion' ? 'אופנה' :
               product.category === 'home' ? 'בית וגינה' :
               product.category === 'sports' ? 'ספורט' :
               product.category === 'toys' ? 'צעצועים' :
               product.category}
            </Badge>
            {product.asin && (
              <span className="text-xs text-gray-500">ASIN: {product.asin}</span>
            )}
            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-300">
              <Globe className="w-3 h-3 mr-1" />
              יבוא אישי מארה&quot;ב
            </Badge>
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold mb-3 leading-tight">
            {product.name_he}
          </h1>
        </div>

        <Separator />

        {/* מחיר */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border-2 border-blue-200">
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-4xl lg:text-5xl font-bold text-blue-600">
              ₪{currentPrice.toFixed(2)}
            </span>
            {hasDiscount && product.originalPrice?.ils && (
              <>
                <span className="text-xl text-gray-400 line-through">
                  ₪{product.originalPrice.ils.toFixed(2)}
                </span>
                <Badge className="bg-red-500 text-white">
                  חסוך {product.discount}%
                </Badge>
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
          <div>
            <h3 className="font-bold text-xl mb-3">תיאור המוצר</h3>
            <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-lg border border-gray-200">
              {product.description_he}
            </div>
          </div>
        )}

        {/* Quantity Selector and Add to Cart */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-200 space-y-3">
          {/* Quantity Selector */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">בחר כמות</Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
                className="h-10 w-10 bg-white hover:bg-gray-50"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="flex-1 text-center bg-white rounded-lg py-2 border border-gray-200">
                <span className="text-xl font-bold text-gray-900">{quantity}</span>
                <span className="text-xs text-gray-500 mr-2">יחידות</span>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={increaseQuantity}
                disabled={quantity >= 2}
                className="h-10 w-10 bg-white hover:bg-gray-50"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-600 mt-1.5 text-center">
              מקסימום 2 יחידות להזמנה
            </p>
          </div>

          {/* Add to Cart Button */}
          <Button
            size="lg"
            className="w-full text-base md:text-lg h-12 md:h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
            onClick={handleAddToCart}
            disabled={adding || !product.stock?.available}
          >
            {adding ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
                מוסיף לעגלה...
              </>
            ) : (
              <>
                <ShoppingCart className="h-5 w-5 ml-2" />
                הזמן עכשיו {quantity > 1 ? `(${quantity} יחידות)` : ''}
              </>
            )}
          </Button>

          {/* Price reminder */}
          <div className="text-center pt-2 border-t border-green-300">
            <p className="text-sm font-semibold text-gray-700">
              סה"כ לתשלום: <span className="text-blue-600 text-lg">₪{(currentPrice * quantity).toFixed(2)}</span>
            </p>
          </div>
        </div>

        {/* תכונות */}
        {product.features && product.features.length > 0 && (
          <div>
            <h3 className="font-bold text-xl mb-3">תכונות עיקריות</h3>
            <ul className="space-y-2 bg-green-50 rounded-lg p-4 border border-green-200">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-green-600 mt-0.5 flex-shrink-0">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span className="text-gray-800 leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* מפרט טכני */}
        {product.specifications && Object.keys(product.specifications).filter(key => product.specifications[key]).length > 0 && (
          <div>
            <h3 className="font-bold text-xl mb-3">מפרט טכני</h3>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <dl className="grid grid-cols-1 gap-2 text-sm">
                {Object.entries(product.specifications).map(([key, value]) => (
                  value && (
                    <div key={key} className="flex justify-between border-b border-gray-200 pb-2 last:border-0">
                      <dt className="text-gray-600 font-medium">
                        {key === 'brand' ? 'מותג' :
                         key === 'color' ? 'צבע' :
                         key === 'size' ? 'גודל' :
                         key === 'weight' ? 'משקל' :
                         key === 'dimensions' ? 'מידות' :
                         key === 'material' ? 'חומר' :
                         key === 'model' ? 'דגם' : key}
                      </dt>
                      <dd className="font-semibold text-gray-900">{value}</dd>
                    </div>
                  )
                ))}
              </dl>
            </div>
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
        <div>
          {product.stock?.available ? (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-2.5 rounded-lg border border-green-200">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-semibold">זמין להזמנה - נרכש עבורך מיד לאחר האישור</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
              <Package className="h-4 w-4" />
              <span className="text-sm font-semibold">כרגע לא זמין - נעדכן כשיחזור למלאי</span>
            </div>
          )}
        </div>

        <Separator />

        {/* כפתור מועדפים */}
        <div>
          <Button
            variant="outline"
            size="lg"
            className="w-full text-base md:text-lg h-10 md:h-12 border-2"
          >
            <Heart className="h-5 w-5 ml-2" />
            הוסף למועדפים
          </Button>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-gray-50 rounded-lg border">
            <Shield className="h-5 w-5 mx-auto mb-1 text-blue-600" />
            <p className="text-[10px] md:text-xs font-semibold">תשלום מאובטח</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg border">
            <RotateCcw className="h-5 w-5 mx-auto mb-1 text-blue-600" />
            <p className="text-[10px] md:text-xs font-semibold">החזרה תוך 30 יום</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg border">
            <Truck className="h-5 w-5 mx-auto mb-1 text-blue-600" />
            <p className="text-[10px] md:text-xs font-semibold">מעקב מלא</p>
          </div>
        </div>

      </div>
    </div>
  );
}
