// lib/hooks/useAddresses.js - Week 4

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAddresses,
  getAddress,
  getDefaultAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} from '../api/users.js';
import { toast } from 'sonner';

/**
 * Hook to get all user addresses
 */
export const useAddresses = () => {
  return useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const response = await getAddresses();
      // Extract data array from response
      return response?.data || [];
    },
    staleTime: 2 * 60 * 1000 // 2 minutes
  });
};

/**
 * Hook to get single address
 */
export const useAddress = (id) => {
  return useQuery({
    queryKey: ['address', id],
    queryFn: () => getAddress(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000
  });
};

/**
 * Hook to get default address
 */
export const useDefaultAddress = () => {
  return useQuery({
    queryKey: ['address', 'default'],
    queryFn: getDefaultAddress,
    staleTime: 2 * 60 * 1000
  });
};

/**
 * Hook to create new address
 */
export const useCreateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAddress,
    onMutate: async (newAddress) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['addresses'] });

      // Snapshot previous value
      const previousAddresses = queryClient.getQueryData(['addresses']);

      // Optimistically update
      queryClient.setQueryData(['addresses'], (old) => {
        if (!old) return old;
        // Handle both array and object with data property
        const addresses = Array.isArray(old) ? old : (old.data || []);
        return [...addresses, { ...newAddress, _id: 'temp-' + Date.now() }];
      });

      return { previousAddresses };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('כתובת נוספה בהצלחה');
    },
    onError: (error, _, context) => {
      // Rollback on error
      if (context?.previousAddresses) {
        queryClient.setQueryData(['addresses'], context.previousAddresses);
      }
      const message = error.response?.data?.message || 'שגיאה בהוספת כתובת';
      toast.error(message);
    }
  });
};

/**
 * Hook to update address
 */
export const useUpdateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateAddress(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['addresses'] });
      const previousAddresses = queryClient.getQueryData(['addresses']);

      // Optimistic update
      queryClient.setQueryData(['addresses'], (old) => {
        if (!old) return old;
        // Handle both array and object with data property
        const addresses = Array.isArray(old) ? old : (old.data || []);
        return addresses.map((addr) =>
          addr._id === id ? { ...addr, ...data } : addr
        );
      });

      return { previousAddresses };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('כתובת עודכנה בהצלחה');
    },
    onError: (error, _, context) => {
      if (context?.previousAddresses) {
        queryClient.setQueryData(['addresses'], context.previousAddresses);
      }
      const message = error.response?.data?.message || 'שגיאה בעדכון כתובת';
      toast.error(message);
    }
  });
};

/**
 * Hook to delete address
 */
export const useDeleteAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAddress,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['addresses'] });
      const previousAddresses = queryClient.getQueryData(['addresses']);

      // Optimistic update
      queryClient.setQueryData(['addresses'], (old) => {
        if (!old) return old;
        // Handle both array and object with data property
        const addresses = Array.isArray(old) ? old : (old.data || []);
        return addresses.filter((addr) => addr._id !== id);
      });

      return { previousAddresses };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('כתובת נמחקה בהצלחה');
    },
    onError: (error, _, context) => {
      if (context?.previousAddresses) {
        queryClient.setQueryData(['addresses'], context.previousAddresses);
      }
      const message = error.response?.data?.message || 'שגיאה במחיקת כתובת';
      toast.error(message);
    }
  });
};

/**
 * Hook to set default address
 */
export const useSetDefaultAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setDefaultAddress,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['addresses'] });
      const previousAddresses = queryClient.getQueryData(['addresses']);

      // Optimistic update
      queryClient.setQueryData(['addresses'], (old) => {
        if (!old) return old;
        // Handle both array and object with data property
        const addresses = Array.isArray(old) ? old : (old.data || []);
        return addresses.map((addr) => ({
          ...addr,
          isDefault: addr._id === id
        }));
      });

      return { previousAddresses };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      queryClient.invalidateQueries({ queryKey: ['address', 'default'] });
      toast.success('כתובת ברירת המחדל עודכנה');
    },
    onError: (error, _, context) => {
      if (context?.previousAddresses) {
        queryClient.setQueryData(['addresses'], context.previousAddresses);
      }
      const message = error.response?.data?.message || 'שגיאה בעדכון כתובת';
      toast.error(message);
    }
  });
};