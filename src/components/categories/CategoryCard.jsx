'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCategoryClick } from '@/lib/hooks/useCategories';

export default function CategoryCard({ category }) {
  const [isHovered, setIsHovered] = useState(false);
  const handleCategoryClick = useCategoryClick();

  // Safety check
  if (!category || !category.name || !category.slug) {
    console.warn('Invalid category data:', category);
    return null;
  }

  const onCardClick = () => {
    if (category._id) {
      handleCategoryClick(category._id);
    }
  };

  // Determine which media to show
  const mediaToShow = isHovered && category.promotionalMedia?.url
    ? category.promotionalMedia
    : category.mainImage;

  // Check if we have a valid URL
  const hasValidUrl = mediaToShow?.url;
  const isVideo = mediaToShow?.type === 'video' || mediaToShow?.url?.match(/\.(mp4|mov|avi)$/i);

  return (
    <Link href={`/products?category=${category.slug}`} onClick={onCardClick}>
      <motion.div
        className="group relative overflow-hidden rounded-2xl shadow-lg cursor-pointer h-80"
        style={{
          backgroundColor: category.styling?.backgroundColor || '#ffffff',
        }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background Image/Video */}
        <div className="absolute inset-0">
          {hasValidUrl && isVideo ? (
            <video
              src={mediaToShow.url}
              alt={mediaToShow.alt || category.name.he}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              autoPlay
              loop
              muted
              playsInline
            />
          ) : hasValidUrl ? (
            <img
              src={mediaToShow.url}
              alt={mediaToShow?.alt || category.name.he}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <span className="text-4xl">{category.name.he.charAt(0)}</span>
            </div>
          )}

          {/* Gradient Overlay */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"
            style={{
              background: category.styling?.gradientColors?.length > 0
                ? `linear-gradient(to top, ${category.styling.gradientColors.join(', ')})`
                : undefined
            }}
          />
        </div>

        {/* Content */}
        <div className="relative h-full flex flex-col justify-end p-6 z-10">
          {/* Category Name */}
          <motion.h3
            className="text-3xl font-bold mb-2 drop-shadow-lg"
            style={{ color: category.styling?.textColor || '#ffffff' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {category.name.he}
          </motion.h3>

          {/* Promotional Text - Show on hover */}
          {category.promotionalText?.he && (
            <motion.p
              className="text-lg drop-shadow-md"
              style={{ color: category.styling?.textColor || '#ffffff' }}
              initial={{ opacity: 0, height: 0 }}
              animate={{
                opacity: isHovered ? 1 : 0,
                height: isHovered ? 'auto' : 0,
              }}
              transition={{ duration: 0.3 }}
            >
              {category.promotionalText.he}
            </motion.p>
          )}

          {/* Call to Action */}
          <motion.div
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full"
            style={{
              color: category.styling?.textColor || '#ffffff',
              borderColor: category.styling?.textColor || '#ffffff'
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{
              opacity: isHovered ? 1 : 0.7,
              x: isHovered ? 0 : -20
            }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-sm font-medium">גלה עכשיו</span>
            <svg
              className="w-4 h-4 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </motion.div>
        </div>

        {/* Hover Effect Border */}
        <div className="absolute inset-0 border-4 border-transparent group-hover:border-white/30 rounded-2xl transition-all duration-300" />
      </motion.div>
    </Link>
  );
}
