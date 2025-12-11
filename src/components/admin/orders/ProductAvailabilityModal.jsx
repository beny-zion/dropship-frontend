'use client';

import { useEffect, useRef } from 'react';
import { X, AlertTriangle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProductAvailabilityModal({ isOpen, onClose, item, onConfirm }) {
  const modalContainerRef = useRef(null);

  // גלילה למעלה כשהמודל נפתח
  useEffect(() => {
    if (isOpen && modalContainerRef.current) {
      modalContainerRef.current.scrollTop = 0;
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [isOpen]);

  if (!isOpen || !item) return null;

  return (
    <div ref={modalContainerRef} className="fixed inset-0 bg-black/60 z-[60] overflow-y-auto">
      <div className="min-h-screen flex items-start justify-center p-4 py-8">
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900">מוצר לא זמין</h3>
                <p className="text-sm text-neutral-600 mt-1">
                  המוצר לא זמין באתר הספק
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Product Details */}
          <div className="bg-neutral-50 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              {item.image && (
                <img
                  src={item.image}
                  alt={item.itemName}
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-neutral-900 line-clamp-2">
                  {item.itemName}
                </h4>

                {/* Variant Details */}
                {item.variantDetails && (item.variantDetails.color || item.variantDetails.size) && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.variantDetails.color && (
                      <span className="text-xs bg-white border border-neutral-200 px-2 py-1 rounded">
                        צבע: <strong>{item.variantDetails.color}</strong>
                      </span>
                    )}
                    {item.variantDetails.size && (
                      <span className="text-xs bg-white border border-neutral-200 px-2 py-1 rounded">
                        מידה: <strong>{item.variantDetails.size}</strong>
                      </span>
                    )}
                  </div>
                )}

                {item.variantDetails?.sku && (
                  <p className="text-xs text-neutral-500 mt-1">
                    SKU: {item.variantDetails.sku}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <h5 className="font-medium text-yellow-900 mb-2">מה יקרה אם תאשר?</h5>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">•</span>
                <span>הווריאנט/מוצר יסומן כלא זמין במערכת</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">•</span>
                <span>הפריט בהזמנה זו יבוטל</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">•</span>
                <span>המוצר יוסתר מהאתר ללקוחות חדשים</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">•</span>
                <span>הלקוח יקבל עדכון (כשמערכת האימיילים תהיה פעילה)</span>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div className="flex items-start gap-2 text-sm text-neutral-600">
            <Package className="w-4 h-4 mt-0.5 text-neutral-400" />
            <p>
              אם המוצר יחזור למלאי בעתיד, תוכל לעדכן זאת ידנית בעמוד ניהול המוצרים
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-neutral-200 bg-neutral-50">
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              לא, המשך
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              כן, סמן כלא זמין
            </Button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
