// lib/hooks/useOrders.js - Enhanced for Week 4

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMyOrders,
  getOrderById,
  getOrderStats,
  createOrder,
  cancelOrder
} from '../api/orders.js';
import { toast } from 'sonner';

/**
 * Hook to get orders with filtering and pagination
 * @param {Object} filters - Query filters
 */
export const useOrders = (filters = {}) => {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: () => getMyOrders(filters),
    staleTime: 1 * 60 * 1000, // 1 minute
    keepPreviousData: true
  });
};

/**
 * Hook to get single order
 */
export const useOrder = (id) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrderById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000
  });
};

/**
 * Hook to get order statistics
 */
export const useOrderStats = () => {
  return useQuery({
    queryKey: ['orderStats'],
    queryFn: getOrderStats,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

/**
 * Hook to create order
 */
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrder,
    onSuccess: (response) => {
      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orderStats'] });
      
      // Clear cart
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      
      toast.success('ההזמנה נוצרה בהצלחה!');
      
      return response;
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'שגיאה ביצירת הזמנה';
      toast.error(message);
    }
  });
};

/**
 * Hook to cancel order
 */
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelOrder,
    onMutate: async (orderId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['order', orderId] });
      await queryClient.cancelQueries({ queryKey: ['orders'] });

      // Snapshot previous values
      const previousOrder = queryClient.getQueryData(['order', orderId]);
      const previousOrders = queryClient.getQueryData(['orders']);

      // Optimistically update order
      queryClient.setQueryData(['order', orderId], (old) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            status: 'cancelled'
          }
        };
      });

      return { previousOrder, previousOrders };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orderStats'] });
      toast.success('ההזמנה בוטלה בהצלחה');
    },
    onError: (error, orderId, context) => {
      // Rollback on error
      if (context?.previousOrder) {
        queryClient.setQueryData(['order', orderId], context.previousOrder);
      }
      if (context?.previousOrders) {
        queryClient.setQueryData(['orders'], context.previousOrders);
      }
      const message = error.response?.data?.message || 'שגיאה בביטול הזמנה';
      toast.error(message);
    }
  });
};