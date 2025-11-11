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

export default async function HomePage() {
  // Fetch data on the server
  const { homepage, useCMS } = await getHomepageData();

  // Use CMS content if available
  if (useCMS && homepage) {
    const sortedSections = homepage.sections.sort((a, b) => a.displayOrder - b.displayOrder);
    const firstSection = sortedSections[0];
    const remainingSections = sortedSections.slice(1);

    return (
      <div className="dynamic-homepage">
        {/* First Section (Hero/Main) */}
        {firstSection && (
          <SectionRenderer
            key={firstSection._id}
            section={firstSection}
            language="he"
            preview={false}
          />
        )}

        {/* Category Carousel - Between First and Rest */}
        <CategoryCarousel language="he" className="my-8" />

        {/* Remaining Sections */}
        {remainingSections.map((section) => (
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