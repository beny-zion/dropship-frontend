'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Copy Button Component
 * כפתור להעתקת טקסט עם אנימציה
 */
export function CopyButton({ text, label, className = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(`${label || 'הועתק'} בהצלחה`);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      toast.error('שגיאה בהעתקה');
      console.error('Copy failed:', error);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded hover:bg-gray-100 transition-colors ${className}`}
      title={`העתק ${label || 'טקסט'}`}
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-green-600" />
      ) : (
        <Copy className="w-3.5 h-3.5 text-gray-500" />
      )}
    </button>
  );
}

/**
 * Copyable Text Component
 * טקסט עם כפתור העתקה מובנה
 */
export function CopyableText({ text, label, displayText, className = '', mono = false }) {
  return (
    <div className={`inline-flex items-center gap-1 bg-gray-50 border border-gray-200 rounded px-2 py-1 ${className}`}>
      <span className={mono ? 'font-mono text-xs' : 'text-xs'}>
        {displayText || text}
      </span>
      <CopyButton text={text} label={label} />
    </div>
  );
}

export default CopyButton;
