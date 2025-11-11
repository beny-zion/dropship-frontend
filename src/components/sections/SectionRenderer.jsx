'use client';

import dynamic from 'next/dynamic';

// Dynamically import section components for code splitting
const HeroImage = dynamic(() => import('./HeroImage'));
const HeroBanner = dynamic(() => import('./HeroBanner'));
const CategoryGrid = dynamic(() => import('./CategoryGrid'));
const ProductCarousel = dynamic(() => import('./ProductCarousel'));
const PromotionalBanner = dynamic(() => import('./PromotionalBanner'));

export default function SectionRenderer({ section, language = 'he', preview = false }) {
  // Check visibility based on device
  if (!preview && section.visibility) {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const isTablet = typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1024;
    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;

    if (isMobile && !section.visibility.mobile) return null;
    if (isTablet && !section.visibility.tablet) return null;
    if (isDesktop && !section.visibility.desktop) return null;
  }

  // Check if section is active
  if (!preview && !section.isActive) return null;

  // Sections that manage their own full-width layout
  const fullWidthSections = ['hero_image', 'hero_banner', 'category_grid', 'promotional_banner', 'product_carousel'];
  const isFullWidth = fullWidthSections.includes(section.type);

  // Apply container styling (skip maxWidth for full-width sections)
  const containerStyling = section.containerStyling || {};
  const containerStyle = {
    backgroundColor: containerStyling.backgroundColor,
    padding: isFullWidth ? '0' : containerStyling.padding,
    margin: containerStyling.margin,
    maxWidth: isFullWidth ? 'none' : containerStyling.maxWidth,
  };

  const containerClass = containerStyling.customClass || '';

  // Render appropriate section component based on type
  const renderSection = () => {
    switch (section.type) {
      case 'hero_image':
        return <HeroImage section={section} language={language} />;

      case 'hero_banner':
        return <HeroBanner section={section} language={language} />;

      case 'category_grid':
        return <CategoryGrid section={section} language={language} />;

      case 'product_carousel':
        return <ProductCarousel section={section} language={language} />;

      case 'promotional_banner':
        return <PromotionalBanner section={section} language={language} />;

      case 'text_block':
        return <TextBlock section={section} language={language} />;

      case 'video_section':
        return <VideoSection section={section} language={language} />;

      case 'custom_component':
        return <CustomComponent section={section} language={language} />;

      default:
        console.warn(`Unknown section type: ${section.type}`);
        return null;
    }
  };

  return (
    <section
      id={`section-${section._id}`}
      className={containerClass}
      style={containerStyle}
    >
      {renderSection()}
    </section>
  );
}

// Simple Text Block Component
function TextBlock({ section, language }) {
  const { textBlock } = section.content;
  const content = textBlock.content?.[language] || '';
  const styling = textBlock.styling || {};

  if (!content) return null;

  return (
    <div
      className="container mx-auto px-4 py-12"
      style={{
        textAlign: styling.alignment || 'center',
        color: styling.textColor || '#000000',
        fontSize: styling.fontSize || '16px'
      }}
      dir={language === 'he' ? 'rtl' : 'ltr'}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

// Video Section Component
function VideoSection({ section, language }) {
  const { videoSection } = section.content;
  const title = videoSection.title?.[language] || '';
  const description = videoSection.description?.[language] || '';
  const videoUrl = videoSection.videoUrl;
  const thumbnail = videoSection.thumbnail;
  const styling = videoSection.styling || {};

  if (!videoUrl) return null;

  // Extract video ID from YouTube URL
  const getYouTubeId = (url) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const videoId = videoSection.provider === 'youtube' ? getYouTubeId(videoUrl) : null;

  return (
    <div className="container mx-auto px-4 py-12" dir={language === 'he' ? 'rtl' : 'ltr'}>
      {title && (
        <h2 className="text-3xl font-bold text-center mb-4">{title}</h2>
      )}
      {description && (
        <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">{description}</p>
      )}

      <div
        className="mx-auto overflow-hidden rounded-lg shadow-lg"
        style={{ maxWidth: styling.maxWidth || '800px' }}
      >
        <div className="relative" style={{ paddingBottom: '56.25%' }}>
          {videoSection.provider === 'youtube' && videoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=${styling.autoplay ? 1 : 0}&controls=${styling.controls !== false ? 1 : 0}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full"
            />
          ) : (
            <video
              src={videoUrl}
              controls={styling.controls !== false}
              autoPlay={styling.autoplay}
              loop={styling.loop}
              muted={styling.muted}
              poster={thumbnail}
              className="absolute top-0 left-0 w-full h-full"
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Custom Component
function CustomComponent({ section, language }) {
  const { customComponent } = section.content;
  const html = customComponent.html?.[language] || '';
  const css = customComponent.css || '';

  if (!html) return null;

  return (
    <div className="custom-component-wrapper">
      {css && <style>{css}</style>}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
