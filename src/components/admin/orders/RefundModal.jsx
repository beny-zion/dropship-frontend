'use client';

import { useState, useEffect } from 'react';
import { canRefund, createRefund } from '@/lib/api/refunds';

export default function RefundModal({ orderId, isOpen, onClose, onRefundComplete }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Refund capability data
  const [refundData, setRefundData] = useState(null);

  // Form state
  const [selectedItems, setSelectedItems] = useState([]);
  const [reason, setReason] = useState('');
  const [customAmount, setCustomAmount] = useState('');

  // Card details (customer provides over phone)
  const [cardNumber, setCardNumber] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [holderId, setHolderId] = useState('');

  // Load refund capability on open
  useEffect(() => {
    if (isOpen && orderId) {
      loadRefundData();
    }
  }, [isOpen, orderId]);

  // Set default amount when refund data loads
  useEffect(() => {
    if (refundData?.maxRefundable && !customAmount) {
      setCustomAmount(refundData.maxRefundable.toString());
    }
  }, [refundData]);

  const loadRefundData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await canRefund(orderId);

      let data;
      if (response?.success && response?.data) {
        data = response.data;
      } else if (response?.data?.success && response?.data?.data) {
        data = response.data.data;
      } else if (response?.canRefund !== undefined) {
        data = response;
      } else {
        data = response?.data || response;
      }

      if (data?.canRefund) {
        setRefundData(data);
        if (data.refundableItems && data.refundableItems.length > 0) {
          setSelectedItems(data.refundableItems.map(item => item.id));
        }
      } else {
        setRefundData(data);
        if (!data?.canRefund) {
          setError(data?.reason || 'לא ניתן לבצע החזר להזמנה זו');
        }
      }
    } catch (err) {
      console.error('Error loading refund data:', err);
      setError(err.message || 'שגיאה בטעינת נתוני החזר');
    } finally {
      setLoading(false);
    }
  };


  // Format card number with spaces
  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 16);
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reason.trim() || reason.trim().length < 3) {
      setError('יש להזין סיבה להחזר (לפחות 3 תווים)');
      return;
    }

    // Validate card details
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    if (!cleanCardNumber || cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
      setError('מספר כרטיס לא תקין');
      return;
    }

    if (!expMonth || !expYear) {
      setError('יש להזין תוקף כרטיס');
      return;
    }

    if (!cvv || cvv.length < 3) {
      setError('יש להזין CVV תקין');
      return;
    }

    if (!holderId || holderId.length < 5) {
      setError('יש להזין ת.ז. בעל הכרטיס');
      return;
    }

    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('יש להזין סכום תקין להחזר');
      return;
    }

    if (amount > refundData.maxRefundable) {
      setError(`הסכום לא יכול להיות גדול מ-${refundData.maxRefundable?.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })}`);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await createRefund(orderId, selectedItems, reason.trim(), amount, {
        cardNumber: cleanCardNumber,
        expMonth,
        expYear,
        cvv,
        holderId
      });

      if (response.success) {
        setSuccess(`החזר בסך ${response.data?.amount?.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })} בוצע בהצלחה!`);

        setTimeout(() => {
          if (onRefundComplete) {
            onRefundComplete(response.data);
          }
          onClose();
        }, 2000);
      } else {
        setError(response.error || 'שגיאה בביצוע ההחזר');
      }
    } catch (err) {
      console.error('Error creating refund:', err);
      setError(err.message || 'שגיאה בביצוע ההחזר');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedItems([]);
    setReason('');
    setCustomAmount('');
    setCardNumber('');
    setExpMonth('');
    setExpYear('');
    setCvv('');
    setHolderId('');
    setError(null);
    setSuccess(null);
    onClose();
  };

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
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">החזר כספי</h2>
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
          <div className="px-6 py-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : !refundData?.canRefund ? (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
                <p className="font-medium">לא ניתן לבצע החזר</p>
                <p className="text-sm mt-1">{refundData?.reason || 'אין פריטים זמינים להחזר'}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Error */}
                {error && (
                  <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                {/* Success */}
                {success && (
                  <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                    {success}
                  </div>
                )}

                {/* Summary */}
                <div className="mb-6 bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">סכום שנגבה:</span>
                      <span className="mr-2 font-medium">
                        {refundData.chargedAmount?.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">הוחזר עד כה:</span>
                      <span className="mr-2 font-medium">
                        {refundData.refundedAmount?.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">מקסימום להחזר:</span>
                      <span className="mr-2 font-semibold text-blue-600">
                        {refundData.maxRefundable?.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Refund Amount */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    סכום להחזר <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    min="0"
                    max={refundData.maxRefundable}
                    step="0.01"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="הזן סכום להחזר"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    מקסימום: {refundData.maxRefundable?.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })}
                  </p>
                </div>

                {/* Card Details - Customer provides over phone */}
                <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-medium text-orange-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    פרטי כרטיס אשראי (הלקוח מקריא בטלפון)
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Card Number */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        מספר כרטיס <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        placeholder="0000 0000 0000 0000"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 font-mono"
                        dir="ltr"
                        maxLength={19}
                      />
                    </div>

                    {/* Expiry */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        תוקף <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2" dir="ltr">
                        <input
                          type="text"
                          value={expMonth}
                          onChange={(e) => setExpMonth(e.target.value.replace(/\D/g, '').slice(0, 2))}
                          placeholder="MM"
                          className="w-16 border border-gray-300 rounded-md px-3 py-2 text-sm text-center focus:ring-blue-500 focus:border-blue-500 font-mono"
                          maxLength={2}
                        />
                        <span className="text-gray-500 self-center">/</span>
                        <input
                          type="text"
                          value={expYear}
                          onChange={(e) => setExpYear(e.target.value.replace(/\D/g, '').slice(0, 2))}
                          placeholder="YY"
                          className="w-16 border border-gray-300 rounded-md px-3 py-2 text-sm text-center focus:ring-blue-500 focus:border-blue-500 font-mono"
                          maxLength={2}
                        />
                      </div>
                    </div>

                    {/* CVV */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="000"
                        className="w-24 border border-gray-300 rounded-md px-3 py-2 text-sm text-center focus:ring-blue-500 focus:border-blue-500 font-mono"
                        dir="ltr"
                        maxLength={4}
                      />
                    </div>

                    {/* Holder ID */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ת.ז. בעל הכרטיס <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={holderId}
                        onChange={(e) => setHolderId(e.target.value.replace(/\D/g, '').slice(0, 9))}
                        placeholder="123456789"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 font-mono"
                        dir="ltr"
                        maxLength={9}
                      />
                    </div>
                  </div>
                </div>

                {/* Reason */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    סיבת ההחזר <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={2}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="הזן את סיבת ההחזר..."
                    required
                    minLength={3}
                  />
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
                    disabled={submitting || success}
                    className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submitting && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    {submitting ? 'מבצע החזר...' : 'בצע החזר'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
