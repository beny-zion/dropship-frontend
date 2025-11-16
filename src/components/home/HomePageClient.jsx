'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function HomePageClient() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="w-full">
      {/* Hero Section with Logo and Title */}
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="flex flex-col items-center justify-center mb-8">
          <Image
            src="/logo-full.svg"
            alt="TORINO Logo"
            width={200}
            height={80}
            className="mb-6"
          />
          
          <p className="text-xl md:text-2xl text-gray-600 font-light tracking-wide" style={{ letterSpacing: '0.1em' }}>
            יבוא אישי של מותגי אופנה יוקרתיים
          </p>
        </div>
      </div>

      {/* Two Large Images Side by Side */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Left Image */}
        <div className="relative w-full h-[400px] md:h-[600px] overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center">
            <div className="text-center text-white p-8">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-wider" style={{ fontFamily: 'serif' }}>
                WOMEN'S
              </h2>
              <p className="text-lg md:text-xl font-light mb-6 tracking-wide">
                קולקציית נשים
              </p>
              <Link href="/products?category=women">
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-black transition-all duration-300 px-8 py-6 text-lg tracking-wider"
                >
                  גלי את הקולקציה
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Image */}
        <div className="relative w-full h-[400px] md:h-[600px] overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900 to-amber-700 flex items-center justify-center">
            <div className="text-center text-white p-8">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-wider" style={{ fontFamily: 'serif' }}>
                MEN'S
              </h2>
              <p className="text-lg md:text-xl font-light mb-6 tracking-wide">
                קולקציית גברים
              </p>
              <Link href="/products?category=men">
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-black transition-all duration-300 px-8 py-6 text-lg tracking-wider"
                >
                  גלה את הקולקציה
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* User Authentication Section */}
      {!isAuthenticated && (
        <div className="container mx-auto px-4 py-16 text-center">
          <h3 className="text-3xl font-light mb-6 tracking-wide" style={{ letterSpacing: '0.1em' }}>
            הצטרף למשפחת TORINO
          </h3>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            גלה את קולקציות האופנה היוקרתיות שלנו והצטרף לחוויית קנייה בלעדית
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8 py-6 tracking-wide bg-black hover:bg-gray-800">
                הירשם עכשיו
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 tracking-wide border-black text-black hover:bg-black hover:text-white">
                התחבר
              </Button>
            </Link>
          </div>
        </div>
      )}

      {isAuthenticated && (
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-2xl font-light mb-6 tracking-wide">
            שלום {user?.firstName}, ברוך שובך ל-TORINO
          </p>
          <Link href="/products">
            <Button size="lg" className="text-lg px-8 py-6 tracking-wide bg-black hover:bg-gray-800">
              גלה את הקולקציה החדשה
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
