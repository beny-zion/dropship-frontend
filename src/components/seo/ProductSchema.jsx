// Product Schema.org JSON-LD for SEO
// Helps Google display Rich Snippets with price, ratings, and availability

export default function ProductSchema({ product, url }) {
  if (!product) return null;

  // Get the primary image
  const primaryImage = product.images?.find(img => img.isPrimary)?.url || product.images?.[0]?.url;

  // Determine availability based on stock
  const availability = product.stock?.available
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock';

  // Get brand from supplier name or fallback
  const brand = product.supplier?.name || product.specifications?.brand || 'TORINO';

  // Get price - prefer ILS
  const price = product.price?.ils || product.price?.usd || 0;
  const currency = product.price?.ils ? 'ILS' : 'USD';

  // Product name - prefer Hebrew
  const name = product.name_he || product.name_en || 'Product';

  // Description - prefer Hebrew
  const description = product.description_he || product.description_en || '';

  // SKU - use first variant's SKU or product ID
  const sku = product.variants?.[0]?.sku || product._id;

  // Build the Schema.org JSON-LD
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: name,
    description: description,
    image: primaryImage || '',
    sku: sku,
    brand: {
      '@type': 'Brand',
      name: brand
    },
    offers: {
      '@type': 'Offer',
      url: url || '',
      priceCurrency: currency,
      price: price,
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0], // Valid for 1 year
      availability: availability,
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'TORINO'
      }
    }
  };

  // Add rating if available
  if (product.rating?.average > 0 && product.rating?.count > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating.average,
      reviewCount: product.rating.count,
      bestRating: 5,
      worstRating: 1
    };
  }

  // Add all images if available
  if (product.images && product.images.length > 1) {
    schema.image = product.images.map(img => img.url);
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
