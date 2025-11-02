// components/admin/AdminSidebar.jsx - Week 5: Admin Navigation

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  LogOut,
  Folder
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  {
    name: 'לוח בקרה',
    href: '/admin',
    icon: LayoutDashboard
  },
  {
    name: 'קטגוריות',
    href: '/admin/categories',
    icon: Folder
  },
  {
    name: 'מוצרים',
    href: '/admin/products',
    icon: Package
  },
  {
    name: 'הזמנות',
    href: '/admin/orders',
    icon: ShoppingCart
  },
  {
    name: 'משתמשים',
    href: '/admin/users',
    icon: Users
  }
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <>
      {/* Mobile Sidebar Backdrop */}
      <div className="lg:hidden fixed inset-0 bg-gray-900/50 z-40 hidden" id="sidebar-backdrop"></div>

      {/* Sidebar */}
      <aside className="fixed top-0 right-0 h-full w-64 bg-white border-l border-gray-200 z-50 transform lg:translate-x-0 transition-transform duration-300">
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">
            Admin Panel
          </h1>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
                           (item.href !== '/admin' && pathname?.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-blue-50 text-blue-600 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>התנתק</span>
          </button>
        </div>
      </aside>
    </>
  );
}
