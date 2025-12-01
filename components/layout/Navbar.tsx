"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { 
  LayoutDashboard, 
  CheckSquare, 
  Timer, 
  Music, 
  FileText, 
  Settings,
  LogOut,
  Menu,
  X,
  ChefHat
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/ui/Logo"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/timer", label: "Pomodoro", icon: Timer },
  { href: "/sounds", label: "Sounds", icon: Music },
  { href: "/notes", label: "Notes", icon: FileText },
  { href: "/food", label: "Food", icon: ChefHat },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function Navbar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push("/auth/signin")
    router.refresh()
  }

  // Show navbar optimistically - if we're on an authenticated page, show it
  // Only hide if explicitly unauthenticated
  if (status === "unauthenticated") return null
  
  // Show navbar while loading or if session exists
  // (Pages redirect if not authenticated, so showing navbar is safe)
  // But we need to check session exists before accessing session.user

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Logo size="md" showText={true} />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors",
                    isActive
                      ? "bg-primary-100 text-primary-700 font-semibold"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {session && (
              <div className="flex items-center space-x-2">
                {session.user?.image && (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-sm font-medium text-gray-700">
                  {session.user?.name || session.user?.email}
                </span>
              </div>
            )}
            {session && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors",
                    isActive
                      ? "bg-primary-100 text-primary-700 font-semibold"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
            {session && (
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-3 px-4 py-2 mb-2">
                  {session.user?.image && (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {session.user?.name || session.user?.email}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

