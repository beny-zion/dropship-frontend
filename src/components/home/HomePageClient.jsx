'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePageClient() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          ברוכים הבאים לשופינג סמארט
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          המוצרים הטובים ביותר מאמזון, במחירים הכי משתלמים, עם משלוח עד הבית
        </p>

        {isAuthenticated ? (
          <div className="space-y-4">
            <p className="text-lg">
              שלום {user?.firstName}, שמחים לראות אותך שוב!
            </p>
            <Link href="/products">
              <Button size="lg" className="text-lg px-8 py-6">
                צפה במוצרים
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8 py-6">
                הצטרף עכשיו
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                התחבר
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
