import { toast as sonnerToast } from 'sonner'

type ToastType = {
  title: string
  description?: string
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info'
  duration?: number
}

const toast = ({ title, description, variant = 'default', duration = 5000 }: ToastType) => {
  const baseOptions = {
    duration,
    position: 'top-right' as const,
    closeButton: true,
  }

  switch (variant) {
    case 'success':
      return sonnerToast.success(title, {
        ...baseOptions,
        description,
      })
    case 'destructive':
      return sonnerToast.error(title, {
        ...baseOptions,
        description,
      })
    case 'warning':
      return sonnerToast.warning(title, {
        ...baseOptions,
        description,
      })
    case 'info':
      return sonnerToast.info(title, {
        ...baseOptions,
        description,
      })
    default:
      return sonnerToast(title, {
        ...baseOptions,
        description,
      })
  }
}

// Helper methods for common toast variants
toast.success = (title: string, description?: string, duration?: number) =>
  toast({ title, description, variant: 'success', duration })

toast.error = (title: string, description?: string, duration?: number) =>
  toast({ title, description, variant: 'destructive', duration })

toast.warning = (title: string, description?: string, duration?: number) =>
  toast({ title, description, variant: 'warning', duration })

toast.info = (title: string, description?: string, duration?: number) =>
  toast({ title, description, variant: 'info', duration })

const useToast = () => {
  return {
    toast,
    dismiss: sonnerToast.dismiss,
  }
}

export { useToast, toast }