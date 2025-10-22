import { Button } from '@/components/ui/button';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="text-center py-12">
      <div className="text-red-500 text-6xl mb-4">⚠️</div>
      <h3 className="text-xl font-semibold mb-2">אופס! משהו השתבש</h3>
      <p className="text-gray-600 mb-4">{message || 'שגיאה בטעינת הנתונים'}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          נסה שוב
        </Button>
      )}
    </div>
  );
}