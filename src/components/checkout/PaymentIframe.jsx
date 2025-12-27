'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, Lock, CheckCircle2, Loader2, AlertCircle, X } from 'lucide-react';
import Image from 'next/image';

/**
 * PaymentIframe - קומפוננטת תשלום באמצעות IFRAME של HyPay
 * 
 * ✅ בטוח - פרטי כרטיס לא עוברים דרך השרת שלנו
 * ✅ לא צריך PCI Compliance
 * ✅ HyPay מטפל בכל האבטחה
 */
export function PaymentIframe({ 
  orderId, 
  amount, 
  onSuccess, 
  onError, 
  onCancel 
}) {
  const [status, setStatus] = useState('loading'); // loading, ready, processing, success, error
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [error, setError] = useState(null);

  // קבלת URL לתשלום מהשרת
  useEffect(() => {
    async function fetchPaymentUrl() {
      try {
        setStatus('loading');
        
        const response = await fetch('/api/payments/create-payment-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'שגיאה ביצירת קישור תשלום');
        }

        setPaymentUrl(data.paymentUrl);
        setStatus('ready');

      } catch (err) {
        console.error('Error fetching payment URL:', err);
        setError(err.message);
        setStatus('error');
        onError?.(err.message);
      }
    }

    if (orderId) {
      fetchPaymentUrl();
    }
  }, [orderId, onError]);

  // האזנה להודעות מה-IFRAME (postMessage)
  useEffect(() => {
    function handleMessage(event) {
      // וודא שההודעה מ-HyPay
      if (!event.origin.includes('hyp.co.il')) return;

      const { type, data } = event.data || {};

      switch (type) {
        case 'payment_success':
          setStatus('success');
          onSuccess?.(data);
          break;
        case 'payment_error':
          setStatus('error');
          setError(data?.message || 'שגיאה בתשלום');
          onError?.(data?.message);
          break;
        case 'payment_cancel':
          onCancel?.();
          break;
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSuccess, onError, onCancel]);

  // Polling לבדיקת סטטוס (backup אם postMessage לא עובד)
  useEffect(() => {
    if (status !== 'ready') return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/payments/status/${orderId}`);
        const data = await response.json();

        if (data.data?.payment?.status === 'hold') {
          setStatus('success');
          onSuccess?.(data.data);
          clearInterval(pollInterval);
        }
      } catch (err) {
        // Ignore polling errors
      }
    }, 3000); // בדוק כל 3 שניות

    return () => clearInterval(pollInterval);
  }, [status, orderId, onSuccess]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col items-center justify-center py-4 bg-white border-2 border-blue-200 shadow-md rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <Image
            src="/HYP-logo.svg"
            alt="Hyp Pay"
            width={120}
            height={48}
            className="object-contain"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-600">
          <Shield className="w-3.5 h-3.5 text-green-600" />
          <span className="font-medium">תשלום מאובטח</span>
          <span className="w-1 h-1 bg-neutral-400 rounded-full"></span>
          <Lock className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-medium">הצפנת SSL 256-bit</span>
        </div>
      </div>

      {/* Security Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-900 mb-1">💳 איך זה עובד?</p>
            <p className="text-blue-800 font-light leading-relaxed text-sm">
              <strong>שלב 1:</strong> נתפוס מסגרת של <strong className="text-blue-900">₪{amount?.toFixed(0)}</strong> בכרטיס שלך<br/>
              <strong>שלב 2:</strong> נזמין את המוצרים מהספק (1-3 ימים)<br/>
              <strong>שלב 3:</strong> רק אז נבצע את החיוב הסופי
            </p>
            <p className="text-xs text-blue-700 mt-2 font-medium">
              ✅ לא נגבה ממך כסף עד שהמוצרים יוזמנו בפועל
            </p>
          </div>
        </div>
      </div>

      {/* Status: Loading */}
      {status === 'loading' && (
        <div className="flex flex-col items-center justify-center py-12 bg-white border rounded-lg">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
          <p className="text-neutral-600">טוען טופס תשלום מאובטח...</p>
        </div>
      )}

      {/* Status: Error */}
      {status === 'error' && (
        <div className="flex flex-col items-center justify-center py-12 bg-red-50 border-2 border-red-200 rounded-lg">
          <AlertCircle className="w-8 h-8 text-red-600 mb-4" />
          <p className="text-red-800 font-medium mb-2">שגיאה בטעינת טופס התשלום</p>
          <p className="text-red-600 text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            נסה שוב
          </button>
        </div>
      )}

      {/* Status: Success */}
      {status === 'success' && (
        <div className="flex flex-col items-center justify-center py-12 bg-green-50 border-2 border-green-200 rounded-lg">
          <CheckCircle2 className="w-12 h-12 text-green-600 mb-4" />
          <p className="text-green-800 font-semibold text-lg mb-2">התשלום התקבל בהצלחה!</p>
          <p className="text-green-600 text-sm">מסגרת האשראי נתפסה. נעדכן אותך כשההזמנה תצא לדרך.</p>
        </div>
      )}

      {/* Status: Ready - Show IFRAME */}
      {status === 'ready' && paymentUrl && (
        <div className="relative">
          {/* IFRAME Container */}
          <div className="border-2 border-neutral-200 rounded-lg overflow-hidden bg-white">
            <iframe
              src={paymentUrl}
              className="w-full"
              style={{ height: '500px', minHeight: '500px' }}
              frameBorder="0"
              allow="payment"
              sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
              title="HyPay Secure Payment"
            />
          </div>

          {/* Cancel Button */}
          <button
            onClick={onCancel}
            className="absolute top-2 left-2 p-2 bg-white rounded-full shadow-md hover:bg-neutral-100"
            title="ביטול"
          >
            <X className="w-4 h-4 text-neutral-600" />
          </button>
        </div>
      )}

      {/* Security Badges */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex items-center gap-2 bg-white p-3 border border-green-200 rounded-lg shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
          <span className="text-xs font-medium text-green-900">PCI DSS</span>
        </div>
        <div className="flex items-center gap-2 bg-white p-3 border border-blue-200 rounded-lg shadow-sm">
          <Shield className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span className="text-xs font-medium text-blue-900">SSL מוצפן</span>
        </div>
        <div className="flex items-center gap-2 bg-white p-3 border border-purple-200 rounded-lg shadow-sm">
          <Lock className="w-4 h-4 text-purple-600 flex-shrink-0" />
          <span className="text-xs font-medium text-purple-900">3D Secure</span>
        </div>
      </div>

      {/* Credit Card Logos */}
      <div className="flex items-center justify-center gap-3 py-3 bg-white border border-neutral-200 rounded-lg shadow-sm">
        <span className="text-xs text-neutral-600 font-light">כרטיסים מקובלים:</span>
        <div className="flex items-center gap-3">
          <Image src="/visa-svgrepo-com.svg" alt="Visa" width={40} height={28} className="object-contain" />
          <Image src="/mastercard-svgrepo-com.svg" alt="Mastercard" width={40} height={28} className="object-contain" />
          <Image src="/Isracard_2020_Logo.svg.png" alt="ישראכרט" width={40} height={28} className="object-contain" />
          <Image src="/Cal_logo_2019.svg.png" alt="Cal" width={40} height={28} className="object-contain" />
        </div>
      </div>

      {/* Security Footer */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-900 mb-2">🔒 פרטי התשלום שלך מוגנים ב-100%</p>
            <ul className="text-xs text-green-800 space-y-1 font-light">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-green-600" />
                פרטי הכרטיס מוזנים ישירות ל-HyPay - לא עוברים דרכנו
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-green-600" />
                אנחנו לא שומרים ולא רואים את מספר הכרטיס שלך
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-green-600" />
                התשלום מעובד ישירות דרך HyPay - ספק תשלומים מאושר
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentIframe;
