import ProductCard from './ProductCard';
import EmptyState from '../shared/EmptyState';

export default function ProductList({ products, onReset }) {
  if (!products || products.length === 0) {
    return (
      <EmptyState
        title="אין מוצרים להצגה"
        description="נסה לשנות את הפילטרים או לחפש מוצר אחר"
        action={{
          onClick: onReset,
          label: 'צפה בכל המוצרים'
        }}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}