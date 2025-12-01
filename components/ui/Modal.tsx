"use client"

import React, { useEffect } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./Button"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl"
  showCloseButton?: boolean
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      // Use setTimeout to ensure cleanup happens after modal unmounts
      setTimeout(() => {
        document.body.style.overflow = ""
      }, 100)
    }
    return () => {
      // Cleanup on unmount
      setTimeout(() => {
        // Only reset if no other modals are open
        const hasOtherModals = document.querySelector('[class*="fixed"][class*="inset-0"][class*="z-50"]')
        if (!hasOtherModals) {
          document.body.style.overflow = ""
        }
      }, 100)
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizes: Record<ModalProps["size"], string> = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={cn(
          "bg-white rounded-2xl shadow-2xl w-full relative max-h-[90vh] overflow-y-auto",
          sizes[size]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
            {title && (
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

