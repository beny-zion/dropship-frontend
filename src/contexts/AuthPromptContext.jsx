'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { usePathname } from 'next/navigation';
import AuthModal from '@/components/auth/AuthModal';

const AuthPromptContext = createContext({});

export const useAuthPrompt = () => useContext(AuthPromptContext);

export function AuthPromptProvider({ children }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [showModal, setShowModal] = useState(false);
  const [hasShownModal, setHasShownModal] = useState(false);

  useEffect(() => {
    // Don't show if user is already logged in
    if (user) return;

    // Don't show on login/register pages
    if (pathname === '/login' || pathname === '/register') return;

    // Don't show if already shown in this session
    if (hasShownModal) return;

    // Set timer for 2 minutes (120000 milliseconds)
    const timer = setTimeout(() => {
      setShowModal(true);
      setHasShownModal(true);
    }, 120000);

    // Cleanup timer on unmount
    return () => clearTimeout(timer);
  }, [user, pathname, hasShownModal]);

  const handleClose = () => {
    setShowModal(false);
  };

  return (
    <AuthPromptContext.Provider value={{}}>
      {children}
      <AuthModal isOpen={showModal} onClose={handleClose} />
    </AuthPromptContext.Provider>
  );
}
