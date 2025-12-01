import React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, type = "text", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            "w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all duration-200",
            error && "border-red-500 focus:border-red-500 focus:ring-red-200",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

