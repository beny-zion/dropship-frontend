'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

// Add custom scrollbar hide style
const scrollbarHideStyle = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

export default function CategoryGrid({ section, language = 'he' }) {
  const { categoryGrid } = section.content;
  // Use initialData from server if available, otherwise fetch on client
  const [categories, setCategories] = useState(section.initialData || []);
  const [loading, setLoading] = useState(!section.initialData);

  useEffect(() => {
    // Only fetch if we don't have initialData from server
    if (section.initialData) return;

    const fetchCategories = async () => {
      try {
        setLoading(true);

        // If specific categories are selected
        if (categoryGrid.displayMode === 'selected' && categoryGrid.categories?.length) {
          // Extract IDs from categories (in case they're objects with _id property)
          const categoryIds = categoryGrid.categories.map(cat =>
            typeof cat === 'string' ? cat : cat._id || cat
          );

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/categories?ids=${categoryIds.join(',')}`
          );
          const data = await response.json();
          let cats = data.data || [];

          // ⚡ Sort categories by the order in categoryGrid.categories
          // This ensures the display order matches the admin's selection order
          cats = categoryIds
            .map(id => cats.find(cat => cat._id === id))
            .filter(Boolean) // Remove any undefined (categories not found)
            .filter(cat => cat.isActive); // Only active categories

          setCategories(cats);
        }
        // If showing all categories
        else if (categoryGrid.displayMode === 'all') {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories?active=true`);
          const data = await response.json();
          let cats = data.data || [];

          // Apply limit if specified
          if (categoryGrid.limit && categoryGrid.limit > 0) {
            cats = cats.slice(0, categoryGrid.limit);
          }

          setCategories(cats);
        }
        // If showing featured categories
        else if (categoryGrid.displayMode === 'featured') {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories?featured=true`);
          const data = await response.json();
          let cats = data.data || [];

          // Apply limit if specified
          if (categoryGrid.limit && categoryGrid.limit > 0) {
            cats = cats.slice(0, categoryGrid.limit);
          }

          setCategories(cats);
        }
        // Default: show all active categories
        else {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories?active=true`);
          const data = await response.json();
          let cats = data.data || [];

          // Apply limit if specified
          if (categoryGrid.limit && categoryGrid.limit > 0) {
            cats = cats.slice(0, categoryGrid.limit);
          }

          setCategories(cats);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [section.initialData, categoryGrid.categories, categoryGrid.displayMode, categoryGrid.limit]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-64 rounded-lg mb-4" />
              <div className="bg-gray-200 h-6 rounded w-3/4 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!categories.length) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">לא נמצאו קטגוריות</p>
      </div>
    );
  }

  const title = categoryGrid.title?.[language] || '';
  const layout = categoryGrid.layout || {};
  const columns = layout.columns || { desktop: 4, tablet: 2, mobile: 1 };

  // Generate grid classes based on columns
  const gridClasses = `grid gap-${layout.gap || '24px'}
    grid-cols-${columns.mobile}
    md:grid-cols-${columns.tablet}
    lg:grid-cols-${columns.desktop}`;

  return (
    <>
      <style jsx>{scrollbarHideStyle}</style>
      {/* Force full width by breaking out of parent container */}
      <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw] bg-white">
        {title && (
          <div className="container mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12">
            <h2 className="guess-heading-secondary text-center" dir={language === 'he' ? 'rtl' : 'ltr'}>
              {title}
            </h2>
          </div>
        )}

        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 px-4 md:px-8 lg:px-12 pb-12">
          {categories.map((category) => (
            <CategoryCard
              key={category._id}
              category={category}
              language={language}
            />
          ))}
        </div>
      </div>
    </>
  );
}

// Improved Card Style (GUESS inspired - 2 columns grid)
// function CategoryCard({ category, language }) {
//   const name = category.name?.[language] || category.name?.he || category.name || '';
//   const imageUrl = category.mainImage?.url || category.image?.url || '/placeholder-category.jpg';

//   return (
//     <Link href={`/categories/${category.slug || category._id}`}>
//       <div className="relative aspect-[4/5] overflow-hidden group rounded-lg">
//         {/* Background Image - Crystal Clear, No Overlay */}
//         <img
//           src={imageUrl}
//           alt={name}
//           className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
//           style={{ imageRendering: 'crisp-edges' }}
//         />

//         {/* Content - Bottom Aligned with localized shadow */}
//         <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
//           {/* Localized gradient ONLY behind text area (128px height) */}
//           <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent -z-10 pointer-events-none" />

//           {/* Category Name */}
//           <h3
//             className="guess-heading-secondary text-white mb-2 relative"
//             dir={language === 'he' ? 'rtl' : 'ltr'}
//             style={{ textShadow: '2px 2px 12px rgba(0, 0, 0, 0.9)' }}
//           >
//             {name}
//           </h3>

//           {/* Product Count */}
//           {category.productCount > 0 && (
//             <p className="text-white/90 text-sm md:text-base font-medium uppercase tracking-wide relative">
//               {category.productCount} {language === 'he' ? 'מוצרים' : 'Products'}
//             </p>
//           )}

//           {/* Shop CTA - Appears on Hover */}
//           <div className="mt-4 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500 relative">
//             <span className="guess-cta inline-block text-white border-b-2 border-white pb-1">
//               {language === 'he' ? 'קנה עכשיו' : 'Shop Now'}
//             </span>
//           </div>
//         </div>
//       </div>
//     </Link>
//   );
// }
function CategoryCard({ category, language }) {
  const name = category.name?.[language] || category.name?.he || category.name || '';
  const imageUrl = category.mainImage?.url || category.image?.url || '/placeholder-category.jpg';

  return (
    <Link 
      href={`/categories/${category.slug || category._id}`} 
      // ה-!opacity-100 מבטל את ה-0.7 הגלובלי מה-CSS
      className="group block hover:!opacity-100 transition-opacity"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-black">
        {/* Background Image */}
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover transition-all duration-700 
                     group-hover:scale-110 
                     !opacity-100 
                     group-hover:brightness-[0.85] 
                     group-hover:contrast-[1.1]"
          style={{ 
            transform: 'translateZ(0)', // מונע טשטוש בזמן הגדלה
            willChange: 'transform, filter'
          }}
        />

        {/* Shadow Overlay - שכבה כהה שמתחזקת ב-Hover כדי להבליט את הטקסט */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
          <h3
            className="guess-heading-secondary text-white mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500"
            dir={language === 'he' ? 'rtl' : 'ltr'}
            style={{ textShadow: '0px 4px 20px rgba(0, 0, 0, 0.6)' }}
          >
            {name}
          </h3>

          {/* Shop CTA */}
          <div className="overflow-hidden">
            <div className="opacity-0 group-hover:opacity-100 translate-y-full group-hover:translate-y-0 transition-all duration-500">
              <span className="guess-cta inline-block text-white border-b-2 border-white pb-1 text-sm font-bold uppercase tracking-widest">
                {language === 'he' ? 'צפה בקולקציה' : 'View Collection'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}