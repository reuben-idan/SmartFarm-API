import * as React from "react"
import { cn } from "@/lib/utils"

const Avatar = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    src?: string
    alt?: string
    fallback?: React.ReactNode
    size?: "sm" | "md" | "lg" | "xl"
  }
>(({ className, src, alt, fallback, size = "md", ...props }, ref) => {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg"
  }

  return (
    <span
      ref={ref}
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full bg-muted",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt || ""}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center rounded-full bg-muted text-muted-foreground">
          {fallback}
        </span>
      )}
    </span>
  )
})
Avatar.displayName = "Avatar"

export { Avatar }
