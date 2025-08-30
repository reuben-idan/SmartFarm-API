import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { apiClient } from '../config/api';

type QueryKey = [string, Record<string, unknown>?];

export function useApiQuery<TData = unknown, TError = AxiosError>(
  key: string | QueryKey,
  url: string,
  params?: Record<string, unknown>,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>
): UseQueryResult<TData, TError> {
  const queryKey = Array.isArray(key) ? key : [key, params];
  
  return useQuery<TData, TError>({
    queryKey,
    queryFn: async () => {
      const { data } = await apiClient.get<TData>(url, { params });
      return data;
    },
    ...options,
  });
}
