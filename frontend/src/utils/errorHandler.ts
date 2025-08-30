import { AxiosError } from 'axios';
import { toast } from '../components/ui/toast';
import { ApiError } from '../types/api';

export const handleApiError = (error: unknown, defaultMessage = 'An unexpected error occurred'): never => {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiError | undefined;
    const message = apiError?.message || error.message || defaultMessage;
    
    // Show error toast
    toast.error('Error', message);

    // Handle specific error codes
    if (error.response?.status === 401) {
      // Handle unauthorized
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Handle forbidden
      console.error('Forbidden:', message);
    } else if (error.response?.status === 404) {
      // Handle not found
      console.error('Not Found:', message);
    } else if (error.response?.status === 500) {
      // Handle server error
      console.error('Server Error:', message);
    }
    
    throw new Error(message);
  }
  
  // Handle non-API errors
  const errorMessage = error instanceof Error ? error.message : String(error);
  toast({
    title: 'Error',
    description: errorMessage,
    variant: 'destructive',
  });
  
  throw new Error(errorMessage);
};

// Helper to safely call async functions with error handling
export const withErrorHandling = async <T>(
  fn: () => Promise<T>,
  options?: {
    onError?: (error: unknown) => void;
    errorMessage?: string;
  }
): Promise<T | undefined> => {
  try {
    return await fn();
  } catch (error) {
    const errorHandler = options?.onError || handleApiError;
    errorHandler(error, options?.errorMessage);
    return undefined;
  }
};
