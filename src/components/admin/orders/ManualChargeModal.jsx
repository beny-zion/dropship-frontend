'use client';

import { useState } from 'react';
import { manualCharge } from '@/lib/api/refunds';

export default function ManualChargeModal({ order, isOpen, onClose, onChargeComplete }) {
  const [chargeMode, setChargeMode] = useState('existing'); // 'existing' or 'new_card'
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Card details for new card mode
  const [cardNumber, setCardNumber] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [holderId, setHolderId] = useState('');
  const [customerName, setCustomerName] = useState('');

  // Calculate suggested amount
  const suggestedAmount = order?.pricing?.total || 0;
  const alreadyCharged = order?.payment?.chargedAmount || 0;
  const remainingToCharge = Math.max(0, suggestedAmount - alreadyCharged);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const chargeAmount = parseFloat(amount);
    if (isNaN(chargeAmount) || chargeAmount <= 0) {
      setError('יש להזין סכום תקין');
      return;
    }

    if (!reason.trim()) {
      setError('יש להזין סיבה לגביה');
      return;
    }

    // Validate card details if in new_card mode
    if (chargeMode === 'new_card') {
      if (!cardNumber || !expMonth || !expYear || !cvv || !holderId) {
        setError('יש למלא את כל פרטי הכרטיס');
        return;
      }

      if (cardNumber.replace(/\s/g, '').length < 13) {
        setError('מספר כרטיס לא תקין');
        return;
      }

      if (expMonth.length !== 2 || parseInt(expMonth) < 1 || parseInt(expMonth) > 12) {
        setError('חודש תוקף לא תקין (01-12)');
        return;
      }

      if (expYear.length !== 2 && expYear.length !== 4) {
        setError('שנת תוקף לא תקינה');
        return;
      }

      if (cvv.length < 3) {
        setError('CVV לא תקין');
        return;
      }

      if (holderId.length !== 9) {
        setError('ת.ז. חייבת להכיל 9 ספרות');
        return;
      }
    }

    try {
      setSubmitting(true);
      setError(null);

      // Prepare card details for new_card mode
      const cardDetails = chargeMode === 'new_card' ? {
        cardNumber: cardNumber.replace(/\s/g, ''),
        expMonth,
        expYear: expYear.length === 2 ? expYear : expYear.slice(-2),
        cvv,
        holderId,
        customerName: customerName.trim() || 'לקוח'
      } : null;

      const response = await manualCharge(order._id, chargeAmount, reason.trim(), cardDetails);

      if (response.success) {
        if (onChargeComplete) {
          onChargeComplete(response);
        }
        handleClose();
      } else {
        setError(response.error || 'שגיאה בביצוע הגביה');
      }
    } catch (err) {
      console.error('Manual charge error:', err);
      setError(err.response?.data?.error || err.message || 'שגיאה בביצוע הגביה');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setChargeMode('existing');
    setAmount('');
    setReason('');
    setCardNumber('');
    setExpMonth('');
    setExpYear('');
    setCvv('');
    setHolderId('');
    setCustomerName('');
    setError(null);
    onClose();
  };

  // Check if order has existing payment data
  const hasExistingPayment = order?.payment?.hypToken || order?.payment?.hypTransactionId;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" dir="rtl">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">גביה מידית</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="px-6 py-4">
            {/* Error */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Mode Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                שיטת גבייה <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {hasExistingPayment && (
                  <button
                    type="button"
                    onClick={() => setChargeMode('existing')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      chargeMode === 'existing'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-sm">מסגרת קיימת</div>
                    <div className="text-xs text-gray-500 mt-1">גביה מהזמנה נוכחית</div>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setChargeMode('new_card')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    chargeMode === 'new_card'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${!hasExistingPayment ? 'col-span-2' : ''}`}
                >
                  <div className="font-medium text-sm">כרטיס חדש</div>
                  <div className="text-xs text-gray-500 mt-1">הכנס פרטי כרטיס מהלקוח</div>
                </button>
              </div>
            </div>

            {/* Order Info */}
            <div className="mb-6 bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">סה"כ הזמנה:</span>
                  <span className="mr-2 font-medium">
                    {suggestedAmount.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">נגבה עד כה:</span>
                  <span className="mr-2 font-medium">
                    {alreadyCharged.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })}
                  </span>
                </div>
                {remainingToCharge > 0 && (
                  <div className="col-span-2">
                    <span className="text-gray-500">נותר לגביה:</span>
                    <span className="mr-2 font-semibold text-blue-600">
                      {remainingToCharge.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })}
                    </span>
                  </div>
                )}
              </div>

              {/* Payment Status */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <span className="text-gray-500 text-sm">סטטוס תשלום: </span>
                <span className={`text-sm font-medium ${
                  order?.payment?.status === 'charged' ? 'text-green-600' :
                  order?.payment?.status === 'failed' ? 'text-red-600' :
                  order?.payment?.status === 'hold' ? 'text-blue-600' :
                  'text-gray-600'
                }`}>
                  {order?.payment?.status === 'charged' && 'נגבה'}
                  {order?.payment?.status === 'failed' && 'נכשל'}
                  {order?.payment?.status === 'hold' && 'מסגרת תפוסה'}
                  {order?.payment?.status === 'pending' && 'ממתין'}
                  {order?.payment?.status === 'ready_to_charge' && 'מוכן לגביה'}
                </span>
              </div>

              {/* Transaction ID */}
              {order?.payment?.hypTransactionId && (
                <div className="mt-2">
                  <span className="text-gray-500 text-xs">מזהה עסקה: </span>
                  <span className="text-xs font-mono">{order.payment.hypTransactionId}</span>
                </div>
              )}
            </div>

            {/* Amount Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                סכום לגביה <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  step="0.01"
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="הזן סכום"
                  required
                />
                {remainingToCharge > 0 && (
                  <button
                    type="button"
                    onClick={() => setAmount(remainingToCharge.toString())}
                    className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    מלא סכום
                  </button>
                )}
              </div>
            </div>

            {/* Reason Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                סיבה לגביה <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="למשל: גביה חוזרת לאחר כשל, גביה נוספת..."
                required
              />
            </div>

            {/* Card Details (only in new_card mode) */}
            {chargeMode === 'new_card' && (
              <div className="mb-6 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">פרטי כרטיס אשראי</h3>

                {/* Customer Name */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    שם בעל הכרטיס (אופציונלי)
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    placeholder="שם פרטי ושם משפחה"
                  />
                </div>

                {/* Card Number */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    מספר כרטיס <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    maxLength={19}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono"
                    placeholder="0000 0000 0000 0000"
                    required={chargeMode === 'new_card'}
                  />
                </div>

                {/* Expiry and CVV */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      חודש <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={expMonth}
                      onChange={(e) => setExpMonth(e.target.value.replace(/\D/g, '').slice(0, 2))}
                      maxLength={2}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono"
                      placeholder="MM"
                      required={chargeMode === 'new_card'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      שנה <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={expYear}
                      onChange={(e) => setExpYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      maxLength={4}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono"
                      placeholder="YY או YYYY"
                      required={chargeMode === 'new_card'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVV <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      maxLength={4}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono"
                      placeholder="123"
                      required={chargeMode === 'new_card'}
                    />
                  </div>
                </div>

                {/* Holder ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ת.ז. בעל הכרטיס <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={holderId}
                    onChange={(e) => setHolderId(e.target.value.replace(/\D/g, '').slice(0, 9))}
                    maxLength={9}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono"
                    placeholder="9 ספרות"
                    required={chargeMode === 'new_card'}
                  />
                </div>
              </div>
            )}

            {/* Warning */}
            <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded text-sm">
              <strong>שים לב:</strong> גביה מידית תחייב את כרטיס האשראי של הלקוח מיידית.
              וודא שהסכום נכון לפני אישור.
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                disabled={submitting}
              >
                ביטול
              </button>
              <button
                type="submit"
                disabled={
                  submitting ||
                  !amount ||
                  !reason.trim() ||
                  (chargeMode === 'new_card' && (!cardNumber || !expMonth || !expYear || !cvv || !holderId))
                }
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {submitting ? 'מבצע גביה...' : 'בצע גביה'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
