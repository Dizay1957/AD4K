"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Save, Trash2, Download } from "lucide-react"
import toast from "react-hot-toast"

interface User {
  name: string | null
  email: string
  image: string | null
}

interface Preferences {
  id: string
  language: string
  focusTime: number
  breakTime: number
  longBreakTime: number
  soundPreference: string | null
  notificationsEnabled: boolean
  theme: string
  dyslexiaFont: boolean
  largeUIMode: boolean
  highContrast: boolean
  reminderFrequency: string
  autoStartNextCycle: boolean
  pomPersonality: string
}

interface SettingsManagerProps {
  user: User | null
  preferences: Preferences | null
}

export function SettingsManager({ user, preferences }: SettingsManagerProps) {
  const [userData, setUserData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  })

  const [prefs, setPrefs] = useState({
    language: preferences?.language || "FR",
    focusTime: preferences?.focusTime || 25,
    breakTime: preferences?.breakTime || 5,
    longBreakTime: preferences?.longBreakTime || 15,
    soundPreference: preferences?.soundPreference || "",
    notificationsEnabled: preferences?.notificationsEnabled ?? true,
    theme: preferences?.theme || "colorful",
    dyslexiaFont: preferences?.dyslexiaFont || false,
    largeUIMode: preferences?.largeUIMode || false,
    highContrast: preferences?.highContrast || false,
    reminderFrequency: preferences?.reminderFrequency || "normal",
    autoStartNextCycle: preferences?.autoStartNextCycle || false,
    pomPersonality: preferences?.pomPersonality || "warm-accountability",
  })

  const [isSaving, setIsSaving] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isInitialMount = useRef(true)

  const handleSave = useCallback(async (showToast = true) => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userData.name,
          ...prefs,
        }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to save settings")
      }
      
      if (showToast) {
        toast.success("Settings saved")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      if (showToast) {
        toast.error("Error saving settings")
      }
    } finally {
      setIsSaving(false)
    }
  }, [prefs, userData.name])

  // Auto-save when preferences change
  useEffect(() => {
    // Skip auto-save on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Set new timeout for auto-save (500ms debounce)
    saveTimeoutRef.current = setTimeout(() => {
      handleSave(false) // Don't show toast for auto-save
    }, 500)

    // Cleanup
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [prefs, userData.name, handleSave])

  const handleExportData = async () => {
    try {
      const response = await fetch("/api/profile/export")
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `ad4k-data-${new Date().toISOString()}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success("Data exported")
    } catch (error) {
      toast.error("Error exporting data")
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action is irreversible.")) {
      return
    }

    if (!confirm("Please confirm one more time that you want to delete your account.")) {
      return
    }

    try {
      const response = await fetch("/api/profile/delete", {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Error")

      toast.success("Account deleted")
      window.location.href = "/auth/signin"
    } catch (error) {
      toast.error("Error deleting account")
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Settings */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Profil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Nom"
            value={userData.name}
            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            value={userData.email}
            disabled
          />
        </CardContent>
      </Card>

      {/* Timer Settings */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Timer Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Focus Duration (minutes)"
            type="number"
            min="1"
            value={prefs.focusTime}
            onChange={(e) => setPrefs({ ...prefs, focusTime: parseInt(e.target.value) || 1 })}
          />
          <Input
            label="Short Break Duration (minutes)"
            type="number"
            min="1"
            value={prefs.breakTime}
            onChange={(e) => setPrefs({ ...prefs, breakTime: parseInt(e.target.value) || 1 })}
          />
          <Input
            label="Long Break Duration (minutes)"
            type="number"
            min="1"
            value={prefs.longBreakTime}
            onChange={(e) => setPrefs({ ...prefs, longBreakTime: parseInt(e.target.value) || 1 })}
          />
          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoStart"
              checked={prefs.autoStartNextCycle}
              onChange={(e) => setPrefs({ ...prefs, autoStartNextCycle: e.target.checked })}
              className="w-4 h-4 text-primary-600 rounded"
            />
            <label htmlFor="autoStart" className="ml-2 text-sm text-gray-700">
              Automatically start next cycle
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              value={prefs.language}
              onChange={(e) => setPrefs({ ...prefs, language: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
            >
              <option value="FR">Français</option>
              <option value="EN">English</option>
              <option value="AR">العربية</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theme
            </label>
            <select
              value={prefs.theme}
              onChange={(e) => setPrefs({ ...prefs, theme: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="colorful">Colorful (ADHD-friendly)</option>
            </select>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="dyslexiaFont"
              checked={prefs.dyslexiaFont}
              onChange={(e) => setPrefs({ ...prefs, dyslexiaFont: e.target.checked })}
              className="w-4 h-4 text-primary-600 rounded"
            />
            <label htmlFor="dyslexiaFont" className="ml-2 text-sm text-gray-700">
              Dyslexia-friendly font
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="largeUI"
              checked={prefs.largeUIMode}
              onChange={(e) => setPrefs({ ...prefs, largeUIMode: e.target.checked })}
              className="w-4 h-4 text-primary-600 rounded"
            />
            <label htmlFor="largeUI" className="ml-2 text-sm text-gray-700">
              Large UI mode
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="highContrast"
              checked={prefs.highContrast}
              onChange={(e) => setPrefs({ ...prefs, highContrast: e.target.checked })}
              className="w-4 h-4 text-primary-600 rounded"
            />
            <label htmlFor="highContrast" className="ml-2 text-sm text-gray-700">
              High contrast
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Pom's Personality */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Pom's Personality</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Choose how Pom communicates with you. Each personality has a different tone and approach to help you stay productive.
          </p>
          
          {/* Personality Selection Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { value: "strict-structured", label: "Strict & Structured", icon: "/personalities/strict-structured.PNG" },
              { value: "warm-accountability", label: "Warm Accountability", icon: "/personalities/warm-accountability.PNG" },
              { value: "hyper-focused", label: "Hyper-Focused", icon: "/personalities/hyper-focused.PNG" },
              { value: "minimalist-robot", label: "Minimalist Robot", icon: "/personalities/minimalist-robot.PNG" },
              { value: "flexible-problem-solver", label: "Flexible Problem-Solver", icon: "/personalities/flexible-problem-solver.PNG" },
              { value: "calm-monk", label: "Calm Monk", icon: "/personalities/calm-monk.PNG" },
              { value: "compassionate-firm", label: "Compassionate but Firm", icon: "/personalities/compassionate-firm.PNG" },
              { value: "chaos-wrangler", label: "Chaos Wrangler", icon: "/personalities/chaos-wrangler.PNG" },
            ].map((personality) => (
              <button
                key={personality.value}
                onClick={() => setPrefs({ ...prefs, pomPersonality: personality.value })}
                className={`
                  relative p-5 rounded-xl border-2 transition-all duration-200
                  ${prefs.pomPersonality === personality.value
                    ? "border-red-500 bg-red-50 shadow-lg scale-105"
                    : "border-gray-200 bg-white hover:border-red-300 hover:shadow-md"
                  }
                `}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center shadow-sm">
                    <Image
                      src={personality.icon}
                      alt={personality.label}
                      width={96}
                      height={96}
                      className="object-contain"
                      onError={(e) => {
                        // Fallback to emoji if image doesn't exist
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        const parent = target.parentElement
                        if (parent && !parent.querySelector('.fallback-emoji')) {
                          const fallback = document.createElement('div')
                          fallback.className = 'fallback-emoji w-full h-full flex items-center justify-center text-3xl'
                          fallback.textContent = '🎯'
                          parent.appendChild(fallback)
                        }
                      }}
                    />
                  </div>
                  <span className={`text-sm font-medium text-center leading-tight ${prefs.pomPersonality === personality.value ? "text-red-700" : "text-gray-700"}`}>
                    {personality.label}
                  </span>
                </div>
                {prefs.pomPersonality === personality.value && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Description */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs font-semibold text-gray-700 mb-2">Current Mode:</p>
            <p className="text-sm text-gray-600">
              {prefs.pomPersonality === "strict-structured" && "Short, direct commands. No fluff. Best for users who need external pressure."}
              {prefs.pomPersonality === "warm-accountability" && "Encouraging, calm, non-judgmental. Best for users who get paralyzed by fear of failure."}
              {prefs.pomPersonality === "hyper-focused" && "High-energy but organized. Gamifies tasks and tracks streaks."}
              {prefs.pomPersonality === "minimalist-robot" && "Emotionless, ultra-brief. Best for users overstimulated by too much personality."}
              {prefs.pomPersonality === "flexible-problem-solver" && "Analytical, calm, logical. Helps create step-by-step strategies."}
              {prefs.pomPersonality === "calm-monk" && "Slow, grounding, minimalist. Best for users who are overwhelmed or anxious."}
              {prefs.pomPersonality === "compassionate-firm" && "Kind but strict. Makes you commit to tasks and asks for check-ins."}
              {prefs.pomPersonality === "chaos-wrangler" && "Casual, understanding of ADHD randomness. Adapts rapidly to unpredictable situations."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="notifications"
              checked={prefs.notificationsEnabled}
              onChange={(e) => setPrefs({ ...prefs, notificationsEnabled: e.target.checked })}
              className="w-4 h-4 text-primary-600 rounded"
            />
            <label htmlFor="notifications" className="ml-2 text-sm text-gray-700">
              Enable notifications
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reminder Frequency
            </label>
            <select
              value={prefs.reminderFrequency}
              onChange={(e) => setPrefs({ ...prefs, reminderFrequency: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
          <Save className="w-5 h-5 mr-2" />
          Save Settings
        </Button>
        <Button variant="outline" onClick={handleExportData}>
          <Download className="w-5 h-5 mr-2" />
          Export Data
        </Button>
        <Button variant="danger" onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700 text-white">
          <Trash2 className="w-5 h-5 mr-2" />
          Delete Account
        </Button>
      </div>
    </div>
  )
}
