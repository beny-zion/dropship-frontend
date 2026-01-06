/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Amazon
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'images-na.ssl-images-amazon.com',
      },
      {
        protocol: 'https',
        hostname: '**.media-amazon.com',
      },
      // Cloudinary
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      // Scene7 (used by many brands)
      {
        protocol: 'https',
        hostname: '**.scene7.com',
      },
      // S5A
      {
        protocol: 'https',
        hostname: '**.s5a.com',
      },
      {
        protocol: 'https',
        hostname: 'image.s5a.com',
      },
      // Fashion brands - DKNY, Kate Spade, Coach, etc.
      {
        protocol: 'https',
        hostname: 'www.dkny.com',
      },
      {
        protocol: 'https',
        hostname: '**.dkny.com',
      },
      {
        protocol: 'https',
        hostname: 'www.katespade.com',
      },
      {
        protocol: 'https',
        hostname: '**.katespade.com',
      },
      {
        protocol: 'https',
        hostname: 'www.katespadeoutlet.com',
      },
      {
        protocol: 'https',
        hostname: '**.katespadeoutlet.com',
      },
      {
        protocol: 'https',
        hostname: 'www.coach.com',
      },
      {
        protocol: 'https',
        hostname: '**.coach.com',
      },
      {
        protocol: 'https',
        hostname: 'www.coachoutlet.com',
      },
      {
        protocol: 'https',
        hostname: '**.coachoutlet.com',
      },
      // AliExpress
      {
        protocol: 'https',
        hostname: '**.alicdn.com',
      },
      {
        protocol: 'https',
        hostname: 'ae01.alicdn.com',
      },
      // Shopify CDN (used by many stores)
      {
        protocol: 'https',
        hostname: '**.shopify.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
    ],
    // אפשר כל דומיין חיצוני (לא מומלץ לפרודקשן, רק לפיתוח)
    unoptimized: false,
  },
};

export default nextConfig;