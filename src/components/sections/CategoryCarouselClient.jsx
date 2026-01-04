'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CategoryCarouselClient({ categories, language = 'he', className = '' }) {
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Check if arrows should be visible
  const updateArrowsVisibility = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    updateArrowsVisibility();
    window.addEventListener('resize', updateArrowsVisibility);
    return () => window.removeEventListener('resize', updateArrowsVisibility);
  }, [categories]);

  // Enable smooth scrolling with mouse wheel
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
        updateArrowsVisibility();
      }
    };

    const handleScroll = () => {
      updateArrowsVisibility();
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        scrollRight();
      } else if (e.key === 'ArrowLeft') {
        scrollLeft();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Touch gesture handlers
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      scrollRight();
    } else if (isRightSwipe) {
      scrollLeft();
    }
  };

  // Scroll functions
  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <div className={`w-full py-6 bg-white ${className} relative group`}>
      {/* חיצי ניווט */}
      {showLeftArrow && (
        <button
          onClick={scrollLeft}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 md:p-3 transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
          aria-label="גלילה ימינה"
        >
          <ChevronRight className="h-5 w-5 md:h-6 md:w-6 text-black" />
        </button>
      )}

      {showRightArrow && (
        <button
          onClick={scrollRight}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 md:p-3 transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
          aria-label="גלילה שמאלה"
        >
          <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 text-black" />
        </button>
      )}

      {/* Scrollable Container - GUESS Style */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-auto px-4 md:px-8 scrollbar-hide"
        style={{
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
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
