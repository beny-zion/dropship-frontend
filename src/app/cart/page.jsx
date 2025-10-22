'use client';

import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart, getItemCount, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

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

  const handleUpdateQuantity = async (productId, newQuantity) => {
    try {
      await updateQuantity(productId, newQuantity);
      toast.success('כמות עודכנה');
    } catch (error) {
      console.error('Update quantity error:', error);
    }
  };

  const handleRemoveItem = async (productId, productName) => {
    try {
      await removeFromCart(productId);
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
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">נדרשת התחברות</h2>
          <p className="text-gray-600 mb-6">
            כדי לצפות בעגלת הקניות, נא להתחבר תחילה
          </p>
          <Link href="/login?redirect=/cart">
            <Button size="lg">התחבר</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">טוען עגלה...</p>
      </div>
    );
  }

  // Empty cart
  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <ShoppingBag className="h-24 w-24 mx-auto text-gray-300 mb-6" />
          <h2 className="text-2xl font-bold mb-4">העגלה ריקה</h2>
          <p className="text-gray-600 mb-6">
            עדיין לא הוספת מוצרים לעגלה. התחל לקנות עכשיו!
          </p>
          <Link href="/products">
            <Button size="lg">
              צפה במוצרים
              <ArrowRight className="mr-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const itemCount = getItemCount();
  const hasUnavailableItems = cart.items.some(item => !item.product.stock.available);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">עגלת הקניות שלי</h1>
          <p className="text-gray-600 mt-1">
            {itemCount} {itemCount === 1 ? 'פריט' : 'פריטים'} בעגלה
          </p>
        </div>
        <Button 
          variant="ghost" 
          onClick={handleClearCart} 
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 ml-2" />
          רוקן עגלה
        </Button>
      </div>

      {/* Unavailable Items Alert */}
      {hasUnavailableItems && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-yellow-900">חלק מהמוצרים לא זמינים</p>
            <p className="text-sm text-yellow-800">
              מוצרים שאזלו מהמלאי מסומנים באדום. הסר אותם כדי להמשיך לקופה.
            </p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => {
            const isUnavailable = !item.product.stock.available;
            
            return (
              <div
                key={item.product._id}
                className={`bg-white border rounded-lg p-4 transition-all ${
                  isUnavailable ? 'border-red-300 bg-red-50' : 'hover:shadow-md'
                }`}
              >
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="relative h-24 w-24 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                    {(item.product.images?.[0]?.url || item.product.images?.main) ? (
                      <Image
                        src={item.product.images[0]?.url || item.product.images.main}
                        alt={item.product.name_he}
                        fill
                        className={`object-contain p-2 ${isUnavailable ? 'opacity-50' : ''}`}
                        sizes="96px"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs text-gray-400">
                        אין תמונה
                      </div>
                    )}
                    {isUnavailable && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <Badge className="bg-red-500 text-white">לא זמין</Badge>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Link
                        href={`/products/${item.product.slug || item.product._id}`}
                        className="font-semibold hover:text-blue-600 line-clamp-2 flex-1"
                      >
                        {item.product.name_he}
                      </Link>
                      <button
                        onClick={() => handleRemoveItem(item.product._id, item.product.name_he)}
                        className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                        title="הסר מהעגלה"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Stock Status */}
                    {isUnavailable && (
                      <div className="mb-2">
                        <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                          אזל מהמלאי
                        </Badge>
                      </div>
                    )}

                    {/* Quantity & Price */}
                    <div className="flex items-center justify-between gap-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center border rounded overflow-hidden">
                        <button
                          onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || isUnavailable}
                          className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          aria-label="הפחת כמות"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-4 py-2 border-x min-w-[3rem] text-center font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                          disabled={item.quantity >= 10 || isUnavailable}
                          className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          aria-label="הוסף כמות"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-left">
                        <div className="text-lg font-bold text-blue-600">
                          ₪{item.subtotalPrice ? item.subtotalPrice.toFixed(2) : (item.price * item.quantity).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          ₪{item.price.toFixed(2)} × {item.quantity}
                        </div>
                      </div>
                    </div>

                    {/* Low Stock Warning */}
                    {item.product.stock.quantity && 
                     item.product.stock.quantity < 5 && 
                     item.product.stock.available && (
                      <p className="text-xs text-orange-600 mt-2">
                        נותרו רק {item.product.stock.quantity} יחידות במלאי!
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
          <div className="bg-white border rounded-lg p-6 sticky top-24 shadow-sm">
            <h2 className="text-xl font-bold mb-6">סיכום הזמנה</h2>

            {/* Pricing Breakdown */}
            <div className="space-y-3 mb-6 pb-6 border-b">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">סכום ביניים:</span>
                <span className="font-semibold">₪{cart.pricing.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">מע״מ (17%):</span>
                <span className="font-semibold">₪{cart.pricing.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">משלוח:</span>
                {cart.pricing.shipping === 0 ? (
                  <span className="text-green-600 font-semibold">חינם! 🎉</span>
                ) : (
                  <span className="font-semibold">₪{cart.pricing.shipping.toFixed(2)}</span>
                )}
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between text-2xl font-bold mb-6">
              <span>סה״כ לתשלום:</span>
              <span className="text-blue-600">₪{cart.pricing.total.toFixed(2)}</span>
            </div>

            {/* Free Shipping Progress */}
            {cart.pricing.shipping > 0 && cart.pricing.subtotal < 200 && (
              <div className="bg-blue-50 border border-blue-200 text-blue-900 text-sm p-4 rounded-lg mb-6">
                <p className="font-semibold mb-2">כמעט משלוח חינם!</p>
                <p>
                  הוסף עוד <span className="font-bold">₪{(200 - cart.pricing.subtotal).toFixed(2)}</span> וקבל משלוח חינם
                </p>
                <div className="mt-2 bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(cart.pricing.subtotal / 200) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Free Shipping Badge */}
            {cart.pricing.shipping === 0 && (
              <div className="bg-green-50 border border-green-200 text-green-900 text-sm p-4 rounded-lg mb-6 text-center">
                <p className="font-semibold">🎉 זכית במשלוח חינם!</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                className="w-full text-lg h-14"
                size="lg"
                onClick={handleCheckout}
                disabled={hasUnavailableItems || cart.items.length === 0}
              >
                {hasUnavailableItems ? 'הסר מוצרים לא זמינים' : 'המשך לקופה'}
              </Button>

              <Link href="/products">
                <Button variant="outline" className="w-full" size="lg">
                  <ArrowRight className="ml-2 h-4 w-4" />
                  המשך בקניות
                </Button>
              </Link>
            </div>

            <Separator className="my-6" />

            {/* Trust Indicators */}
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>תשלום מאובטח 100%</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>משלוח מהיר עד הבית</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>החזרה חינם תוך 30 יום</span>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-6 bg-gray-50 border rounded-lg p-4">
            <h3 className="font-semibold mb-2">צריך עזרה?</h3>
            <p className="text-sm text-gray-600 mb-3">
              יש לך שאלות לגבי ההזמנה? אנחנו כאן בשבילך!
            </p>
            <Link href="/contact">
              <Button variant="outline" size="sm" className="w-full">
                צור קשר
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}