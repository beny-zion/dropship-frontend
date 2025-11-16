'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const AdminSidebarContext = createContext();

export function AdminSidebarProvider({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on route change (for mobile)
  useEffect(() => {
    const handleResize = () => {
      // Auto-close on mobile when resizing to desktop
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <AdminSidebarContext.Provider value={{ isSidebarOpen, toggleSidebar, closeSidebar }}>
      {children}
    </AdminSidebarContext.Provider>
  );
}

export function useAdminSidebar() {
  const context = useContext(AdminSidebarContext);
  if (!context) {
    throw new Error('useAdminSidebar must be used within AdminSidebarProvider');
  }
  return context;
}
