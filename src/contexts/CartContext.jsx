'use client';

import { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import { cartApi } from '@/lib/api/cart';
import { toast } from 'sonner';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // ⭐ Fetch cart from server
  const { data: cartData, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.getCart,
    enabled: isAuthenticated,
    staleTime: 0, // Always fresh
  });

  const cart = cartData?.data || {
    items: [],
    pricing: {
      subtotal: 0,
      tax: 0,
      shipping: 0,
      total: 0
    }
  };

  // Add to cart mutation
  const addMutation = useMutation({
    mutationFn: ({ productId, quantity }) => cartApi.addToCart(productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
    },
    onError: (error) => {
      console.error('Add to cart error:', error);
    }
  });

  // Update quantity mutation
  const updateMutation = useMutation({
    mutationFn: ({ productId, quantity }) => cartApi.updateCartItem(productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
    }
  });

  // Remove mutation
  const removeMutation = useMutation({
    mutationFn: (productId) => cartApi.removeFromCart(productId),
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
    }
  });

  // Clear mutation
  const clearMutation = useMutation({
    mutationFn: () => cartApi.clearCart(),
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
    }
  });

  // Helper functions
  const addToCart = async (product, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error('נא להתחבר תחילה');
      return;
    }

    try {
      await addMutation.mutateAsync({
        productId: product._id,
        quantity
      });
      toast.success('המוצר נוסף לעגלה!');
    } catch (error) {
      toast.error(error.message || 'שגיאה בהוספה לעגלה');
      throw error;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      await updateMutation.mutateAsync({ productId, quantity });
    } catch (error) {
      toast.error('שגיאה בעדכון כמות');
      throw error;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await removeMutation.mutateAsync(productId);
      toast.success('המוצר הוסר מהעגלה');
    } catch (error) {
      toast.error('שגיאה בהסרה מהעגלה');
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await clearMutation.mutateAsync();
    } catch (error) {
      toast.error('שגיאה בניקוי עגלה');
      throw error;
    }
  };

  const getItemCount = () => {
    if (!cart.items) return 0;
    return cart.items.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cart,
    loading: isLoading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getItemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}