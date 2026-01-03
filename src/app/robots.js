// Robots.txt configuration for TORINO Shop
// This file tells search engine crawlers which pages they can and cannot access

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.torinoil.com';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/profile',
          '/profile/*',
          '/checkout',
          '/checkout/*',
          '/cart',
          '/api/*',
          '/_next/*',
        ],
      },
      // Special rules for Google - same restrictions for security
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/profile',
          '/profile/*',
          '/checkout',
          '/checkout/*',
          '/cart',
          '/api/*',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
