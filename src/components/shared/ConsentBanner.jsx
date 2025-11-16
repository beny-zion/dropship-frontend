'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Link from 'next/link';

export default function ConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem('privacy-consent');
    if (!hasConsented) {
      // Show banner after a short delay
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('privacy-consent', 'true');
    localStorage.setItem('privacy-consent-date', new Date().toISOString());
    setIsVisible(false);
  };

  const handleDecline = () => {
    // If user declines, we still set a flag so they're not bothered repeatedly
    // But we mark it as declined
    localStorage.setItem('privacy-consent', 'declined');
    localStorage.setItem('privacy-consent-date', new Date().toISOString());
    setIsVisible(false);

    // Optionally, you could redirect them or show a message
    alert('אם אינך מסכים למדיניות הפרטיות, חלק מהשירותים באתר לא יהיו זמינים.');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black text-white border-t border-neutral-800 shadow-2xl animate-in slide-in-from-bottom duration-500">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Content */}
          <div className="flex-1 max-w-3xl">
            <h3 className="text-sm font-light tracking-widest uppercase text-neutral-400 mb-3">
              פרטיות ושימוש במידע
            </h3>
            <p className="text-sm font-light leading-relaxed text-neutral-300">
              אנו משתמשים ב-Cookies מאובטחים לשמירת מידע התחברות וב-localStorage לשיפור חוויית המשתמש שלך.
              המידע נשמר במכשיר שלך בלבד ואינו משותף עם צדדים שלישיים. המשך השימוש באתר מהווה הסכמה ל
              <Link href="/privacy" className="text-white underline underline-offset-4 hover:text-neutral-400 transition-colors mx-1">
                מדיניות הפרטיות
              </Link>
              ול
              <Link href="/terms" className="text-white underline underline-offset-4 hover:text-neutral-400 transition-colors mx-1">
                תנאי השימוש
              </Link>
              שלנו.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleDecline}
              className="px-6 py-3 border border-neutral-700 text-white text-sm font-light tracking-wide hover:bg-neutral-900 transition-colors"
            >
              לא מסכים
            </button>
            <button
              onClick={handleAccept}
              className="px-6 py-3 bg-white text-black text-sm font-light tracking-wide hover:bg-neutral-100 transition-colors"
            >
              מסכים ומאשר
            </button>
          </div>

          {/* Close button */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-3 left-3 md:relative md:top-0 md:left-0 p-2 hover:bg-neutral-900 transition-colors"
            aria-label="סגור"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Additional info */}
        <details className="mt-6 border-t border-neutral-800 pt-4">
          <summary className="text-xs font-light tracking-wide text-neutral-500 cursor-pointer hover:text-neutral-400 transition-colors">
            מה בדיוק אנחנו שומרים? (לחץ לפרטים)
          </summary>
          <div className="mt-4 space-y-3 text-xs font-light text-neutral-400">
            <div>
              <p className="text-neutral-300 font-normal mb-2">Cookies מאובטחים (HttpOnly):</p>
              <p className="mr-4">• <strong className="text-neutral-300 font-normal">auth-token</strong> - מזהה התחברות מאובטח (JWT) לשמירת הסשן שלך</p>
            </div>
            <div>
              <p className="text-neutral-300 font-normal mb-2">localStorage:</p>
              <p className="mr-4">• <strong className="text-neutral-300 font-normal">privacy-consent</strong> - סימון שאישרת את מדיניות הפרטיות</p>
              <p className="mr-4">• <strong className="text-neutral-300 font-normal">privacy-consent-date</strong> - תאריך ההסכמה למדיניות</p>
            </div>
            <p className="mt-3 text-neutral-500">
              כל המידע הזה נשמר במכשיר שלך בלבד ואינו נשלח לשרתים חיצוניים.
              תוכל למחוק אותו בכל עת דרך הגדרות הדפדפן או על ידי התנתקות מהאתר.
            </p>
          </div>
        </details>
      </div>
    </div>
  );
}
