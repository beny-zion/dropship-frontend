'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function ProductCarousel({ section, language = 'he' }) {
  const { productCarousel } = section.content;
  // Use initialData from server if available, otherwise fetch on client
  const [products, setProducts] = useState(section.initialData || []);
  const [loading, setLoading] = useState(!section.initialData);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);

  useEffect(() => {
    // Only fetch if we don't have initialData from server
    if (section.initialData) return;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        let url = `${process.env.NEXT_PUBLIC_API_URL}/products?`;

        // Handle different product sources
        if (productCarousel.productSource === 'manual' && productCarousel.products?.length) {
          url += `ids=${productCarousel.products.join(',')}&`;
        } else if (productCarousel.productSource === 'featured') {
          url += `featured=true&`;
        } else if (productCarousel.productSource === 'new') {
          url += `sortBy=createdAt&order=desc&`;
        } else if (productCarousel.productSource === 'bestseller') {
          url += `sortBy=salesCount&order=desc&`;
        } else if (productCarousel.productSource === 'category' && productCarousel.categoryFilter) {
          url += `category=${productCarousel.categoryFilter}&`;
        } else if (productCarousel.productSource === 'tag' && productCarousel.tagFilter?.length) {
          url += `tags=${productCarousel.tagFilter.join(',')}&`;
        } else if (productCarousel.productSource === 'brand' && productCarousel.brandFilter) {
          url += `brand=${encodeURIComponent(productCarousel.brandFilter)}&`;
        }

        url += `limit=${productCarousel.limit || 12}&language=${language}`;

        const response = await fetch(url);
        const data = await response.json();
        setProducts(data.data || []);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    section.initialData,
    productCarousel.productSource,
    productCarousel.products,
    productCarousel.categoryFilter,
    productCarousel.tagFilter,
    productCarousel.brandFilter,
    productCarousel.limit,
    language
  ]);

  // Auto-scroll effect
  useEffect(() => {
    if (productCarousel.layout?.autoplay && products.length > 0) {
      const interval = setInterval(() => {
        scrollToNext();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [products.length, productCarousel.layout]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        scrollToNext();
      } else if (e.key === 'ArrowLeft') {
        scrollToPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [products.length]);

  // Helper function to calculate items per view
  const getItemsPerView = () => {
    if (typeof window === 'undefined') return 4;
    const width = window.innerWidth;
    const layout = productCarousel.layout?.itemsPerView || { desktop: 4, tablet: 2, mobile: 1 };

    if (width < 768) return layout.mobile || 1;
    if (width < 1024) return layout.tablet || 2;
    return layout.desktop || 4;
  };

  // Track scroll position for indicators
  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const currentItemsPerView = getItemsPerView();
      const itemWidth = container.offsetWidth / currentItemsPerView;
      const newIndex = Math.round(scrollLeft / itemWidth);

      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [currentIndex, productCarousel.layout]);

  const scrollToNext = () => {
    const container = carouselRef.current;
    if (!container) return;

    const scrollAmount = container.offsetWidth;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const scrollToPrev = () => {
    const container = carouselRef.current;
    if (!container) return;

    const scrollAmount = container.offsetWidth;
    container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex gap-4 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-64 animate-pulse">
              <div className="bg-gray-200 h-64 rounded-lg mb-4" />
              <div className="bg-gray-200 h-4 rounded w-3/4 mb-2" />
              <div className="bg-gray-200 h-4 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">לא נמצאו מוצרים</p>
      </div>
    );
  }

  const title = productCarousel.title?.[language] || '';
  const layout = productCarousel.layout || {};
  const itemsPerView = getItemsPerView();

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 py-12 relative">
      {title && (
        <h2 className="guess-heading-secondary text-center mb-8" dir={language === 'he' ? 'rtl' : 'ltr'}>
          {title}
        </h2>
      )}

      <div className="relative group">
        {/* Navigation Buttons - שיפור העיצוב */}
        {layout.navigation && products.length > itemsPerView && (
          <>
            <button
              onClick={scrollToPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-xl rounded-full p-3 md:p-4 transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
              aria-label="מוצרים קודמים"
            >
              <ChevronRight className="h-6 w-6 md:h-7 md:w-7 text-black" />
            </button>
            <button
              onClick={scrollToNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-xl rounded-full p-3 md:p-4 transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
              aria-label="מוצרים הבאים"
            >
              <ChevronLeft className="h-6 w-6 md:h-7 md:w-7 text-black" />
            </button>
          </>
        )}

        {/* Products Container עם scroll אופקי טבעי */}
        <div
          ref={carouselRef}
          className="overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth flex gap-4"
          style={{
            padding: '0 40px',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {products.map((product) => (
            <div
              key={product._id}
              className="flex-shrink-0 snap-center"
              style={{ width: `calc(${100 / itemsPerView}% - 16px)` }}
            >
              <MinimalProductCard product={product} language={language} />
            </div>
          ))}
        </div>

        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>

      {/* View All Link */}
      {productCarousel.categoryFilter && (
        <div className="text-center mt-8">
          <a
            href={`/categories/${productCarousel.categoryFilter}`}
            className="text-primary hover:underline font-medium"
          >
            {language === 'he' ? 'צפה בכל המוצרים' : 'View All Products'}
          </a>
        </div>
      )}
    </div>
  );
}

// Minimal Product Card - GUESS style (image with text at bottom)
function MinimalProductCard({ product, language }) {
  // Handle both name formats: name.he/name_he
  const name = product.name?.[language] || product[`name_${language}`] || product.name_he || product.name_en || '';
  const imageUrl = product.images?.[0]?.url || '/placeholder-product.jpg';

  return (
    <Link href={`/products/${product._id}`}>
      <div className="group relative overflow-hidden cursor-pointer">
        {/* Product Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
          />

          {/* Text at Bottom - Always Visible */}
          <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 bg-gradient-to-t from-black/80 via-black/60 to-transparent">
            <h3
              className="guess-product-title text-white guess-text-overlay line-clamp-2"
              dir={language === 'he' ? 'rtl' : 'ltr'}
            >
              {name}
            </h3>
          </div>
        </div>
      </div>
    </Link>
  );
}
