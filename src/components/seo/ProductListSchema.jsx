// Product List Schema.org JSON-LD for SEO
// Helps Google understand product listing pages with ItemList schema

export default function ProductListSchema({ products, listName = 'מוצרים' }) {
  if (!products || products.length === 0) return null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.torinoil.com';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => {
      // Product name - prefer Hebrew
      const name = product.name_he || product.name_en || product.name || 'מוצר';

      // Primary image
      const primaryImage = product.images?.find(img => img.isPrimary)?.url || product.images?.[0]?.url;

      // Price
      const price = product.price?.ils || product.price?.usd || 0;
      const currency = product.price?.ils ? 'ILS' : 'USD';

      // Product URL with slug
      const productUrl = `${siteUrl}/products/${product.slug || product._id}`;

      // Availability
      const availability = product.stock?.available
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock';

      return {
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: name,
          image: primaryImage || '',
          url: productUrl,
          offers: {
            '@type': 'Offer',
            price: price,
            priceCurrency: currency,
            availability: availability,
            url: productUrl
          }
        }
      };
    })
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
