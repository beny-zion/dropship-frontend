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
  Folder,
  Home,
  Image,
  Settings,
  ClipboardCheck,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminSidebar } from '@/contexts/AdminSidebarContext';

const navItems = [
  {
    name: 'לוח בקרה',
    href: '/admin',
    icon: LayoutDashboard
  },
  {
    name: 'דף הבית',
    href: '/admin/homepage',
    icon: Home
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
    name: 'בדיקת זמינות',
    href: '/admin/inventory',
    icon: ClipboardCheck
  },
  {
    name: 'הזמנות',
    href: '/admin/orders',
    icon: ShoppingCart,
    subItems: [
      {
        name: 'כל ההזמנות',
        href: '/admin/orders'
      },
      {
        name: 'הזמנות מרוכזות',
        href: '/admin/orders/bulk-by-supplier'
      }
    ]
  },
  // Phase 10 - DISABLED
  // {
  //   name: 'החזרים',
  //   href: '/admin/refunds',
  //   icon: RotateCcw
  // },
  {
    name: 'משתמשים',
    href: '/admin/users',
    icon: Users
  },
  {
    name: 'ניהול מדיה',
    href: '/admin/media',
    icon: Image
  },
  {
    name: 'הגדרות',
    href: '/admin/settings',
    icon: Settings
  }
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { isSidebarOpen, closeSidebar } = useAdminSidebar();

  return (
    <>
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-gray-900/50 z-40 transition-opacity duration-300"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 right-0 h-full w-64 bg-white border-l border-gray-200 z-50
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200 flex-shrink-0">
          <h1 className="text-xl font-bold text-blue-600">
            Admin Panel
          </h1>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
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

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
                           (item.href !== '/admin' && pathname?.startsWith(item.href));
            const Icon = item.icon;

            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => closeSidebar()}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${isActive
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>

                {/* Sub Items */}
                {item.subItems && item.subItems.length > 0 && (
                  <div className="mr-8 mt-1 space-y-1">
                    {item.subItems.map((subItem) => {
                      const isSubActive = pathname === subItem.href;
                      return (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          onClick={() => closeSidebar()}
                          className={`
                            block px-4 py-2 text-sm rounded-lg transition-colors
                            ${isSubActive
                              ? 'bg-blue-50 text-blue-600 font-medium'
                              : 'text-gray-600 hover:bg-gray-50'
                            }
                          `}
                        >
                          {subItem.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>התנתק</span>
          </button>
        </div>
      </aside>
    </>
  );
}
