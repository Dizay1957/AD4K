"use client"

import { useState } from "react"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Loader2, Sparkles } from "lucide-react"
import toast from "react-hot-toast"

export function ADHDCoach() {
  const [advice, setAdvice] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleGetAdvice = async (topic: string) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/ai/focus-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      })

      if (!response.ok) throw new Error("Error")

      const data = await response.json()
      setAdvice(data.advice || "")
    } catch (error) {
      toast.error("Error generating advice")
    } finally {
      setIsLoading(false)
    }
  }

  const topics = [
    "Improve my concentration",
    "Manage procrastination",
    "Organize my time",
    "Reduce distractions",
    "Maintain motivation",
  ]

  return (
    <Card variant="elevated" className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        ADHD Coach
      </h2>
      <p className="text-gray-600 mb-6">
        Get personalized advice to improve your productivity.
      </p>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {topics.map((topic) => (
            <Button
              key={topic}
              variant="outline"
              onClick={() => handleGetAdvice(topic)}
              disabled={isLoading}
              className="justify-start"
            >
              {topic}
            </Button>
          ))}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        )}

        {advice && !isLoading && (
          <div className="mt-6 p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200">
            <div className="flex items-start gap-3">
              <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Personalized Advice:</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{advice}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

