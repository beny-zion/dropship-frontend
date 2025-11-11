import { useState, useEffect } from 'react';
import Link from 'next/link';

/**
 * תיקון URL של Cloudinary שהועלה בטעות כ-raw במקום image
 * מתקן URLs כמו: /raw/upload/ -> /image/upload/
 * מתקן גם: .auto -> (ריק)
 */
const fixCloudinaryUrl = (url) => {
  if (!url || typeof url !== 'string') return url;

  // תיקון /raw/upload/ ל-/image/upload/
  let fixedUrl = url.replace('/raw/upload/', '/image/upload/');

  // הסרת .auto מהסוף (לפני query params אם יש)
  fixedUrl = fixedUrl.replace(/\.auto(\?|$)/, '$1');

  return fixedUrl;
};

export default function HeroImage({ section, language = 'he' }) {
  const [isMobile, setIsMobile] = useState(false);
  const { heroImage } = section.content;

  const desktopImage = heroImage?.desktopImage || {};
  const mobileImage = heroImage?.mobileImage || {};
  const link = heroImage?.link || '';
  const openInNewTab = heroImage?.openInNewTab || false;

  // תיקון URLs אם יש בעיה
  const fixedDesktopUrl = fixCloudinaryUrl(desktopImage.url);
  const fixedMobileUrl = fixCloudinaryUrl(mobileImage.url);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Select the appropriate image based on screen size
  const currentImageUrl = isMobile ? fixedMobileUrl : fixedDesktopUrl;
  const imageAlt = (isMobile ? mobileImage.alt : desktopImage.alt) || 'Hero Image';

  // If no image is configured, show placeholder
  if (!fixedDesktopUrl && !fixedMobileUrl) {
    return (
      <div className="flex items-center justify-center bg-gray-200 py-24">
        <p className="text-gray-500">לא הוגדרה תמונה</p>
      </div>
    );
  }

  // Image element
  const imageElement = (
    <picture className="w-full">
      {/* Mobile image */}
      {fixedMobileUrl && (
        <source
          media="(max-width: 767px)"
          srcSet={fixedMobileUrl}
        />
      )}

      {/* Desktop image (default) */}
      <img
        src={fixedDesktopUrl || currentImageUrl}
        alt={imageAlt}
        className="w-full h-auto object-cover"
        style={{
          maxWidth: '100%',
          height: 'auto',
          display: 'block'
        }}
      />
    </picture>
  );

  // If link is provided, wrap in Link component
  if (link) {
    const isExternal = link.startsWith('http://') || link.startsWith('https://');

    if (isExternal) {
      return (
        <a
          href={link}
          target={openInNewTab ? '_blank' : '_self'}
          rel={openInNewTab ? 'noopener noreferrer' : undefined}
          className="block w-full"
        >
          {imageElement}
        </a>
      );
    }

    return (
      <Link href={link} className="block w-full">
        {imageElement}
      </Link>
    );
  }

  // No link, just return the image
  return <div className="w-full">{imageElement}</div>;
}
