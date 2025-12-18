'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Lock, Shield, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

export function PaymentForm({ onPaymentDetailsChange, totalAmount = 0 }) {
  const [details, setDetails] = useState({
    cardNumber: '',
    expMonth: '',
    expYear: '',
    cvv: '',
    userId: ''
  });

  const handleChange = (field, value) => {
    const newDetails = { ...details, [field]: value };
    setDetails(newDetails);
    onPaymentDetailsChange?.(newDetails);
  };

  const formatCardNumber = (value) => {
    // הסר כל דבר שאינו ספרה
    const cleaned = value.replace(/\D/g, '');
    // הוסף רווחים כל 4 ספרות
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.slice(0, 19); // מקסימום 16 ספרות + 3 רווחים
  };

  return (
    <div className="space-y-6 border-2 border-blue-100 p-6 bg-gradient-to-br from-white to-blue-50/30 shadow-lg">
      {/* Hyp Pay Logo - Prominent Header */}
      <div className="flex flex-col items-center justify-center py-4 bg-white border-2 border-blue-200 shadow-md -mx-6 -mt-6 mb-4">
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
          <span className="font-medium">ספק תשלומים מאושר ומוסדר</span>
          <span className="w-1 h-1 bg-neutral-400 rounded-full"></span>
          <Lock className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-medium">הצפנת SSL 256-bit</span>
        </div>
      </div>

      {/* Header with Security */}
      <div className="flex items-center gap-3 pb-4 border-b border-blue-100">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
          <Lock className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg tracking-wide text-neutral-900">תשלום מאובטח</h3>
          <p className="text-xs text-neutral-600">
            פרטי האשראי שלך מוגנים ב-100%
          </p>
        </div>
      </div>

      {/* Security Badges */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex items-center gap-2 bg-white p-3 border border-green-200 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
          <span className="text-xs font-medium text-green-900">PCI DSS</span>
        </div>
        <div className="flex items-center gap-2 bg-white p-3 border border-blue-200 shadow-sm">
          <Shield className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span className="text-xs font-medium text-blue-900">SSL מוצפן</span>
        </div>
        <div className="flex items-center gap-2 bg-white p-3 border border-purple-200 shadow-sm">
          <Lock className="w-4 h-4 text-purple-600 flex-shrink-0" />
          <span className="text-xs font-medium text-purple-900">3D Secure</span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 p-4 text-sm">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-900 mb-1">💳 איך זה עובד?</p>
            <p className="text-blue-800 font-light leading-relaxed">
              <strong>שלב 1:</strong> נתפוס מסגרת של <strong className="text-blue-900">₪{totalAmount.toFixed(0)}</strong> בכרטיס שלך<br/>
              <strong>שלב 2:</strong> נזמין את המוצרים מהספק (1-3 ימים)<br/>
              <strong>שלב 3:</strong> רק אז נבצע את החיוב הסופי
            </p>
            <p className="text-xs text-blue-700 mt-2 font-medium">
              ✅ לא נגבה ממך כסף עד שהמוצרים יוזמנו בפועל
            </p>
          </div>
        </div>
      </div>

      {/* Credit Card Logos */}
      <div className="flex items-center justify-center gap-3 py-3 bg-white border border-neutral-200 shadow-sm">
        <span className="text-xs text-neutral-600 font-light">כרטיסים מקובלים:</span>
        <div className="flex items-center gap-3">
          {/* Visa */}
          <Image
            src="/visa-svgrepo-com.svg"
            alt="Visa"
            width={40}
            height={28}
            className="object-contain"
          />
          {/* Mastercard */}
          <Image
            src="/mastercard-svgrepo-com.svg"
            alt="Mastercard"
            width={40}
            height={28}
            className="object-contain"
          />
          {/* Israeli Card */}
          <Image
            src="/Isracard_2020_Logo.svg.png"
            alt="ישראכרט"
            width={40}
            height={28}
            className="object-contain"
          />
          {/* Cal */}
          <Image
            src="/Cal_logo_2019.svg.png"
            alt="Cal"
            width={40}
            height={28}
            className="object-contain"
          />
        </div>
      </div>

      <div className="relative">
        <Label htmlFor="cardNumber" className="text-sm font-medium text-neutral-700">מספר כרטיס אשראי *</Label>
        <div className="relative">
          <Input
            id="cardNumber"
            type="text"
            placeholder="0000 0000 0000 0000"
            value={details.cardNumber}
            onChange={(e) => handleChange('cardNumber', formatCardNumber(e.target.value))}
            maxLength={19}
            dir="ltr"
            className="text-center font-mono text-lg pr-12 h-12 border-2 border-neutral-300 focus:border-blue-500 transition-colors"
          />
          <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="expMonth" className="text-sm font-medium text-neutral-700">חודש *</Label>
          <Input
            id="expMonth"
            type="text"
            placeholder="12"
            value={details.expMonth}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 2);
              handleChange('expMonth', value);
            }}
            maxLength={2}
            dir="ltr"
            className="text-center h-12 border-2 border-neutral-300 focus:border-blue-500 transition-colors font-mono text-lg"
          />
        </div>

        <div>
          <Label htmlFor="expYear" className="text-sm font-medium text-neutral-700">שנה *</Label>
          <Input
            id="expYear"
            type="text"
            placeholder="25"
            value={details.expYear}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 2);
              handleChange('expYear', value);
            }}
            maxLength={2}
            dir="ltr"
            className="text-center h-12 border-2 border-neutral-300 focus:border-blue-500 transition-colors font-mono text-lg"
          />
        </div>

        <div className="relative">
          <Label htmlFor="cvv" className="text-sm font-medium text-neutral-700 flex items-center gap-1">
            CVV *
            <span className="text-xs text-neutral-500">(3 ספרות)</span>
          </Label>
          <Input
            id="cvv"
            type="text"
            placeholder="123"
            value={details.cvv}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 3);
              handleChange('cvv', value);
            }}
            maxLength={3}
            dir="ltr"
            className="text-center h-12 border-2 border-neutral-300 focus:border-blue-500 transition-colors font-mono text-lg"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="userId" className="text-sm font-medium text-neutral-700">תעודת זהות *</Label>
        <Input
          id="userId"
          type="text"
          placeholder="123456789"
          value={details.userId}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '').slice(0, 9);
            handleChange('userId', value);
          }}
          maxLength={9}
          dir="ltr"
          className="text-center h-12 border-2 border-neutral-300 focus:border-blue-500 transition-colors font-mono text-lg"
        />
      </div>

      {/* Test Mode Notice */}
      {process.env.NEXT_PUBLIC_HYP_TEST_MODE === 'true' && (
        <div className="bg-yellow-50 border-2 border-yellow-300 p-4 text-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-lg">🧪</span>
            </div>
            <div>
              <p className="font-semibold text-yellow-900">מצב בדיקה (Sandbox)</p>
              <p className="mt-1 text-yellow-800 font-light">
                כרטיס בדיקה: <code className="bg-yellow-100 px-2 py-1 font-mono">5326105300985614</code><br/>
                תוקף: <code className="bg-yellow-100 px-2 py-1 font-mono">12/25</code> |
                CVV: <code className="bg-yellow-100 px-2 py-1 font-mono">125</code>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Security Footer */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-green-900 mb-2 flex items-center gap-2">
              🔒 פרטי התשלום שלך מוגנים ב-100%
            </p>
            <ul className="text-xs text-green-800 space-y-1 font-light">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-green-600" />
                כל הפרטים מוצפנים בהצפנת SSL 256-bit
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-green-600" />
                אנחנו לא שומרים את מספר הכרטיס המלא במערכות שלנו
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-green-600" />
                התשלום מעובד ישירות דרך Hyp Pay - ספק תשלומים מאושר
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-green-600" />
                עומדים בכל תקני האבטחה הבינלאומיים (PCI DSS Level 1)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
