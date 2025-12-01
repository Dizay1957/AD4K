"use client"

import { useState } from "react"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Loader2, CheckCircle2 } from "lucide-react"
import toast from "react-hot-toast"

export function TaskBreakdown() {
  const [task, setTask] = useState("")
  const [steps, setSteps] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleBreakdown = async () => {
    if (!task.trim()) {
      toast.error("Please enter a task")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/ai/task-breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task }),
      })

      if (!response.ok) throw new Error("Error")

      const data = await response.json()
      setSteps(data.steps || [])
    } catch (error) {
      toast.error("Error generating steps")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card variant="elevated" className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Task Breakdown
      </h2>
      <p className="text-gray-600 mb-6">
        Enter a large task and AI will break it down into smaller, manageable steps.
      </p>

      <div className="space-y-4">
        <Input
          label="Describe your task"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Ex: Organize a birthday party"
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleBreakdown()
            }
          }}
        />
        <Button
          variant="primary"
          onClick={handleBreakdown}
          isLoading={isLoading}
          className="w-full"
        >
          Break Down Task
        </Button>

        {steps.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="font-semibold text-gray-900">Suggested Steps:</h3>
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl"
              >
                <CheckCircle2 className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{step}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

