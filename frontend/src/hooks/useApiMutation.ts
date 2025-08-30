import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { apiClient } from '../config/api';
import { handleApiError } from '../utils/apiError';

type HttpMethod = 'post' | 'put' | 'patch' | 'delete';

export function useApiMutation<TData = unknown, TVariables = unknown, TError = AxiosError>(
  url: string,
  method: HttpMethod = 'post',
  options?: Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'>
): UseMutationResult<TData, TError, TVariables> {
  return useMutation<TData, TError, TVariables>({
    mutationFn: async (data) => {
      try {
        const response = await apiClient[method]<TData>(
          url,
          method === 'delete' && Object.keys(data || {}).length === 0 ? undefined : data
        );
        return response.data;
      } catch (error) {
        return handleApiError(error);
      }
    },
    ...options,
  });
}
