// components/admin/AdminHeader.jsx - Week 5: Admin Header

'use client';

import { Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminSidebar } from '@/contexts/AdminSidebarContext';

export default function AdminHeader() {
  const { toggleSidebar } = useAdminSidebar();

  return (
    <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between">
        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          onClick={toggleSidebar}
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Page Title - will be set by individual pages */}
        <div className="flex-1"></div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
