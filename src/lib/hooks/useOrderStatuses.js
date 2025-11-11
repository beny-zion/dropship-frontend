// lib/hooks/useOrderStatuses.js - Order Statuses Hooks

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as orderStatusesApi from '../api/orderStatuses';
import { useMemo } from 'react';

/**
 * Hook to fetch order statuses
 */
export const useOrderStatuses = () => {
  return useQuery({
    queryKey: ['order-statuses'],
    queryFn: orderStatusesApi.getOrderStatuses,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
  });
};

/**
 * Hook to get status configuration as object (for easy lookup)
 */
export const useStatusConfig = () => {
  const { data, isLoading } = useOrderStatuses();

  const statusConfig = useMemo(() => {
    if (!data?.data) return {};

    return data.data.reduce((acc, status) => {
      acc[status.key] = {
        label: status.label_he,
        className: `${status.bgColor} ${status.textColor}`,
        color: status.color,
        bgColor: status.bgColor,
        textColor: status.textColor,
        order: status.order,
        description: status.description
      };
      return acc;
    }, {});
  }, [data]);

  return { statusConfig, isLoading };
};

/**
 * Hook to get status labels as object
 */
export const useStatusLabels = () => {
  const { data, isLoading } = useOrderStatuses();

  const statusLabels = useMemo(() => {
    if (!data?.data) return {};

    return data.data.reduce((acc, status) => {
      acc[status.key] = status.label_he;
      return acc;
    }, {});
  }, [data]);

  return { statusLabels, isLoading };
};

/**
 * Hook to get status colors as object
 */
export const useStatusColors = () => {
  const { data, isLoading } = useOrderStatuses();

  const statusColors = useMemo(() => {
    if (!data?.data) return {};

    return data.data.reduce((acc, status) => {
      acc[status.key] = `${status.bgColor} ${status.textColor}`;
      return acc;
    }, {});
  }, [data]);

  return { statusColors, isLoading };
};

// =============== ADMIN HOOKS ===============

/**
 * Hook to fetch all order statuses (Admin)
 */
export const useOrderStatusesAdmin = () => {
  return useQuery({
    queryKey: ['order-statuses', 'admin'],
    queryFn: orderStatusesApi.getAllOrderStatusesAdmin,
  });
};

/**
 * Hook to create order status (Admin)
 */
export const useCreateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orderStatusesApi.createOrderStatus,
    onSuccess: () => {
      queryClient.invalidateQueries(['order-statuses']);
    },
  });
};

/**
 * Hook to update order status (Admin)
 */
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => orderStatusesApi.updateOrderStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['order-statuses']);
    },
  });
};

/**
 * Hook to delete order status (Admin)
 */
export const useDeleteOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orderStatusesApi.deleteOrderStatus,
    onSuccess: () => {
      queryClient.invalidateQueries(['order-statuses']);
    },
  });
};

/**
 * Hook to reorder statuses (Admin)
 */
export const useReorderStatuses = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orderStatusesApi.reorderStatuses,
    onSuccess: () => {
      queryClient.invalidateQueries(['order-statuses']);
    },
  });
};

export default {
  useOrderStatuses,
  useStatusConfig,
  useStatusLabels,
  useStatusColors,
  useOrderStatusesAdmin,
  useCreateOrderStatus,
  useUpdateOrderStatus,
  useDeleteOrderStatus,
  useReorderStatuses
};
