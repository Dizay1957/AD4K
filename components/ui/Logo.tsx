"use client"

import Image from "next/image"
import Link from "next/link"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const sizes = {
    sm: { image: 24, text: "text-lg" },
    md: { image: 32, text: "text-xl" },
    lg: { image: 48, text: "text-2xl" },
  }

  const { image: imageSize, text: textSize } = sizes[size]

  return (
    <Link href="/dashboard" className="flex items-center space-x-3 group">
      <div className="relative flex-shrink-0">
        <div className={`relative ${size === "sm" ? "w-8 h-8" : size === "lg" ? "w-16 h-16" : "w-12 h-12"}`}>
          <Image
            src="/logo.png"
            alt="AD4K Logo"
            width={size === "sm" ? 32 : size === "lg" ? 64 : 48}
            height={size === "sm" ? 32 : size === "lg" ? 64 : 48}
            className="w-full h-full object-contain"
            priority
            unoptimized
          />
        </div>
      </div>
      {showText && (
        <span className={`font-bold ${textSize} bg-gradient-to-r from-primary-600 via-accent-600 to-glow-pink bg-clip-text text-transparent`}>
          AD4K
        </span>
      )}
    </Link>
  )
}

