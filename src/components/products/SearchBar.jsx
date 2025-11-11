'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({ onSearch, initialValue = '' }) {
  const [query, setQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-3xl mx-auto">
      <div className={`relative flex items-center border-b-2 transition-all duration-300 ${
        isFocused ? 'border-black' : 'border-neutral-300'
      }`}>
        {/* Search Icon */}
        <Search className="absolute right-0 h-5 w-5 md:h-6 md:w-6 text-neutral-400" />

        {/* Input Field */}
        <input
          type="text"
          placeholder="חפש מוצרים, מותגים או קטגוריות..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full py-3 md:py-4 pr-10 md:pr-12 pl-10 md:pl-12 bg-transparent text-neutral-900 placeholder:text-neutral-400 placeholder:font-light focus:outline-none text-sm md:text-base tracking-wide"
          dir="rtl"
        />

        {/* Clear Button */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute left-0 p-1 text-neutral-400 hover:text-black transition-colors"
            aria-label="נקה חיפוש"
          >
            <X className="h-5 w-5 md:h-6 md:w-6" />
          </button>
        )}
      </div>

      {/* Optional: Search suggestions or popular searches could go here */}
      {isFocused && query.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 p-4 md:p-6 bg-white border border-neutral-200 shadow-xl z-50 rounded-lg">
          <p className="text-xs md:text-sm text-neutral-500 font-light tracking-wide mb-3">חיפושים פופולריים:</p>
          <div className="flex flex-wrap gap-2">
            {['חולצות', 'מכנסיים', 'נעליים', 'תיקים', 'אביזרים', 'מעילים'].map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  setQuery(term);
                  onSearch(term);
                }}
                className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm border border-neutral-300 hover:border-black hover:bg-black hover:text-white transition-all duration-200 tracking-wide rounded-full"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}