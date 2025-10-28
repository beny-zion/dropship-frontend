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
  Star,
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
  const [selectedImage, setSelectedImage] = useState(imageData.main);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [trackingClick, setTrackingClick] = useState(false);

  const hasDiscount = product.discount > 0;
  const freeShipping = product.shipping?.freeShipping || false;

  // Handle Add to Cart
  const handleAddToCart = async () => {
    setAdding(true);
    try {
      addToCart(product, quantity);
      toast.success(`${quantity} פריטים נוספו לעגלה!`, {
        description: product.name_he,
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

  // Quantity handlers
  const increaseQuantity = () => {
    if (quantity < 10) {
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
        {/* תמונה ראשית */}
        <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
          {selectedImage && selectedImage !== '/placeholder.png' ? (
            selectedImage.startsWith('data:') ? (
              <img
                src={selectedImage}
                alt={product.name_he}
                className="w-full h-full object-contain p-8"
              />
            ) : (
              <Image
                src={selectedImage}
                alt={product.name_he}
                fill
                className="object-contain p-8"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            )
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-lg">
              אין תמונה זמינה
            </div>
          )}

          {/* Badges on Image */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            {hasDiscount && (
              <Badge className="bg-red-500 text-white shadow-lg">
                -{product.discount}%
              </Badge>
            )}
            {freeShipping && (
              <Badge className="bg-green-500 text-white shadow-lg">
                משלוח חינם
              </Badge>
            )}
            {product.featured && (
              <Badge className="bg-blue-500 text-white shadow-lg">
                מומלץ
              </Badge>
            )}
            <Badge className="bg-purple-500 text-white shadow-lg flex items-center gap-1">
              <Globe className="w-3 h-3" />
              מארה&quot;ב
            </Badge>
          </div>
        </div>

        {/* תמונות ממוזערות */}
        {(imageData.gallery && imageData.gallery.length > 0) || imageData.main !== '/placeholder.png' ? (
          <div className="grid grid-cols-4 gap-2">
            {imageData.main && imageData.main !== '/placeholder.png' && (
              <button
                onClick={() => setSelectedImage(imageData.main)}
                className={`relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all hover:border-blue-400 ${
                  selectedImage === imageData.main
                    ? 'border-blue-600 ring-2 ring-blue-200'
                    : 'border-gray-200'
                }`}
              >
                {imageData.main.startsWith('data:') ? (
                  <img
                    src={imageData.main}
                    alt={product.name_he}
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <Image
                    src={imageData.main}
                    alt={product.name_he}
                    fill
                    className="object-contain p-2"
                    sizes="100px"
                  />
                )}
              </button>
            )}

            {imageData.gallery.slice(0, 3).map((image, index) => (
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
                    alt={`${product.name_he} ${index + 2}`}
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <Image
                    src={image}
                    alt={`${product.name_he} ${index + 2}`}
                    fill
                    className="object-contain p-2"
                    sizes="100px"
                  />
                )}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* פרטים */}
      <div className="space-y-6">
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

          {/* Rating */}
          <div className="flex items-center gap-4 mb-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.round(product.rating?.average || 0)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-gray-200 text-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium">
              {(product.rating?.average || 0).toFixed(1)}
            </span>
            <span className="text-sm text-gray-500">
              ({(product.rating?.count || 0).toLocaleString()} ביקורות)
            </span>
          </div>
        </div>

        <Separator />

        {/* מחיר */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200">
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-4xl lg:text-5xl font-bold text-blue-600">
              ₪{product.price?.ils?.toFixed(2) || '0.00'}
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
            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">זמין להזמנה - נרכש עבורך מיד לאחר האישור</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
              <Package className="h-5 w-5" />
              <span className="font-semibold">כרגע לא זמין - נעדכן כשיחזור למלאי</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Quantity Selector */}
        <div>
          <Label className="text-base font-semibold mb-3 block">כמות</Label>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={decreaseQuantity}
              disabled={quantity <= 1}
              className="h-12 w-12"
            >
              <Minus className="h-5 w-5" />
            </Button>
            <div className="flex-1 text-center">
              <span className="text-2xl font-bold">{quantity}</span>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={increaseQuantity}
              disabled={quantity >= 10}
              className="h-12 w-12"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            מקסימום 10 יחידות להזמנה
          </p>
        </div>

        {/* כפתורי פעולה */}
        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full text-lg h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
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

          <Button
            variant="ghost"
            size="lg"
            className="w-full text-lg h-12"
          >
            <Heart className="h-5 w-5 ml-2" />
            הוסף למועדפים
          </Button>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-3 gap-3 pt-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg border">
            <Shield className="h-6 w-6 mx-auto mb-1 text-blue-600" />
            <p className="text-xs font-semibold">תשלום מאובטח</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg border">
            <RotateCcw className="h-6 w-6 mx-auto mb-1 text-blue-600" />
            <p className="text-xs font-semibold">החזרה תוך 30 יום</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg border">
            <Truck className="h-6 w-6 mx-auto mb-1 text-blue-600" />
            <p className="text-xs font-semibold">מעקב מלא</p>
          </div>
        </div>

        <Separator />

        {/* מפרט טכני */}
        {product.specifications && Object.keys(product.specifications).filter(key => product.specifications[key]).length > 0 && (
          <div>
            <h3 className="font-bold text-xl mb-4">מפרט טכני</h3>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <dl className="grid grid-cols-1 gap-3 text-sm">
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

        {/* תכונות */}
        {product.features && product.features.length > 0 && (
          <div>
            <h3 className="font-bold text-xl mb-4">תכונות עיקריות</h3>
            <ul className="space-y-3 bg-green-50 rounded-lg p-4 border border-green-200">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-green-600 mt-0.5 flex-shrink-0">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span className="text-gray-800 leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* תיאור מלא */}
      <div className="md:col-span-2 space-y-6">
        <Separator />

        <div>
          <h2 className="text-3xl font-bold mb-6">תיאור המוצר</h2>
          <div className="prose max-w-none">
            <div className="text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 p-6 rounded-lg border border-gray-200">
              {product.description_he}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid md:grid-cols-2 gap-6 pt-6">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h4 className="font-bold text-lg mb-3 text-blue-900">איך זה עובד?</h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• אנחנו רוכשים עבורך מספקים בארה&quot;ב/אירופה</li>
              <li>• המוצר נשלח לחברת השילוח שלנו בחו&quot;ל</li>
              <li>• משלוח בינלאומי לישראל דרך מכס</li>
              <li>• משלוח עד הבית - ללא טרחה</li>
            </ul>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h4 className="font-bold text-lg mb-3 text-green-900">למה לקנות אצלנו?</h4>
            <ul className="space-y-2 text-sm text-green-800">
              <li>• מחירים טובים יותר מחנויות בישראל</li>
              <li>• גישה למוצרים שלא זמינים בארץ</li>
              <li>• שקיפות מלאה - מעקב בכל שלב</li>
              <li>• תמיכה בעברית לאורך כל הדרך</li>
            </ul>
          </div>
        </div>

        {/* Product Tags */}
        {product.tags && product.tags.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3">תגיות:</h4>
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag, index) => (
                <Badge key={index} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
