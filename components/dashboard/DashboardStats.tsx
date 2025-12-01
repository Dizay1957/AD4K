"use client"

import { Card } from "@/components/ui/Card"
import { Trophy, Target, Zap, Flame } from "lucide-react"

interface DashboardStatsProps {
  tasksCompleted: number
  totalTasks: number
  todayTasks: number
  xp: number
  level: number
  streak: number
}

export function DashboardStats({
  tasksCompleted,
  totalTasks,
  todayTasks,
  xp,
  level,
  streak,
}: DashboardStatsProps) {
  const stats = [
    {
      label: "Tasks Completed",
      value: tasksCompleted,
      icon: Target,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      label: "Tasks Today",
      value: todayTasks,
      icon: Target,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      label: "Level",
      value: level,
      icon: Trophy,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      label: "XP",
      value: xp,
      icon: Zap,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      label: "Streak",
      value: `${streak} days`,
      icon: Flame,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} variant="elevated" className="text-center">
            <div className={`w-12 h-12 ${stat.bgColor} ${stat.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
              <Icon className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </Card>
        )
      })}
    </div>
  )
}

