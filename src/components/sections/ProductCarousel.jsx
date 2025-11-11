import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function ProductCarousel({ section, language = 'he' }) {
  const { productCarousel } = section.content;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);

  useEffect(() => {
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
  }, [currentIndex, products.length, productCarousel.layout]);

  const scrollToNext = () => {
    const itemsPerView = getItemsPerView();
    if (currentIndex + itemsPerView < products.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const scrollToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      const itemsPerView = getItemsPerView();
      setCurrentIndex(Math.max(0, products.length - itemsPerView));
    }
  };

  const getItemsPerView = () => {
    if (typeof window === 'undefined') return 4;
    const width = window.innerWidth;
    const layout = productCarousel.layout?.itemsPerView || { desktop: 4, tablet: 2, mobile: 1 };

    if (width < 768) return layout.mobile || 1;
    if (width < 1024) return layout.tablet || 2;
    return layout.desktop || 4;
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

      <div className="relative">
        {/* Navigation Buttons */}
        {layout.navigation && products.length > itemsPerView && (
          <>
            <button
              onClick={scrollToPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-100 transition-all"
              aria-label="Previous"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            <button
              onClick={scrollToNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-100 transition-all"
              aria-label="Next"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Products Container */}
        <div
          ref={carouselRef}
          className="overflow-hidden"
          style={{ padding: '0 40px' }}
        >
          <div
            className="flex gap-4 transition-transform duration-300 ease-in-out"
            style={{
              transform: `translateX(${language === 'he' ? '' : '-'}${currentIndex * (100 / itemsPerView)}%)`
            }}
          >
            {products.map((product) => (
              <div
                key={product._id}
                className="flex-shrink-0"
                style={{ width: `calc(${100 / itemsPerView}% - ${layout.spaceBetween || 20}px)` }}
              >
                <MinimalProductCard product={product} language={language} />
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Dots */}
        {layout.pagination && products.length > itemsPerView && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: Math.ceil(products.length / itemsPerView) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index * itemsPerView)}
                className={`w-2 h-2 rounded-full transition-all ${
                  Math.floor(currentIndex / itemsPerView) === index
                    ? 'bg-primary w-6'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>
        )}
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
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
