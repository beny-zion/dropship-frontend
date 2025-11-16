'use client';

import { useCategories } from '@/lib/hooks/useCategories';
import CategoryCard from './CategoryCard';
import { motion } from 'framer-motion';

export default function CategoryGrid() {
  const { categories, loading, error } = useCategories(true);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-80 bg-gray-200 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold">שגיאה בטעינת הקטגוריות</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-4 py-16">
      {/* Section Header */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-4xl font-light tracking-wide mb-4" style={{ letterSpacing: '0.15em' }}>
          גלה את הקולקציות
        </h2>
        <p className="text-gray-600 text-lg font-light">
          מותגי אופנה יוקרתיים בקטגוריות מגוונות
        </p>
      </motion.div>

      {/* Categories Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
      >
        {categories.map((category, index) => (
          <motion.div
            key={category._id}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5 }}
          >
            <CategoryCard category={category} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
