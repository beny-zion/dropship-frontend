import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../api/products';

export function useProducts(params = {}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsApi.getProducts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useProduct(id) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getProduct(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: productsApi.getCategories,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}