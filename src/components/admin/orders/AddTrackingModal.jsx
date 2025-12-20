'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const CARRIERS_INTERNATIONAL = [
  { value: 'regular', label: 'רגיל' },
  { value: 'other', label: 'אחר' }
];

const CARRIERS_ISRAEL = [
  { value: 'israel_post', label: 'דואר ישראל' },
  { value: 'cheetah', label: 'צ\'יטה' },
  { value: 'ups', label: 'UPS' },
  { value: 'fedex', label: 'FedEx' },
  { value: 'baldar', label: 'בלדר' },
  { value: 'other', label: 'אחר' }
];

/**
 * AddTrackingModal - Modal להוספת מספר מעקב לפריט
 *
 * @param {boolean} isOpen - האם המודל פתוח
 * @param {function} onClose - פונקציה לסגירת המודל
 * @param {string} orderId - מזהה ההזמנה
 * @param {string} itemId - מזהה הפריט
 * @param {string} type - סוג המעקב: 'israel' (בינלאומי) או 'customer' (ללקוח)
 * @param {function} onSuccess - Callback אחרי הוספה מוצלחת
 */
export function AddTrackingModal({ isOpen, onClose, orderId, itemId, type, onSuccess }) {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');
  const [customCarrierName, setCustomCarrierName] = useState('');
  const [estimatedDate, setEstimatedDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const carriers = type === 'israel' ? CARRIERS_INTERNATIONAL : CARRIERS_ISRAEL;
  const endpoint = type === 'israel'
    ? `/api/admin/orders/${orderId}/items/${itemId}/israel-tracking`
    : `/api/admin/orders/${orderId}/items/${itemId}/customer-tracking`;

  const title = type === 'israel'
    ? 'הוספת מספר מעקב בינלאומי'
    : 'הוספת מספר מעקב ללקוח';

  const dateLabel = type === 'israel'
    ? 'הגעה משוערת לישראל'
    : 'משלוח משוער ללקוח';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('לא נמצא טוקן אימות');
      }

      // קבע את שם החברה - אם "אחר" נבחר, השתמש בשם מותאם אישית
      const finalCarrier = carrier === 'other' ? customCarrierName.trim() : carrier;

      // Validation - אם בחרו "אחר" אבל לא הזינו שם
      if (carrier === 'other' && !customCarrierName.trim()) {
        throw new Error('נא להזין שם חברת שליחות');
      }

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          trackingNumber: trackingNumber.trim(),
          carrier: finalCarrier,
          [type === 'israel' ? 'estimatedArrival' : 'estimatedDelivery']: estimatedDate || null
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'שגיאה בהוספת מספר מעקב');
      }

      // Reset form
      setTrackingNumber('');
      setCarrier('');
      setCustomCarrierName('');
      setEstimatedDate('');

      // Call success callback
      if (onSuccess) {
        onSuccess(result);
      }

      onClose();

    } catch (err) {
      console.error('Error adding tracking:', err);
      setError(err.message || 'שגיאה בהוספת מספר מעקב');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setTrackingNumber('');
      setCarrier('');
      setCustomCarrierName('');
      setEstimatedDate('');
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent dir="rtl" className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Carrier Selection */}
          <div>
            <Label htmlFor="carrier">חברת שליחות *</Label>
            <select
              id="carrier"
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              required
              disabled={isSubmitting}
              className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              <option value="">בחר חברת שליחות...</option>
              {carriers.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Carrier Name (when "other" is selected) */}
          {carrier === 'other' && (
            <div>
              <Label htmlFor="customCarrierName">שם חברת השליחות *</Label>
              <Input
                id="customCarrierName"
                type="text"
                value={customCarrierName}
                onChange={(e) => setCustomCarrierName(e.target.value)}
                placeholder="למשל: DHL, FedEx..."
                required
                disabled={isSubmitting}
                className="mt-1"
              />
            </div>
          )}

          {/* Tracking Number */}
          <div>
            <Label htmlFor="trackingNumber">מספר מעקב *</Label>
            <Input
              id="trackingNumber"
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="1Z999AA10123456784"
              required
              disabled={isSubmitting}
              dir="ltr"
              className="mt-1"
            />
          </div>

          {/* Estimated Date */}
          <div>
            <Label htmlFor="estimatedDate">{dateLabel}</Label>
            <Input
              id="estimatedDate"
              type="date"
              value={estimatedDate}
              onChange={(e) => setEstimatedDate(e.target.value)}
              disabled={isSubmitting}
              className="mt-1"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              ביטול
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'שומר...' : 'שמור'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
