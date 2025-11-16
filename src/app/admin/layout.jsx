// app/admin/layout.jsx - Week 5: Admin Panel Layout

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AdminSidebarProvider } from '@/contexts/AdminSidebarContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export default function AdminLayout({ children }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not authenticated or not admin
    if (!loading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/login?redirect=/admin');
    }
  }, [user, loading, isAuthenticated, router]);

  // Show loading while checking auth
  if (loading || !user || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">בודק הרשאות...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminSidebarProvider>
      <div className="min-h-screen bg-gray-50" dir="rtl">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <div className="lg:mr-64 min-h-screen">
          {/* Header */}
          <AdminHeader />

          {/* Page Content */}
          <main className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminSidebarProvider>
  );
}
