'use client';

import { useState } from 'react';
import { useCategories } from '@/lib/hooks/useCategories';
import { motion } from 'framer-motion';
import { Filter, X } from 'lucide-react';

export default function CategoryFilter({ selectedCategory, onCategoryChange }) {
  const { categories, loading } = useCategories(true); // Only active categories
  const [isOpen, setIsOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-10 w-24 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
        ))}
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  const allCategories = [
    { _id: 'all', name: { he: 'הכל' }, slug: 'all' },
    ...categories
  ];

  return (
    <div className="w-full">
      {/* Desktop Filter - Horizontal Scrollable */}
      <div className="hidden md:flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {allCategories.map((category) => {
          const isSelected = selectedCategory === category._id || (selectedCategory === 'all' && category._id === 'all');

          return (
            <motion.button
              key={category._id}
              onClick={() => onCategoryChange(category._id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                backgroundColor: isSelected && category.styling?.backgroundColor
                  ? category.styling.backgroundColor
                  : isSelected
                  ? '#2563eb'
                  : '#ffffff',
                color: isSelected && category.styling?.textColor
                  ? category.styling.textColor
                  : isSelected
                  ? '#ffffff'
                  : '#374151',
                borderColor: isSelected
                  ? 'transparent'
                  : '#e5e7eb'
              }}
              className={`
                px-6 py-2.5 rounded-full font-medium text-sm
                border-2 transition-all duration-200 flex-shrink-0
                ${isSelected ? 'shadow-lg' : 'shadow-sm hover:shadow-md'}
              `}
            >
              {category.name.he}
            </motion.button>
          );
        })}
      </div>

      {/* Mobile Filter - Dropdown */}
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border-2 border-gray-200 rounded-lg shadow-sm"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">
              {allCategories.find(c => c._id === selectedCategory)?.name.he || 'בחר קטגוריה'}
            </span>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </button>

        {/* Mobile Dropdown Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 mt-2 w-full bg-white border-2 border-gray-200 rounded-lg shadow-xl overflow-hidden"
          >
            {allCategories.map((category) => {
              const isSelected = selectedCategory === category._id;

              return (
                <button
                  key={category._id}
                  onClick={() => {
                    onCategoryChange(category._id);
                    setIsOpen(false);
                  }}
                  style={{
                    backgroundColor: isSelected && category.styling?.backgroundColor
                      ? category.styling.backgroundColor
                      : isSelected
                      ? '#eff6ff'
                      : '#ffffff',
                    color: isSelected && category.styling?.textColor
                      ? category.styling.textColor
                      : '#374151'
                  }}
                  className={`
                    w-full px-4 py-3 text-right font-medium transition-colors
                    ${!isSelected && 'hover:bg-gray-50'}
                    ${isSelected && 'font-bold'}
                    border-b border-gray-100 last:border-b-0
                  `}
                >
                  {category.name.he}
                  {isSelected && (
                    <span className="mr-2">✓</span>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Clear Filter Button - Only show if a category is selected */}
      {selectedCategory && selectedCategory !== 'all' && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => onCategoryChange('all')}
          className="mt-3 flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
          נקה סינון
        </motion.button>
      )}
    </div>
  );
}
