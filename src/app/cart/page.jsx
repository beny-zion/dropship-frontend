'use client';

import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, AlertTriangle, Shield, Truck, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { settingsApi } from '@/lib/api/settings';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart, getItemCount, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [freeShippingSettings, setFreeShippingSettings] = useState(null);

  // Load free shipping settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await settingsApi.getShippingSettings();
        const data = response.data;
        if (data?.shipping?.freeShipping) {
          setFreeShippingSettings(data.shipping.freeShipping);
        }
      } catch (error) {
        console.error('Failed to load shipping settings:', error);
      }
    };
    loadSettings();
  }, []);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('נא להתחבר תחילה');
      router.push('/login?redirect=/checkout');
      return;
    }
    
    // Check if any items are unavailable
    const hasUnavailableItems = cart.items.some(item => !item.product.stock.available);
    if (hasUnavailableItems) {
      toast.error('יש מוצרים לא זמינים בעגלה');
      return;
    }

    router.push('/checkout');
  };

  const handleUpdateQuantity = async (productId, newQuantity, variantSku = null) => {
    // בדיקת מגבלה
    if (newQuantity > 2) {
      toast.error('ניתן להזמין עד 2 יחידות בלבד מכל מוצר');
      return;
    }

    try {
      await updateQuantity(productId, newQuantity, variantSku);
      toast.success('כמות עודכנה');
    } catch (error) {
      console.error('Update quantity error:', error);
    }
  };

  const handleRemoveItem = async (productId, productName, variantSku = null) => {
    try {
      await removeFromCart(productId, variantSku);
      // Toast already shown in context
    } catch (error) {
      console.error('Remove item error:', error);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('האם אתה בטוח שברצונך לרוקן את העגלה?')) {
      try {
        await clearCart();
        toast.success('העגלה רוקנה');
      } catch (error) {
        console.error('Clear cart error:', error);
      }
    }
  };

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-3xl font-light tracking-wide mb-4">נדרשת התחברות</h2>
          <p className="text-sm font-light text-neutral-600 mb-8 tracking-wide">
            כדי לצפות בעגלת הקניות, נא להתחבר תחילה
          </p>
          <Link href="/login?redirect=/cart">
            <button className="px-8 py-3 bg-black text-white text-sm font-light tracking-widest uppercase hover:bg-neutral-800 transition-all">
              התחבר
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-sm font-light text-neutral-600 tracking-wide">טוען...</p>
        </div>
      </div>
    );
  }

  // Empty cart
  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md mx-auto text-center">
          <ShoppingBag className="h-20 w-20 mx-auto text-neutral-300 mb-6" />
          <h2 className="text-3xl font-light tracking-wide mb-4">העגלה ריקה</h2>
          <p className="text-sm font-light text-neutral-600 mb-8 tracking-wide">
            טרם הוספת מוצרים לעגלה
          </p>
          <Link href="/products">
            <button className="px-8 py-3 bg-black text-white text-sm font-light tracking-widest uppercase hover:bg-neutral-800 transition-all inline-flex items-center gap-2">
              צפה במוצרים
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const itemCount = getItemCount();
  const hasUnavailableItems = cart.items.some(item => !item.product.stock.available);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-neutral-200">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-light tracking-widest uppercase mb-2">עגלת קניות</h1>
              <p className="text-sm font-light text-neutral-600 tracking-wide">
                {itemCount} {itemCount === 1 ? 'פריט' : 'פריטים'}
              </p>
            </div>
            <button
              onClick={handleClearCart}
              className="text-sm font-light text-neutral-500 hover:text-black transition-colors underline underline-offset-4 tracking-wide"
            >
              רוקן עגלה
            </button>
          </div>
        </div>
      </div>

      {/* Unavailable Items Alert */}
      {hasUnavailableItems && (
        <div className="bg-neutral-50 border-b border-neutral-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-neutral-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-normal text-neutral-900 mb-1">חלק מהמוצרים אינם זמינים</p>
                <p className="text-xs font-light text-neutral-600">
                  הסר מוצרים לא זמינים כדי להמשיך לקופה
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-12">

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => {
            const isUnavailable = !item.product.stock.available;
            // ⭐ יצירת key ייחודי שכולל גם את ה-variantSku
            const itemKey = item.variantSku
              ? `${item.product._id}-${item.variantSku}`
              : item.product._id;

            return (
              <div
                key={itemKey}
                className={`border-b border-neutral-200 pb-6 transition-all ${
                  isUnavailable ? 'opacity-50' : ''
                }`}
              >
                <div className="flex gap-6">
                  {/* Image */}
                  <div className="relative h-32 w-32 flex-shrink-0 bg-neutral-50 overflow-hidden">
                    {(() => {
                      // ⭐ קודם נחפש תמונה של הווריאנט, אחר כך תמונה כללית
                      let imageUrl = null;

                      // אם יש ווריאנט, חפש את התמונה שלו
                      if (item.variantSku && item.product.variants) {
                        const variant = item.product.variants.find(v => v.sku === item.variantSku);
                        if (variant?.images?.length > 0) {
                          const primaryImage = variant.images.find(img => img.isPrimary);
                          imageUrl = primaryImage?.url || variant.images[0]?.url;
                        }
                      }

                      // אם לא מצאנו תמונת ווריאנט, קח תמונה כללית
                      if (!imageUrl) {
                        imageUrl = item.product.images?.[0]?.url || item.product.images?.main;
                      }

                      return imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={item.product.name_he}
                          fill
                          className={`object-contain p-2 ${isUnavailable ? 'opacity-50' : ''}`}
                          sizes="96px"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-xs text-gray-400">
                          אין תמונה
                        </div>
                      );
                    })()}
                    {isUnavailable && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60">
                        <span className="bg-white px-3 py-1 text-xs font-light tracking-wider">לא זמין</span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <Link
                        href={`/products/${item.product.slug || item.product._id}`}
                        className="font-light text-base hover:text-neutral-600 line-clamp-2 flex-1 transition-colors"
                      >
                        {item.product.name_he}
                      </Link>
                      <button
                        onClick={() => handleRemoveItem(item.product._id, item.product.name_he, item.variantSku)}
                        className="text-neutral-400 hover:text-black p-1 flex-shrink-0 transition-colors"
                        title="הסר"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Variant Details */}
                    {item.variant && (
                      <div className="flex gap-3 mb-3">
                        {item.variant.color && (
                          <span className="text-xs font-light text-neutral-600">
                            צבע: {item.variant.color}
                          </span>
                        )}
                        {item.variant.size && (
                          <span className="text-xs font-light text-neutral-600">
                            מידה: {item.variant.size}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Stock Status */}
                    {isUnavailable && (
                      <div className="mb-3">
                        <span className="text-xs font-light text-red-600">אזל מהמלאי</span>
                      </div>
                    )}

                    {/* Quantity & Price */}
                    <div className="flex items-center justify-between gap-6">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-neutral-300">
                        <button
                          onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1, item.variantSku)}
                          disabled={item.quantity <= 1 || isUnavailable}
                          className="px-3 py-2 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          aria-label="הפחת"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-4 py-2 border-x border-neutral-300 min-w-[3rem] text-center font-normal text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1, item.variantSku)}
                          disabled={item.quantity >= 2 || isUnavailable}
                          className="px-3 py-2 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          aria-label="הוסף"
                          title={item.quantity >= 2 ? "מקסימום 2 יחידות" : "הוסף"}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <div className="text-lg font-normal tracking-tight">
                          ₪{item.subtotalPrice ? item.subtotalPrice.toFixed(0) : (item.price * item.quantity).toFixed(0)}
                        </div>
                        <div className="text-xs font-light text-neutral-500">
                          ₪{item.price.toFixed(0)} × {item.quantity}
                        </div>
                      </div>
                    </div>

                    {/* Max Quantity Warning */}
                    {item.quantity >= 2 && (
                      <p className="text-xs font-light text-neutral-500 mt-3">
                        מקסימום 2 יחידות
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="border border-neutral-200 p-6">
            <h2 className="text-xs font-light tracking-widest uppercase text-neutral-600 mb-6">סיכום הזמנה</h2>

            {/* Pricing Breakdown */}
            <div className="space-y-3 mb-6 pb-6 border-b border-neutral-200">
              <div className="flex justify-between text-sm">
                <span className="font-light text-neutral-600">סכום ביניים:</span>
                <span className="font-normal">₪{cart.pricing.subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-xs font-light text-neutral-500 pr-4">
                <span>המחיר כולל מע״מ (18%):</span>
                <span>₪{cart.pricing.tax.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-light text-neutral-600">משלוח:</span>
                {cart.pricing.shipping === 0 ? (
                  <span className="font-normal">חינם</span>
                ) : (
                  <span className="font-normal">₪{cart.pricing.shipping.toFixed(0)}</span>
                )}
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between text-xl font-normal mb-6">
              <span>סה״כ:</span>
              <span>₪{cart.pricing.total.toFixed(0)}</span>
            </div>

            {/* Free Shipping Progress */}
            {freeShippingSettings?.enabled && freeShippingSettings?.threshold?.ils > 0 && cart.pricing.subtotal < freeShippingSettings.threshold.ils && (
              <div className="bg-blue-50 border border-blue-200 text-blue-900 text-sm p-4 rounded-lg mb-6">
                <p className="font-semibold mb-2">כמעט משלוח חינם!</p>
                <p>
                  הוסף עוד <span className="font-bold">₪{(freeShippingSettings.threshold.ils - cart.pricing.subtotal).toFixed(2)}</span> וקבל משלוח חינם
                </p>
                <div className="mt-2 bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((cart.pricing.subtotal / freeShippingSettings.threshold.ils) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Free Shipping Achieved */}
            {freeShippingSettings?.enabled && freeShippingSettings?.threshold?.ils > 0 && cart.pricing.subtotal >= freeShippingSettings.threshold.ils && (
              <div className="bg-green-50 border border-green-200 text-green-900 text-sm p-4 rounded-lg mb-6 text-center">
                <p className="font-semibold">🎉 זכית במשלוח חינם!</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleCheckout}
                disabled={hasUnavailableItems || cart.items.length === 0}
                className="w-full py-4 bg-black text-white text-sm font-light tracking-widest uppercase hover:bg-neutral-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {hasUnavailableItems ? 'הסר מוצרים לא זמינים' : 'המשך לקופה'}
              </button>

              <Link href="/products">
                <button className="w-full py-3 border border-neutral-300 text-sm font-light tracking-wide hover:border-black transition-colors flex items-center justify-center gap-2">
                  <ArrowRight className="h-4 w-4" />
                  המשך בקניות
                </button>
              </Link>
            </div>

            <div className="my-6 border-t border-neutral-200" />

            {/* Trust Indicators - Minimal */}
            <div className="space-y-2.5 text-xs font-light text-neutral-700" dir="rtl">
              <div className="flex items-center gap-2.5">
                <Shield className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                <span>תשלום מאובטח</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Truck className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                <span>משלוח מהיר</span>
              </div>
              <div className="flex items-center gap-2.5">
                <RefreshCw className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                <span>החזרות חינם</span>
              </div>
            </div>
          </div>

          {/* Help Section - Minimal */}
          <div className="mt-6 border border-neutral-200 p-4">
            <h3 className="text-sm font-normal mb-2 tracking-wide">צריך עזרה?</h3>
            <p className="text-xs font-light text-neutral-600 mb-3 tracking-wide">
              יש שאלות? אנחנו כאן
            </p>
            <Link href="/contact">
              <button className="w-full py-2 border border-neutral-300 text-xs font-light tracking-wide hover:border-black transition-colors">
                צור קשר
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}