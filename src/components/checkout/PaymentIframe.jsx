'use client';

import { useState, useEffect } from 'react';
import { Shield, Lock, CheckCircle2, Loader2, AlertCircle, X } from 'lucide-react';
import Image from 'next/image';
import { createPaymentLink } from '@/lib/api/payments';
import { getPaymentStatus } from '@/lib/api/payments';

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

        const response = await createPaymentLink(orderId);

        if (!response?.success) {
          throw new Error(response?.message || 'שגיאה ביצירת קישור תשלום');
        }

        setPaymentUrl(response.paymentUrl);
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

    console.log('🔄 [Polling] Started polling for order:', orderId);

    const pollInterval = setInterval(async () => {
      try {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔍 [Polling] Checking payment status...');
        console.log('📦 [Polling] Order ID:', orderId);

        const response = await getPaymentStatus(orderId);

        console.log('📡 [Polling] Response received:', {
          success: response?.success,
          hasData: !!response?.data,
          hasPayment: !!response?.data?.payment,
          paymentStatus: response?.data?.payment?.status
        });

        console.log('💳 [Polling] Full payment object:', JSON.stringify(response?.data?.payment, null, 2));
        console.log('📋 [Polling] Order number:', response?.data?.orderNumber);
        console.log('🎯 [Polling] Looking for status: "hold"');
        console.log('✅ [Polling] Current status:', response?.data?.payment?.status);

        if (response?.data?.payment?.status === 'hold') {
          console.log('🎉 [Polling] SUCCESS! Payment status is HOLD!');
          console.log('✨ [Polling] Triggering onSuccess callback...');
          setStatus('success');
          onSuccess?.(response.data);
          clearInterval(pollInterval);
        } else {
          console.log('⏳ [Polling] Still waiting... (status is not "hold")');
        }
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      } catch (err) {
        console.error('❌ [Polling] Error occurred:', err);
        console.error('📋 [Polling] Error details:', {
          message: err.message,
          stack: err.stack
        });
      }
    }, 3000); // בדוק כל 3 שניות

    return () => {
      console.log('🛑 [Polling] Stopped polling for order:', orderId);
      clearInterval(pollInterval);
    };
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
            <p className="font-semibold text-blue-900 mb-2">💳 איך זה עובד?</p>
            <div className="text-blue-800 font-light leading-relaxed text-sm space-y-1">
              <p>✓ תופסים מסגרת בכרטיס שלך</p>
              <p>✓ מוודאים זמינות מוצרים</p>
              <p>✓ גובים את הסכום המדויק</p>
            </div>
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
        <>
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

          {/* DEV ONLY - Manual Callback Simulator */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-yellow-900 mb-2">🔧 מצב פיתוח - סימולציית Callback</p>
                  <p className="text-yellow-800 text-sm mb-3">
                    אחרי שתסיים לשלם ב-HyPay, העתק את כל הפרמטרים שהוא מחזיר והדבק אותם כאן:
                  </p>
                  <textarea
                    id="callback-params"
                    className="w-full p-2 border border-yellow-300 rounded text-sm font-mono h-32 mb-3"
                    placeholder="הדבק כאן את הפרמטרים מ-HyPay, לדוגמה:&#10;Id=372190517&CCode=700&Amount=209&ACode=0070135&Order=ORD-xxx&..."
                  />
                  <button
                    onClick={async () => {
                      const rawParams = document.getElementById('callback-params').value.trim();
                      if (!rawParams) {
                        alert('אנא הדבק את הפרמטרים מ-HyPay');
                        return;
                      }

                      try {
                        // המר את הפורמט של HyPay לפורמט URL
                        // מ: "Id : 372194936\nCCode : 700\nAmount : 448"
                        // ל: "Id=372194936&CCode=700&Amount=448"

                        const paramsObj = {};
                        rawParams
                          .split('\n')  // פצל לשורות
                          .map(line => line.trim())  // נקה רווחים
                          .filter(line => line.length > 0 && line.includes(':'))  // רק שורות עם ':'
                          .forEach(line => {
                            const [key, ...valueParts] = line.split(':');
                            const value = valueParts.join(':').trim();  // חיבור חזרה במקרה שיש ':' בערך
                            paramsObj[key.trim()] = value;
                          });

                        // בדוק האם זה success או error לפי CCode
                        const ccode = paramsObj.CCode || paramsObj.ccode || '';
                        const isSuccess = ccode === '0' || ccode === '700' || ccode === '800';
                        const endpoint = isSuccess ? 'success' : 'error';

                        // המר לפורמט URL
                        const urlParams = Object.entries(paramsObj)
                          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
                          .join('&');

                        console.log('📤 Sending callback:', {
                          endpoint,
                          ccode,
                          isSuccess,
                          params: urlParams.substring(0, 100) + '...'
                        });

                        // שלח את הפרמטרים ל-callback endpoint המתאים
                        const response = await fetch(`http://localhost:5000/api/payments/callback/${endpoint}?${urlParams}`);

                        if (response.ok) {
                          alert('✅ Callback נשלח בהצלחה! הפולינג יזהה את השינוי בעוד מספר שניות...');
                        } else {
                          const text = await response.text();
                          alert(`❌ שגיאה: ${text}`);
                        }
                      } catch (err) {
                        alert(`❌ שגיאה בשליחת Callback: ${err.message}`);
                      }
                    }}
                    className="w-full py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 font-medium"
                  >
                    📤 שלח Callback לשרת
                  </button>
                  <p className="text-xs text-yellow-700 mt-2">
                    💡 זה ידמה את ה-callback של HyPay ויעדכן את ההזמנה במסד הנתונים
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
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
