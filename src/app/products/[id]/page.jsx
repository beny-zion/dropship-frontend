import ProductPageClient from '@/components/products/ProductPageClient';
import ProductSchema from '@/components/seo/ProductSchema';
import { notFound } from 'next/navigation';

// Server Component - fetches product data
export const dynamic = 'force-dynamic';
export const revalidate = 60; // Revalidate every 60 seconds

async function getProduct(id) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products/${id}`,
      {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        notFound();
      }
      throw new Error('Failed to fetch product');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { id } = await params;
  const productData = await getProduct(id);

  if (!productData || !productData.data) {
    return {
      title: 'מוצר לא נמצא',
    };
  }

  const product = productData.data;
  const price = product.price?.ils || product.price?.usd;
  const priceText = price ? ` - ₪${price}` : '';
  const availability = product.stock?.available ? 'במלאי' : 'אזל מהמלאי';
  const brand = product.supplier?.name || '';

  // Get primary image
  const primaryImage = product.images?.find(img => img.isPrimary)?.url || product.images?.[0]?.url;

  return {
    title: `${product.name_he}${priceText} - TORINO`,
    description: product.description_he
      ? `${product.description_he}. ${availability}. מוצרים מקוריים ממותגים מובילים.`
      : `${product.name_he}${brand ? ' מבית ' + brand : ''}. ${availability}. הזמן עכשיו!`,
    keywords: [
      product.name_he,
      brand,
      ...product.tags || [],
      'מותגים מקוריים',
      'TORINO'
    ].filter(Boolean),
    openGraph: {
      title: `${product.name_he}${priceText}`,
      description: product.description_he || product.name_he,
      images: primaryImage ? [{ url: primaryImage, width: 1200, height: 630 }] : [],
      siteName: 'TORINO',
      locale: 'he_IL',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name_he}${priceText}`,
      description: product.description_he || product.name_he,
      images: primaryImage ? [primaryImage] : [],
    },
  };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const initialData = await getProduct(id);

  if (!initialData || !initialData.data) {
    notFound();
  }

  const product = initialData.data;
  const productUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.torinoil.com'}/products/${product.slug || id}`;

  return (
    <>
      <ProductSchema product={product} url={productUrl} />
      <ProductPageClient productId={id} initialData={initialData} />
    </>
  );
}