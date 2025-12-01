"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Play, Pause, RotateCcw, Settings } from "lucide-react"
import { TimerSettings } from "./TimerSettings"
import toast from "react-hot-toast"

interface FocusTimerProps {
  defaultFocusTime: number
  defaultBreakTime: number
  defaultLongBreakTime: number
}

type TimerMode = "focus" | "shortBreak" | "longBreak"

export function FocusTimer({
  defaultFocusTime,
  defaultBreakTime,
  defaultLongBreakTime,
}: FocusTimerProps) {
  const [mode, setMode] = useState<TimerMode>("focus")
  const [timeLeft, setTimeLeft] = useState(defaultFocusTime * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [sessionsCompleted, setSessionsCompleted] = useState(0)
  const [focusTime, setFocusTime] = useState(defaultFocusTime)
  const [breakTime, setBreakTime] = useState(defaultBreakTime)
  const [longBreakTime, setLongBreakTime] = useState(defaultLongBreakTime)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft])

  useEffect(() => {
    // Play notification sound when timer completes
    if (timeLeft === 0 && !isRunning) {
      if (audioRef.current) {
        audioRef.current.play().catch(() => {})
      }
      // Request notification permission and show notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Pomodoro Complete!", {
          body: mode === "focus" ? "Take a break!" : "Back to work!",
          icon: "/icon-192x192.png",
        })
      }
    }
  }, [timeLeft, isRunning, mode])

  const handleTimerComplete = () => {
    setIsRunning(false)
    toast.success(
      mode === "focus"
        ? "Focus session complete! Take a break."
        : "Break complete! Back to work."
    )

    if (mode === "focus") {
      const newSessions = sessionsCompleted + 1
      setSessionsCompleted(newSessions)

      // Every 4 sessions, take a long break
      if (newSessions % 4 === 0) {
        setMode("longBreak")
        setTimeLeft(longBreakTime * 60)
      } else {
        setMode("shortBreak")
        setTimeLeft(breakTime * 60)
      }
    } else {
      setMode("focus")
      setTimeLeft(focusTime * 60)
    }
  }

  const handleStart = () => {
    setIsRunning(true)
    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleReset = () => {
    setIsRunning(false)
    if (mode === "focus") {
      setTimeLeft(focusTime * 60)
    } else if (mode === "shortBreak") {
      setTimeLeft(breakTime * 60)
    } else {
      setTimeLeft(longBreakTime * 60)
    }
  }

  const handleModeChange = (newMode: TimerMode) => {
    setIsRunning(false)
    setMode(newMode)
    if (newMode === "focus") {
      setTimeLeft(focusTime * 60)
    } else if (newMode === "shortBreak") {
      setTimeLeft(breakTime * 60)
    } else {
      setTimeLeft(longBreakTime * 60)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const progress = () => {
    const total = mode === "focus" ? focusTime * 60 : mode === "shortBreak" ? breakTime * 60 : longBreakTime * 60
    return ((total - timeLeft) / total) * 100
  }

  return (
    <div className="space-y-6">
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />

      <Card variant="elevated" className="text-center p-8">
        {/* Mode Selector */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            variant={mode === "focus" ? "primary" : "outline"}
            onClick={() => handleModeChange("focus")}
          >
            Focus
          </Button>
          <Button
            variant={mode === "shortBreak" ? "primary" : "outline"}
            onClick={() => handleModeChange("shortBreak")}
          >
            Short Break
          </Button>
          <Button
            variant={mode === "longBreak" ? "primary" : "outline"}
            onClick={() => handleModeChange("longBreak")}
          >
            Long Break
          </Button>
        </div>

        {/* Timer Display */}
        <div className="mb-8">
          <div className="relative w-64 h-64 mx-auto">
            <svg className="transform -rotate-90 w-64 h-64">
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-200"
              />
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 120}`}
                strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress() / 100)}`}
                className={`transition-all duration-1000 ${
                  mode === "focus" ? "text-primary-600" : "text-green-600"
                }`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl font-bold text-gray-900 mb-2">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-lg text-gray-600">
                  {mode === "focus"
                    ? "Focus Time"
                    : mode === "shortBreak"
                    ? "Short Break"
                    : "Long Break"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          {isRunning ? (
            <Button variant="primary" size="lg" onClick={handlePause}>
              <Pause className="w-5 h-5 mr-2" />
              Pause
            </Button>
          ) : (
            <Button variant="primary" size="lg" onClick={handleStart}>
              <Play className="w-5 h-5 mr-2" />
              Start
            </Button>
          )}
          <Button variant="outline" size="lg" onClick={handleReset}>
            <RotateCcw className="w-5 h-5 mr-2" />
            Reset
          </Button>
          <Button variant="ghost" size="lg" onClick={() => setIsSettingsOpen(true)}>
            <Settings className="w-5 h-5 mr-2" />
            Settings
          </Button>
        </div>

        {/* Sessions Counter */}
        <div className="mt-8 text-gray-600">
          Sessions completed today: <span className="font-bold text-primary-600">{sessionsCompleted}</span>
        </div>
      </Card>

      <TimerSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        focusTime={focusTime}
        breakTime={breakTime}
        longBreakTime={longBreakTime}
        onSave={(settings) => {
          setFocusTime(settings.focusTime)
          setBreakTime(settings.breakTime)
          setLongBreakTime(settings.longBreakTime)
          // Update current timer if not running
          if (!isRunning) {
            if (mode === "focus") {
              setTimeLeft(settings.focusTime * 60)
            } else if (mode === "shortBreak") {
              setTimeLeft(settings.breakTime * 60)
            } else {
              setTimeLeft(settings.longBreakTime * 60)
            }
          }
        }}
      />
    </div>
  )
}

