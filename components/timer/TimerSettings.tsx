"use client"

import { useState } from "react"
import { Modal } from "@/components/ui/Modal"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import toast from "react-hot-toast"

interface TimerSettingsProps {
  isOpen: boolean
  onClose: () => void
  focusTime: number
  breakTime: number
  longBreakTime: number
  onSave: (settings: { focusTime: number; breakTime: number; longBreakTime: number }) => void
}

export function TimerSettings({
  isOpen,
  onClose,
  focusTime,
  breakTime,
  longBreakTime,
  onSave,
}: TimerSettingsProps) {
  const [settings, setSettings] = useState({
    focusTime,
    breakTime,
    longBreakTime,
  })

  const handleSave = async () => {
    if (settings.focusTime < 1 || settings.breakTime < 1 || settings.longBreakTime < 1) {
      toast.error("Durations must be greater than 0")
      return
    }

    onSave(settings)

    // Save to database
    try {
      await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          focusTime: settings.focusTime,
          breakTime: settings.breakTime,
          longBreakTime: settings.longBreakTime,
        }),
      })
      toast.success("Settings saved")
    } catch (error) {
      toast.error("Error saving settings")
    }

    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Timer Settings">
      <div className="space-y-4">
        <Input
          label="Focus Duration (minutes)"
          type="number"
          min="1"
          value={settings.focusTime}
          onChange={(e) =>
            setSettings({ ...settings, focusTime: parseInt(e.target.value) || 1 })
          }
        />
        <Input
          label="Short Break Duration (minutes)"
          type="number"
          min="1"
          value={settings.breakTime}
          onChange={(e) =>
            setSettings({ ...settings, breakTime: parseInt(e.target.value) || 1 })
          }
        />
        <Input
          label="Long Break Duration (minutes)"
          type="number"
          min="1"
          value={settings.longBreakTime}
          onChange={(e) =>
            setSettings({ ...settings, longBreakTime: parseInt(e.target.value) || 1 })
          }
        />
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </Modal>
  )
}

