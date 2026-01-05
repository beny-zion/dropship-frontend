'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { AuthPromptProvider } from '@/contexts/AuthPromptContext';
import { CartProvider } from '@/contexts/CartContext';
import { CsrfProvider } from '@/contexts/CsrfContext'; // 🔒 CSRF Protection
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useState } from 'react';

export function Providers({ children }) {
  // יצירת QueryClient בתוך Client Component
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 5 * 60 * 1000,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <CsrfProvider>
        <AuthProvider>
          <AuthPromptProvider>
            <CartProvider>
              {children}
              <Toaster position="top-center" richColors />
            </CartProvider>
          </AuthPromptProvider>
        </AuthProvider>
      </CsrfProvider>
    </QueryClientProvider>
  );
}
