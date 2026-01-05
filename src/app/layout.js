import { Providers } from '@/components/Providers';
import ConditionalLayout from '@/components/ConditionalLayout';
import ConsentBanner from '@/components/shared/ConsentBanner';
import './globals.css';

// Fetch active categories and tags for SEO keywords
async function getSEOKeywords() {
  try {
    // Fetch categories and products in parallel
    const [categoriesRes, productsRes] = await Promise.all([
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/categories?active=true`,
        {
          next: { revalidate: 3600 }, // Cache for 1 hour
          headers: { 'Content-Type': 'application/json' },
        }
      ),
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products?limit=100&status=active`,
        {
          next: { revalidate: 3600 },
          headers: { 'Content-Type': 'application/json' },
        }
      )
    ]);

    const brands = [];
    const tags = new Set();

    // Extract brand names from categories
    if (categoriesRes.ok) {
      const categoriesData = await categoriesRes.json();
      const categories = categoriesData.data || [];
      brands.push(...categories.map(cat => cat.name_en || cat.name_he).filter(Boolean));
    }

    // Extract unique tags from products
    if (productsRes.ok) {
      const productsData = await productsRes.json();
      const products = productsData.data || [];
      products.forEach(product => {
        if (product.tags && Array.isArray(product.tags)) {
          product.tags.forEach(tag => tags.add(tag));
        }
      });
    }

    return {
      brands,
      tags: Array.from(tags)
    };
  } catch (error) {
    console.error('Error fetching SEO keywords:', error);
  }

  // Fallback if API fails
  return {
    brands: [
      'Tommy Hilfiger',
      'GUESS',
      'Armani Exchange',
      'Calvin Klein',
      'DKNY',
      'Kate Spade New York',
      'Karl Lagerfeld'
    ],
    tags: []
  };
}

export async function generateMetadata() {
  const { brands, tags } = await getSEOKeywords();

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.torinoil.com'),
    title: {
      default: 'TORINO - מותגים מקוריים מובילים',
      template: '%s | TORINO'
    },
    description: `חנות TORINO - מוצרים מקוריים ממותגים מובילים מארה"ב ואירופה. ${brands.slice(0, 4).join(', ')} ועוד. משלוח מהיר ואמין.`,
    keywords: [
      'TORINO',
      'מותגים מקוריים',
      ...brands,
      ...tags,
      'מוצרים מקוריים',
      'אופנה',
      'קניות אונליין',
      'משלוח בינלאומי',
      'מותגי פרימיום'
    ],
    authors: [{ name: 'TORINO' }],
    creator: 'TORINO',
    publisher: 'TORINO',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    icons: {
      icon: [
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      ],
      apple: '/apple-touch-icon.png',
    },
    openGraph: {
      type: 'website',
      locale: 'he_IL',
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.torinoil.com',
      siteName: 'TORINO',
      title: 'TORINO - מותגים מקוריים מובילים',
      description: 'מוצרים מקוריים ממותגים מובילים מארה"ב ואירופה. משלוח מהיר ואמין.',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'TORINO - מותגים מקוריים מובילים',
      description: 'מוצרים מקוריים ממותגים מובילים מארה"ב ואירופה.',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      // Google Search Console verification tag will go here
      // google: 'your-google-verification-code',
    },
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Assistant:wght@200;300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="flex flex-col min-h-screen">
        <Providers>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
          <ConsentBanner />
        </Providers>
      </body>
    </html>
  );
}