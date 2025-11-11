'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

export default function GoogleConsentModal({ isOpen, onClose, onAccept }) {
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleAccept = () => {
    if (agreedToTerms) {
      onAccept();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white max-w-md w-full border border-neutral-200">
        {/* Header */}
        <div className="relative border-b border-neutral-200 p-4">
          <button
            onClick={onClose}
            className="absolute left-3 top-4 text-neutral-400 hover:text-black transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <h2 className="text-lg font-light tracking-wide text-center">
            התחברות עם Google
          </h2>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <p className="text-sm font-light text-center text-neutral-600">
            נאסוף שם מלא, אימייל ותמונת פרופיל מחשבון Google שלך
          </p>

          {/* Consent Checkbox */}
          <label
            htmlFor="consent"
            className={`flex items-start gap-3 p-3 border-2 cursor-pointer transition-all ${
              agreedToTerms
                ? 'border-black bg-neutral-50'
                : 'border-neutral-200 hover:border-neutral-300'
            }`}
          >
            <input
              type="checkbox"
              id="consent"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 border-neutral-300 cursor-pointer"
            />
            <span className="text-xs font-light flex-1">
              אני מסכים/ה ל
              <Link href="/terms" target="_blank" className="text-black hover:opacity-70 transition-opacity mx-1 underline">
                תנאי השימוש
              </Link>
              ול
              <Link href="/privacy" target="_blank" className="text-black hover:opacity-70 transition-opacity mx-1 underline">
                מדיניות הפרטיות
              </Link>
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-5 pb-5">
          <button
            onClick={handleAccept}
            disabled={!agreedToTerms}
            className={`flex-1 py-2.5 px-4 text-sm font-light tracking-wide transition-colors ${
              agreedToTerms
                ? 'bg-black text-white hover:bg-neutral-800'
                : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
            }`}
          >
            אישור והמשך
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-neutral-200 text-black text-sm font-light tracking-wide hover:bg-neutral-50 transition-colors"
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}
