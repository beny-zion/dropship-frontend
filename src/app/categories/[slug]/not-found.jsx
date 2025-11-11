import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search } from 'lucide-react';

export default function CategoryNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <svg
            className="mx-auto h-32 w-32 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4" dir="rtl">
          קטגוריה לא נמצאה
        </h1>

        <p className="text-lg text-gray-600 mb-8" dir="rtl">
          מצטערים, הקטגוריה שחיפשת אינה קיימת במערכת שלנו.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              <Home className="h-5 w-5" />
              <span>חזרה לדף הבית</span>
            </Button>
          </Link>

          <Link href="/products">
            <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
              <Search className="h-5 w-5" />
              <span>חפש מוצרים</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
