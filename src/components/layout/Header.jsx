'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext'; // ⭐ חדש
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react'; // ⭐ חדש
import UserMenu from './UserMenu';

export default function Header() {
  const { isAuthenticated } = useAuth();
  const { getItemCount } = useCart(); // ⭐ חדש
  const itemCount = getItemCount(); // ⭐ חדש

  return (
    <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-blue-600">
            שופינג סמארט
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/products" className="hover:text-blue-600 transition">
              מוצרים
            </Link>
            <Link href="/about" className="hover:text-blue-600 transition">
              אודות
            </Link>
          </nav>

          {/* User Actions */}
          <div className="flex items-center gap-4">
            {/* ⭐ Cart Badge */}
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>

            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    התחבר
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">הרשם</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}