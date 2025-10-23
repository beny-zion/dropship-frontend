import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function EmptyState({
  title = 'אין תוצאות',
  description = 'לא נמצאו מוצרים התואמים לחיפוש',
  icon = '📦',
  action
}) {
  return (
    <div className="text-center py-12">
      <div className="text-gray-400 text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      {action && (
        action.href ? (
          <Link href={action.href}>
            <Button>{action.label}</Button>
          </Link>
        ) : (
          <Button onClick={action.onClick}>{action.label}</Button>
        )
      )}
    </div>
  );
}