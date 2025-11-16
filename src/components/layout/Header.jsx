'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, Menu, X, User, Package, MapPin, Settings, LogOut } from 'lucide-react';
import UserMenu from './UserMenu';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();
  const { getItemCount } = useCart();
  const itemCount = getItemCount();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    const SHRINK_THRESHOLD = 80; // Scroll down threshold
    const EXPAND_THRESHOLD = 40; // Scroll up threshold - creates hysteresis

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // Use hysteresis: different thresholds for shrinking vs expanding
          if (currentScrollY > SHRINK_THRESHOLD) {
            setIsScrolled(true);
          } else if (currentScrollY < EXPAND_THRESHOLD) {
            setIsScrolled(false);
          }
          // Between EXPAND_THRESHOLD and SHRINK_THRESHOLD: maintain current state

          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header
        className={`border-b border-neutral-200 bg-white sticky top-0 z-50 transition-all duration-300 will-change-transform ${
          isScrolled ? 'py-2 shadow-md' : 'py-5'
        }`}
        style={{ transform: 'translateZ(0)' }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="hover:opacity-80 transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Image
                src="/logo-full.svg"
                alt="TORINO"
                width={isScrolled ? 140 : 180}
                height={isScrolled ? 40 : 50}
                priority
                className="transition-all duration-300"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="/products"
                className="text-sm font-light tracking-wide hover:opacity-100 transition-opacity"
              >
                מוצרים
              </Link>
              <Link
                href="/about"
                className="text-sm font-light tracking-wide hover:opacity-100 transition-opacity"
              >
                אודות
              </Link>
            </nav>

            {/* User Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Cart Badge */}
              <Link href="/cart" className="relative group">
                <button
                  className={`p-2 hover:bg-neutral-50 transition-all rounded-full ${
                    isScrolled ? 'p-1.5' : 'p-2'
                  }`}
                  aria-label="עגלת קניות"
                >
                  <ShoppingCart className={`transition-all ${isScrolled ? 'h-4 w-4' : 'h-5 w-5'}`} />
                  {itemCount > 0 && (
                    <span
                      className={`absolute -top-1 -right-1 bg-black text-white text-xs flex items-center justify-center font-light rounded-full transition-all ${
                        isScrolled ? 'h-4 w-4 text-[10px]' : 'h-5 w-5'
                      }`}
                    >
                      {itemCount > 99 ? '99+' : itemCount}
                    </span>
                  )}
                </button>
              </Link>

              {/* Desktop Auth Buttons */}
              <div className="hidden md:flex items-center gap-2">
                {isAuthenticated ? (
                  <UserMenu />
                ) : (
                  <>
                    <Link href="/login">
                      <button
                        className={`px-4 text-sm font-light tracking-wide hover:bg-neutral-50 transition-all rounded ${
                          isScrolled ? 'py-1.5' : 'py-2'
                        }`}
                      >
                        התחבר
                      </button>
                    </Link>
                    <Link href="/register">
                      <button
                        className={`px-4 bg-black text-white text-sm font-light tracking-wide hover:bg-neutral-800 transition-all rounded ${
                          isScrolled ? 'py-1.5' : 'py-2'
                        }`}
                      >
                        הרשם
                      </button>
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 hover:bg-neutral-50 transition-colors rounded"
                aria-label="תפריט"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`fixed right-0 w-64 h-full bg-white shadow-xl z-40 transform transition-transform duration-300 md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          top: isScrolled ? 'calc(2rem + 2.5rem)' : 'calc(2.5rem + 3.125rem)' // Matches header height dynamically
        }}
      >
        <nav className="flex flex-col p-6 gap-4">
          <Link
            href="/products"
            className="text-base font-light tracking-wide hover:bg-neutral-50 py-3 px-4 rounded transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            מוצרים
          </Link>
          <Link
            href="/about"
            className="text-base font-light tracking-wide hover:bg-neutral-50 py-3 px-4 rounded transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            אודות
          </Link>

          <div className="border-t border-neutral-200 mt-4 pt-4">
            {isAuthenticated ? (
              <div className="flex flex-col gap-1">
                {user && (
                  <div className="px-4 py-2 mb-2">
                    <p className="text-sm font-medium">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-neutral-500">{user.email}</p>
                  </div>
                )}

                <Link
                  href="/profile"
                  className="text-base font-light tracking-wide hover:bg-neutral-50 py-3 px-4 rounded transition-colors flex items-center gap-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  הפרופיל שלי
                </Link>
                <Link
                  href="/orders"
                  className="text-base font-light tracking-wide hover:bg-neutral-50 py-3 px-4 rounded transition-colors flex items-center gap-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Package className="h-4 w-4" />
                  ההזמנות שלי
                </Link>
                <Link
                  href="/addresses"
                  className="text-base font-light tracking-wide hover:bg-neutral-50 py-3 px-4 rounded transition-colors flex items-center gap-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <MapPin className="h-4 w-4" />
                  הכתובות שלי
                </Link>
                <Link
                  href="/settings"
                  className="text-base font-light tracking-wide hover:bg-neutral-50 py-3 px-4 rounded transition-colors flex items-center gap-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  הגדרות
                </Link>

                <div className="border-t border-neutral-200 mt-2 pt-2">
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                      router.push('/login');
                    }}
                    className="w-full text-base font-light tracking-wide hover:bg-red-50 py-3 px-4 rounded transition-colors flex items-center gap-2 text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    התנתק
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <button className="w-full px-4 py-2.5 text-sm font-light tracking-wide hover:bg-neutral-50 transition-colors rounded border border-neutral-200">
                    התחבר
                  </button>
                </Link>
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <button className="w-full px-4 py-2.5 bg-black text-white text-sm font-light tracking-wide hover:bg-neutral-800 transition-colors rounded">
                    הרשם
                  </button>
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}
