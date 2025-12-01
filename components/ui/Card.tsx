import React from "react"
import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined"
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variants: Record<CardProps["variant"], string> = {
      default: "bg-white border border-gray-200",
      elevated: "bg-white shadow-lg border border-gray-200",
      outlined: "bg-transparent border-2 border-gray-300",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl p-6 transition-all duration-200",
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = "Card"

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("mb-4", className)} {...props} />
  )
)
CardHeader.displayName = "CardHeader"

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-xl font-bold text-gray-900", className)} {...props} />
  )
)
CardTitle.displayName = "CardTitle"

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  )
)
CardContent.displayName = "CardContent"

