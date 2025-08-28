import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-lg transition-all duration-200",
        secondary: "bg-secondary-600 text-white hover:bg-secondary-700 shadow-md hover:shadow-lg transition-all duration-200",
        outline: "border border-primary-500 bg-transparent text-primary-600 hover:bg-primary-50 dark:border-primary-400 dark:text-primary-50 dark:hover:bg-primary-900/50",
        ghost: "hover:bg-primary-100 hover:text-primary-600 dark:hover:bg-primary-800/50 dark:hover:text-primary-50",
        link: "text-primary-600 underline-offset-4 hover:underline dark:text-primary-400",
        glass: "glass hover:bg-opacity-80 hover:shadow-lg transition-all duration-200 text-white border border-white/20",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-lg px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
