"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { TaskBreakdown } from "./TaskBreakdown"
import { ADHDCoach } from "./ADHDCoach"
import { AIChatbot } from "./AIChatbot"
import { Brain, ListChecks, MessageSquare, Sparkles } from "lucide-react"

export function AITools() {
  const [activeTool, setActiveTool] = useState<"breakdown" | "coach" | "chat" | null>(null)

  const tools = [
    {
      id: "breakdown" as const,
      name: "Task Breakdown",
      description: "Break down a large task into smaller steps",
      icon: ListChecks,
      color: "bg-blue-100 text-blue-600",
    },
    {
      id: "coach" as const,
      name: "ADHD Coach",
      description: "Personalized advice to improve your focus",
      icon: Sparkles,
      color: "bg-purple-100 text-purple-600",
    },
    {
      id: "chat" as const,
      name: "AI Assistant",
      description: "Chat with your AI assistant for help",
      icon: MessageSquare,
      color: "bg-green-100 text-green-600",
    },
  ]

  return (
    <div className="space-y-6">
      {!activeTool ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <Card
                key={tool.id}
                variant="elevated"
                className="cursor-pointer hover:scale-105 transition-all"
                onClick={() => setActiveTool(tool.id)}
              >
                <CardHeader>
                  <div className={`w-12 h-12 ${tool.color} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <CardTitle>{tool.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{tool.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div>
          <Button
            variant="ghost"
            onClick={() => setActiveTool(null)}
            className="mb-4"
          >
            ← Back
          </Button>
          {activeTool === "breakdown" && <TaskBreakdown />}
          {activeTool === "coach" && <ADHDCoach />}
          {activeTool === "chat" && <AIChatbot />}
        </div>
      )}
    </div>
  )
}

