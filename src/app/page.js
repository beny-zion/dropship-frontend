import SectionRenderer from '@/components/sections/SectionRenderer';
import CategoryCarousel from '@/components/sections/CategoryCarousel';
import CategoryGrid from '@/components/categories/CategoryGrid';
import HomePageClient from '@/components/home/HomePageClient';
import { getActiveHomePage } from '@/lib/api/homepage';

// This is a Server Component - it fetches data at build/request time
export const dynamic = 'force-dynamic'; // Always fetch fresh data
export const revalidate = 60; // Revalidate every 60 seconds

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

      const response = await fetch(url, { cache: 'no-store', next: { revalidate: 60 } });
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
      } else if (categoryGrid.displayMode === 'featured') {
        url += `featured=true&`;
      } else {
        url += `active=true&`;
      }

      const response = await fetch(url, { cache: 'no-store', next: { revalidate: 60 } });
      const data = await response.json();
      let cats = data.data || [];

      // Filter active and apply limit
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

      {/* Features Section - Static, no need for client component */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 border rounded-2xl shadow-sm hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-white">
            <div className="text-5xl mb-4">🚚</div>
            <h3 className="text-2xl font-bold mb-3">משלוח עד הבית</h3>
            <p className="text-gray-600 text-lg">
              אנחנו דואגים להכל - המוצר יגיע ישירות לפתח ביתך
            </p>
          </div>

          <div className="p-8 border rounded-2xl shadow-sm hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-white">
            <div className="text-5xl mb-4">💰</div>
            <h3 className="text-2xl font-bold mb-3">מחירים משתלמים</h3>
            <p className="text-gray-600 text-lg">
              מחירים טובים יותר מהחנויות בישראל, ללא מאמץ
            </p>
          </div>

          <div className="p-8 border rounded-2xl shadow-sm hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-white">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-2xl font-bold mb-3">מוצרים מובחרים</h3>
            <p className="text-gray-600 text-lg">
              רק מוצרים איכותיים עם ביקורות מעולות
            </p>
          </div>
        </div>
      </div>
    </>
  );
}