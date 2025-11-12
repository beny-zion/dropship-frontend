import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../api/products';

export function useProducts(params = {}, options = {}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsApi.getProducts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

export function useProduct(id, options = {}) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getProduct(id),
    enabled: !!id && (options.enabled !== false),
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: productsApi.getCategories,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}