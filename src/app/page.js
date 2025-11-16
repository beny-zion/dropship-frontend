import SectionRenderer from '@/components/sections/SectionRenderer';
import CategoryCarousel from '@/components/sections/CategoryCarousel';
import CategoryGrid from '@/components/categories/CategoryGrid';
import HomePageClient from '@/components/home/HomePageClient';
import { getActiveHomePage } from '@/lib/api/homepage';

// This is a Server Component - it fetches data at build/request time
export const dynamic = 'force-dynamic'; // Always fetch fresh data
export const revalidate = 10; // Revalidate every 10 seconds (faster updates for admin changes)

async function getHomepageData() {
  try {
    const response = await getActiveHomePage('he');
    if (response.success && response.data) {
      return { homepage: response.data, useCMS: true };
    }
    return { homepage: null, useCMS: false };
  } catch (error) {
    console.error('Failed to fetch homepage:', error);
    return { homepage: null, useCMS: false };
  }
}

// Fetch data for a specific section on the server
async function fetchSectionData(section, language) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    if (section.type === 'product_carousel') {
      const { productCarousel } = section.content;
      let url = `${API_URL}/products?`;

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

      const response = await fetch(url, { cache: 'no-store', next: { revalidate: 10 } });
      const data = await response.json();
      return data.data || [];
    }

    else if (section.type === 'category_grid') {
      const { categoryGrid } = section.content;
      let url = `${API_URL}/categories?`;

      if (categoryGrid.displayMode === 'selected' && categoryGrid.categories?.length) {
        const categoryIds = categoryGrid.categories.map(cat =>
          typeof cat === 'string' ? cat : cat._id || cat
        );
        url += `ids=${categoryIds.join(',')}&`;

        const response = await fetch(url, { cache: 'no-store', next: { revalidate: 10 } });
        const data = await response.json();
        let cats = data.data || [];

        // ⚡ Sort categories by the order in categoryGrid.categories
        // This ensures the display order matches the admin's selection order
        cats = categoryIds
          .map(id => cats.find(cat => cat._id === id))
          .filter(Boolean) // Remove any undefined (categories not found)
          .filter(cat => cat.isActive); // Only active categories

        return cats;
      } else if (categoryGrid.displayMode === 'featured') {
        url += `featured=true&`;
      } else {
        url += `active=true&`;
      }

      const response = await fetch(url, { cache: 'no-store', next: { revalidate: 10 } });
      const data = await response.json();
      let cats = data.data || [];

      // Filter active and apply limit (for 'all' and 'featured' modes)
      cats = cats.filter(cat => cat.isActive);
      if (categoryGrid.limit && categoryGrid.limit > 0) {
        cats = cats.slice(0, categoryGrid.limit);
      }

      return cats;
    }

    return null;
  } catch (error) {
    console.error(`Failed to fetch data for section ${section._id}:`, error);
    return null;
  }
}

export default async function HomePage() {
  // Fetch data on the server
  const { homepage, useCMS } = await getHomepageData();

  // Use CMS content if available
  if (useCMS && homepage) {
    const sortedSections = homepage.sections.sort((a, b) => a.displayOrder - b.displayOrder);
    const firstSection = sortedSections[0];
    const remainingSections = sortedSections.slice(1);

    // Fetch data for all sections that need it (in parallel for performance)
    const sectionsWithData = await Promise.all(
      [firstSection, ...remainingSections].map(async (section) => {
        if (!section) return null;
        const data = await fetchSectionData(section, 'he');
        return { ...section, initialData: data };
      })
    );

    const firstSectionWithData = sectionsWithData[0];
    const remainingSectionsWithData = sectionsWithData.slice(1).filter(Boolean);

    return (
      <div className="dynamic-homepage">
        {/* First Section (Hero/Main) */}
        {firstSectionWithData && (
          <SectionRenderer
            key={firstSectionWithData._id}
            section={firstSectionWithData}
            language="he"
            preview={false}
          />
        )}

        {/* Category Carousel - Between First and Rest */}
        <CategoryCarousel language="he" className="my-8" />

        {/* Remaining Sections */}
        {remainingSectionsWithData.map((section) => (
          <SectionRenderer
            key={section._id}
            section={section}
            language="he"
            preview={false}
          />
        ))}
      </div>
    );
  }

  // Fallback to static content
  return (
    <>
      {/* Hero Section with Auth-aware content */}
      <HomePageClient />

      {/* Categories Section */}
      <CategoryGrid />

      {/* Features Section - TORINO Brand Values */}
      <div className="container mx-auto px-4 py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-light tracking-wide mb-4" style={{ letterSpacing: '0.15em' }}>
            למה TORINO?
          </h2>
          <p className="text-gray-600 text-lg font-light">
            חוויית אופנה יוקרתית עם שירות ברמה עולמית
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 border border-gray-200 rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 bg-white group">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-black flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-light mb-3 text-center tracking-wide" style={{ letterSpacing: '0.1em' }}>
              יבוא אישי
            </h3>
            <p className="text-gray-600 text-base text-center leading-relaxed">
              מותגי אופנה יוקרתיים מכל רחבי העולם ישירות אליך
            </p>
          </div>

          <div className="p-8 border border-gray-200 rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 bg-white group">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-black flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="text-2xl font-light mb-3 text-center tracking-wide" style={{ letterSpacing: '0.1em' }}>
              איכות פרמיום
            </h3>
            <p className="text-gray-600 text-base text-center leading-relaxed">
              רק מוצרים מקוריים ממותגים מובילים בעולם האופנה
            </p>
          </div>

          <div className="p-8 border border-gray-200 rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 bg-white group">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-black flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-light mb-3 text-center tracking-wide" style={{ letterSpacing: '0.1em' }}>
              שירות VIP
            </h3>
            <p className="text-gray-600 text-base text-center leading-relaxed">
              ליווי אישי והתאמה מושלמת לסטייל שלך
            </p>
          </div>
        </div>
      </div>
    </>
  );
}