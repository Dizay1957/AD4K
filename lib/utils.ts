import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d)
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function calculateLevel(xp: number): number {
  // Level formula: XP needed = 100 * level^1.5
  let level = 1
  let xpNeeded = 0
  while (xpNeeded <= xp) {
    level++
    xpNeeded = 100 * Math.pow(level, 1.5)
  }
  return level - 1
}

export function getXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5))
}

