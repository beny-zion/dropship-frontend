/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
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
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '**.s5a.com',
      },
      {
        protocol: 'https',
        hostname: 'image.s5a.com',
      },
    ],
    // אפשר כל דומיין חיצוני (לא מומלץ לפרודקשן, רק לפיתוח)
    unoptimized: false,
  },
};

export default nextConfig;
