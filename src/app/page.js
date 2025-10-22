'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold mb-6">
          ברוכים הבאים לשופינג סמארט
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          המוצרים הטובים ביותר מאמזון, במחירים הכי משתלמים, עם משלוח עד הבית
        </p>

        {isAuthenticated ? (
          <div className="space-y-4">
            <p className="text-lg">
              שלום {user.firstName}, שמחים לראות אותך שוב! 👋
            </p>
            <Link href="/products">
              <Button size="lg">צפה במוצרים</Button>
            </Link>
          </div>
        ) : (
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg">הצטרף עכשיו</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                התחבר
              </Button>
            </Link>
          </div>
        )}

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="p-6 border rounded-lg">
            <div className="text-4xl mb-4">🚚</div>
            <h3 className="text-xl font-semibold mb-2">משלוח עד הבית</h3>
            <p className="text-gray-600">
              אנחנו דואגים להכל - המוצר יגיע ישירות לפתח ביתך
            </p>
          </div>

          <div className="p-6 border rounded-lg">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold mb-2">מחירים משתלמים</h3>
            <p className="text-gray-600">
              מחירים טובים יותר מהחנויות בישראל, ללא מאמץ
            </p>
          </div>

          <div className="p-6 border rounded-lg">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-xl font-semibold mb-2">מוצרים מובחרים</h3>
            <p className="text-gray-600">
              רק מוצרים איכוtiים עם ביקורות מעולות
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}