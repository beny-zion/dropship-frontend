// Dynamic sitemap for TORINO Shop
// This file generates a sitemap.xml automatically for Google and other search engines

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.torinoil.com';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dropship-backend-4jth.onrender.com/api';

export default async function sitemap() {
  try {
    // Static pages
    const staticPages = [
      {
        url: SITE_URL,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${SITE_URL}/products`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${SITE_URL}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${SITE_URL}/terms`,
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.3,
      },
      {
        url: `${SITE_URL}/privacy`,
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.3,
      },
    ];

    // Fetch all products
    let productPages = [];
    try {
      const productsRes = await fetch(`${API_URL}/products?limit=1000&status=active`, {
        next: { revalidate: 3600 } // Revalidate every hour
      });

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        const products = productsData.data || [];

        productPages = products.map((product) => ({
          url: `${SITE_URL}/products/${product._id}`,
          lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        }));
      }
    } catch (error) {
      console.error('Error fetching products for sitemap:', error);
    }

    // Fetch all categories
    let categoryPages = [];
    try {
      const categoriesRes = await fetch(`${API_URL}/categories`, {
        next: { revalidate: 3600 } // Revalidate every hour
      });

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        const categories = Array.isArray(categoriesData.data)
          ? categoriesData.data
          : (Array.isArray(categoriesData) ? categoriesData : []);

        categoryPages = categories.map((category) => ({
          url: `${SITE_URL}/categories/${category.slug}`,
          lastModified: category.updatedAt ? new Date(category.updatedAt) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        }));
      }
    } catch (error) {
      console.error('Error fetching categories for sitemap:', error);
    }

    // Combine all pages
    return [...staticPages, ...productPages, ...categoryPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return at least static pages if dynamic pages fail
    return [
      {
        url: SITE_URL,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
    ];
  }
}
