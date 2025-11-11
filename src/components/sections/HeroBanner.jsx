import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HeroBanner({ section, language = 'he' }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { heroBanner } = section.content;
  const images = heroBanner.images || [];
  const text = heroBanner.text?.[language] || {};
  const styling = heroBanner.styling || {};
  const autoplay = heroBanner.autoplay || {};
  const overlay = heroBanner.overlay || {};

  useEffect(() => {
    if (autoplay.enabled && images.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % images.length);
      }, autoplay.interval || 5000);
      return () => clearInterval(interval);
    }
  }, [autoplay.enabled, autoplay.interval, images.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!images.length) {
    return (
      <div
        className="flex items-center justify-center bg-gray-200"
        style={{ height: styling.height || '600px' }}
      >
        <p className="text-gray-500">לא הוגדרו תמונות</p>
      </div>
    );
  }

  const currentImage = images[currentSlide];
  const imageUrl = window.innerWidth < 768
    ? currentImage.mobile?.url || currentImage.desktop?.url
    : currentImage.desktop?.url;

  return (
    <div
      className="relative overflow-hidden"
      style={{
        height: styling.height || '600px',
        backgroundColor: styling.backgroundColor || '#000'
      }}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-500"
        style={{
          backgroundImage: `url(${imageUrl})`,
        }}
      />

      {/* Overlay */}
      {overlay.enabled && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: overlay.color || 'rgba(0,0,0,0.3)',
            opacity: overlay.opacity || 0.3
          }}
        />
      )}

      {/* Text Content */}
      {(text.title || text.subtitle || text.ctaText) && (
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10`}
          style={{
            color: styling.textColor || '#ffffff',
            textAlign: styling.textPosition || 'center'
          }}
        >
          {text.title && (
            <h1 className="guess-heading-main guess-text-overlay mb-4 animate-fadeIn">
              {text.title}
            </h1>
          )}
          {text.subtitle && (
            <p className="guess-heading-subtitle guess-text-overlay mb-8 max-w-2xl animate-fadeIn animation-delay-200">
              {text.subtitle}
            </p>
          )}
          {text.ctaText && currentImage.link && (
            <button
              className="guess-cta animate-fadeIn animation-delay-400 bg-white text-black px-8 py-3 font-bold uppercase tracking-wider hover:bg-gray-100 transition-colors rounded-sm"
              onClick={() => window.location.href = currentImage.link}
            >
              {text.ctaText}
            </button>
          )}
        </div>
      )}

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 rounded-full p-2 transition-all"
            aria-label="Previous slide"
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 rounded-full p-2 transition-all"
            aria-label="Next slide"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
