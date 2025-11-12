'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';

export default function CategoryCarouselClient({ categories, language = 'he', className = '' }) {
  const scrollContainerRef = useRef(null);

  // Enable smooth scrolling with mouse wheel
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <div className={`w-full py-6 bg-white ${className}`}>
      {/* Scrollable Container - GUESS Style */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-auto px-4 md:px-8 scrollbar-hide"
        style={{
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {categories.map((category) => (
          <CategoryPill
            key={category._id}
            category={category}
            language={language}
          />
        ))}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

// Category Pill Component - Text Only (GUESS Style)
function CategoryPill({ category, language }) {
  const name = category.name?.[language] || category.name?.he || category.name || '';
  const href = category.slug === 'products' ? '/products' : `/categories/${category.slug || category._id}`;

  return (
    <Link href={href}>
      <div
        className="flex-shrink-0 px-6 py-3 border-2 border-black rounded-full cursor-pointer hover:bg-black hover:text-white transition-all duration-300 group whitespace-nowrap"
      >
        <span
          className="text-sm md:text-base font-medium uppercase tracking-wide"
          dir={language === 'he' ? 'rtl' : 'ltr'}
          style={{ letterSpacing: '0.05em' }}
        >
          {name}
        </span>
      </div>
    </Link>
  );
}
