import { AxiosError } from 'axios';

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export function handleApiError(error: unknown): never {
  if (error instanceof AxiosError) {
    const response = error.response?.data;
    const message = response?.message || error.message;
    const status = error.response?.status || 500;
    const errors = response?.errors;
    
    throw new ApiError(message, status, errors);
  }
  
  throw new ApiError('An unexpected error occurred', 500);
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
