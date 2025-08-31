import { useMutation, type UseMutationOptions, type UseMutationResult } from '@tanstack/react-query';
import type { AxiosError, AxiosResponse } from 'axios';
import { apiClient } from '@/config/api';

type HttpMethod = 'post' | 'put' | 'patch' | 'delete';

/**
 * A custom hook for making API mutations with proper TypeScript support
 * @param url The API endpoint URL
 * @param method The HTTP method to use (default: 'post')
 * @param options Additional React Query mutation options
 * @returns A mutation function and state from React Query
 */
export function useApiMutation<TData = unknown, TVariables = unknown, TError = AxiosError>(
  url: string,
  method: HttpMethod = 'post',
  options?: Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'>
): UseMutationResult<TData, TError, TVariables> {
  return useMutation<TData, TError, TVariables>({
    mutationFn: async (data: TVariables): Promise<TData> => {
      // Type assertion to handle the different method signatures
      const response = await (apiClient[method] as <T>(
        url: string, 
        data?: unknown
      ) => Promise<AxiosResponse<T>>)(
        url,
        method === 'delete' && data && Object.keys(data as Record<string, unknown>).length === 0 
          ? undefined 
          : data
      );
      return response.data as TData;
    },
    ...options,
  });
}
