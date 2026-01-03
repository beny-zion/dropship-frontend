// Category Schema.org JSON-LD for SEO
// Helps Google understand category pages with CollectionPage and Breadcrumbs

export default function CategorySchema({ category, url, productCount }) {
  if (!category) return null;

  // Category name - prefer Hebrew
  const name = category.name_he || category.name_en || 'Category';

  // Description - prefer Hebrew
  const description = category.description_he || category.description_en || `קטגוריית ${name} - מוצרים מקוריים ממותגים מובילים`;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.torinoil.com';

  // Build the Schema.org JSON-LD for CollectionPage
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: name,
    description: description,
    url: url || '',
    isPartOf: {
      '@type': 'WebSite',
      name: 'TORINO',
      url: siteUrl
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'דף הבית',
          item: siteUrl
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: name,
          item: url || ''
        }
      ]
    }
  };

  // Add product count if available
  if (productCount && productCount > 0) {
    schema.numberOfItems = productCount;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
