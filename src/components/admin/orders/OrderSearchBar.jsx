'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OrderSearchBar({ onSearch, isLoading }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 rounded-lg p-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="חפש לפי מספר הזמנה, שם לקוח או אימייל..."
            className="w-full pr-10 pl-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <Button
          type="submit"
          disabled={!searchTerm.trim() || isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          חפש
        </Button>
      </div>

      {searchTerm && (
        <div className="mt-2 text-sm text-neutral-600">
          מחפש: <span className="font-medium">{searchTerm}</span>
        </div>
      )}
    </form>
  );
}
