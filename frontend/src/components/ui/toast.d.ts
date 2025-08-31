import * as React from 'react';

declare module '@/components/ui/toast' {
  interface ToastProps {
    id?: string;
    title: string;
    description?: string;
    variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
    onDismiss?: () => void;
    duration?: number;
  }

  interface ToastContextType {
    toasts: ToastProps[];
    addToast: (toast: Omit<ToastProps, 'id'>) => void;
    removeToast: (id: string) => void;
  }

  export const ToastProvider: React.FC<{ children: React.ReactNode }>;
  export const useToast: () => ToastContextType;
  export const toast: (title: string, options?: Omit<ToastProps, 'title'>) => void;
  export const success: (title: string, description?: string, options?: Omit<ToastProps, 'title' | 'description' | 'variant'>) => void;
  export const error: (title: string, description?: string, options?: Omit<ToastProps, 'title' | 'description' | 'variant'>) => void;
  export const warning: (title: string, description?: string, options?: Omit<ToastProps, 'title' | 'description' | 'variant'>) => void;
  export const info: (title: string, description?: string, options?: Omit<ToastProps, 'title' | 'description' | 'variant'>) => void;
}
