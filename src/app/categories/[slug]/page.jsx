import { notFound } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/products/ProductCard';
import CategorySchema from '@/components/seo/CategorySchema';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Home } from 'lucide-react';

// ============================================
// Server-Side Data Fetching
// ============================================

async function getCategory(slug) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/categories/${slug}`,
      {
        cache: 'no-store', // Always fetch fresh data for SEO
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
}

async function getCategoryProducts(categoryId, page = 1, limit = 12) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products?category=${categoryId}&page=${page}&limit=${limit}`,
      {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!res.ok) return { products: [], pagination: {} };
    const data = await res.json();
    return {
      products: data.data || [],
      pagination: data.pagination || {}
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { products: [], pagination: {} };
  }
}

// ============================================
// Metadata for SEO
// ============================================

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const category = await getCategory(resolvedParams.slug);

  if (!category) {
    return {
      title: 'קטגוריה לא נמצאה',
    };
  }

  const name = category.name?.he || category.name?.en || 'קטגוריה';
  const description = category.description?.he || category.description?.en || '';

  return {
    title: `${name} | החנות שלנו`,
    description: description || `כל המוצרים בקטגוריית ${name}`,
    openGraph: {
      title: name,
      description: description,
      images: category.image?.url ? [category.image.url] : [],
      type: 'website',
    },
    alternates: {
      canonical: `/categories/${resolvedParams.slug}`,
    },
  };
}

// ============================================
// Category Page Component (SSR)
// ============================================

export default async function CategoryPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const category = await getCategory(resolvedParams.slug);

  if (!category) {
    notFound();
  }

  const page = parseInt(resolvedSearchParams?.page) || 1;
  const { products, pagination } = await getCategoryProducts(category._id, page);

  const name = category.name?.he || category.name?.en || 'קטגוריה';
  const description = category.description?.he || category.description?.en || '';
  const categoryUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.torinoil.com'}/categories/${resolvedParams.slug}`;

  return (
    <>
      <CategorySchema
        category={{
          name_he: category.name?.he,
          name_en: category.name?.en,
          description_he: category.description?.he,
          description_en: category.description?.en
        }}
        url={categoryUrl}
        productCount={pagination.total || products.length}
      />
      <div className="min-h-screen bg-white">
      {/* Breadcrumbs - Minimal & Clean */}
      <div className="bg-white border-b border-neutral-200">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-xs tracking-wider overflow-x-auto" dir="rtl">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-neutral-500 hover:text-black transition-colors whitespace-nowrap font-light"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">דף הבית</span>
            </Link>
            <ChevronLeft className="h-4 w-4 text-neutral-300 rotate-180 flex-shrink-0" />
            <Link
              href="/products"
              className="text-neutral-500 hover:text-black transition-colors whitespace-nowrap font-light"
            >
              מוצרים
            </Link>
            <ChevronLeft className="h-4 w-4 text-neutral-300 rotate-180 flex-shrink-0" />
            <span className="text-black font-normal truncate max-w-[150px] sm:max-w-none">{name}</span>
          </nav>
        </div>
      </div>

      {/* Category Header - Elegant & Minimal */}
      <div
        className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden"
        style={{
          backgroundImage: `url(${category.mainImage?.url || category.image?.url || '/placeholder-category.jpg'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Subtle overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />

        {/* Content - Centered & Elegant */}
        <div className="relative h-full container mx-auto px-4 flex flex-col justify-center items-center text-center">
          <div className="max-w-4xl" dir="rtl">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-light text-white mb-6 md:mb-8 tracking-widest uppercase">
              {name}
            </h1>

            {description && (
              <p className="text-base md:text-lg lg:text-xl text-white/90 font-light tracking-wide leading-relaxed mb-8 md:mb-10 max-w-2xl mx-auto">
                {description}
              </p>
            )}

            {pagination.total > 0 && (
              <div className="inline-flex items-center gap-2 border border-white/50 text-white px-6 py-3 text-sm md:text-base font-light tracking-widest backdrop-blur-sm hover:bg-white hover:text-black transition-all duration-300">
                {pagination.total} מוצרים
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-12 md:py-16 lg:py-20">
        {products.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-2xl font-light tracking-widest text-neutral-700 mb-4 uppercase" dir="rtl">
              אין מוצרים בקטגוריה זו
            </h3>
            <p className="text-sm font-light text-neutral-500 mb-8 tracking-wide" dir="rtl">
              חזור בקרוב למצוא מוצרים חדשים
            </p>
            <Link href="/products">
              <button className="border border-black px-8 py-3 text-sm font-light tracking-widest hover:bg-black hover:text-white transition-all duration-300">
                עבור לכל המוצרים
              </button>
            </Link>
          </div>
        ) : (
          <>
            {/* Products Grid - Clean Layout */}
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-6 lg:gap-8 mb-16">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination - Minimal Design */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-3 pt-8 border-t border-neutral-200">
                {page > 1 && (
                  <Link href={`/categories/${resolvedParams.slug}?page=${page - 1}`}>
                    <button className="px-4 py-2 text-sm font-light tracking-wider border border-black hover:bg-black hover:text-white transition-all duration-300">
                      הקודם
                    </button>
                  </Link>
                )}

                {/* Mobile: Simple indicator */}
                <div className="flex sm:hidden items-center">
                  <span className="px-4 py-2 text-sm font-light tracking-wide text-neutral-700">
                    {page} / {pagination.pages}
                  </span>
                </div>

                {/* Desktop: Page numbers */}
                <div className="hidden sm:flex gap-2">
                  {[...Array(pagination.pages)].map((_, i) => {
                    const pageNum = i + 1;
                    if (
                      pageNum === 1 ||
                      pageNum === pagination.pages ||
                      Math.abs(pageNum - page) <= 1
                    ) {
                      return (
                        <Link key={pageNum} href={`/categories/${resolvedParams.slug}?page=${pageNum}`}>
                          <button
                            className={`min-w-[40px] px-3 py-2 text-sm font-light tracking-wider transition-all duration-300 ${
                              page === pageNum
                                ? 'bg-black text-white'
                                : 'border border-neutral-300 hover:border-black'
                            }`}
                          >
                            {pageNum}
                          </button>
                        </Link>
                      );
                    } else if (pageNum === page - 2 || pageNum === page + 2) {
                      return <span key={pageNum} className="px-2 text-neutral-400">...</span>;
                    }
                    return null;
                  })}
                </div>

                {page < pagination.pages && (
                  <Link href={`/categories/${resolvedParams.slug}?page=${page + 1}`}>
                    <button className="px-4 py-2 text-sm font-light tracking-wider border border-black hover:bg-black hover:text-white transition-all duration-300">
                      הבא
                    </button>
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Related Categories */}
      {category.parent && (
        <div className="border-t border-neutral-200 py-8">
          <div className="container mx-auto px-4 text-center">
            <Link
              href={`/categories/${category.parent.slug}`}
              className="text-sm font-light tracking-widest text-neutral-600 hover:text-black transition-colors underline underline-offset-4"
              dir="rtl"
            >
              ← חזור ל{category.parent.name?.he || category.parent.name?.en}
            </Link>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

// ============================================
// Generate Static Params (Optional - for better performance)
// ============================================

export async function generateStaticParams() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
    const data = await res.json();
    const categories = data.data || [];

    return categories.map((category) => ({
      slug: category.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}
