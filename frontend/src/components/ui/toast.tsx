import { Toaster as SonnerToaster } from 'sonner'

const Toaster = () => {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          error: 'group-[.toaster]:!bg-destructive group-[.toaster]:!text-destructive-foreground',
          success: 'group-[.toaster]:!bg-success group-[.toaster]:!text-success-foreground',
          warning: 'group-[.toaster]:!bg-warning group-[.toaster]:!text-warning-foreground',
          info: 'group-[.toaster]:!bg-info group-[.toaster]:!text-info-foreground',
        },
      }}
    />
  )
}

export { Toaster }