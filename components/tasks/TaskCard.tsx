"use client"

import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Edit, Trash2, CheckCircle2, Circle, Brain, GripVertical } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface Subtask {
  id: string
  title: string
  completed: boolean
}

interface Task {
  id: string
  title: string
  description?: string | null
  priority: string
  tags: string[]
  dueDate?: string | null
  colorLabel: string
  status: string
  subtasks?: Subtask[] | string | null
}

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onToggleStatus: (taskId: string) => void
  onBreakDown?: (task: Task) => void
}

export function TaskCard({ task, onEdit, onDelete, onToggleStatus, onBreakDown }: TaskCardProps) {
  const priorityColors = {
    high: "bg-red-100 text-red-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-green-100 text-green-800",
  }

  const priorityLabels = {
    high: "High",
    medium: "Medium",
    low: "Low",
  }

  // Parse subtasks
  let subtasks: Subtask[] = []
  if (task.subtasks) {
    try {
      const parsed = typeof task.subtasks === 'string' ? JSON.parse(task.subtasks) : task.subtasks
      subtasks = Array.isArray(parsed) ? parsed : []
    } catch {
      subtasks = []
    }
  }

  const completedSubtasks = subtasks.filter(st => st.completed).length
  const totalSubtasks = subtasks.length

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open if clicking on buttons, checkbox, or subtasks area
    const target = e.target as HTMLElement
    if (
      target.closest('button') || 
      target.closest('[data-subtasks]') ||
      target.closest('svg') ||
      target.closest('input')
    ) {
      return
    }
    if (onBreakDown) {
      onBreakDown(task)
    }
  }

  return (
    <Card
      variant="elevated"
      className={`border-l-4 transition-all hover:shadow-xl ${
        onBreakDown ? "cursor-pointer" : ""
      }`}
      style={{ borderLeftColor: task.colorLabel }}
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="flex flex-col items-center gap-1 mt-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleStatus(task.id)
              }}
              className="flex-shrink-0"
            >
              {task.status === "done" ? (
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              ) : (
                <Circle className="w-6 h-6 text-gray-400" />
              )}
            </button>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className={`text-lg font-semibold ${
                  task.status === "done" ? "line-through text-gray-500" : "text-gray-900"
                }`}
              >
                {task.title}
              </h3>
              {onBreakDown && (
                <span className="text-xs text-gray-400 italic">Click to view breakdown</span>
              )}
            </div>
            {task.description && (
              <p className="text-gray-600 mt-1">{task.description}</p>
            )}
            
            {/* Subtasks Display */}
            {subtasks.length > 0 && (
              <div className="mt-3 space-y-2" data-subtasks onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600">
                    Micro-Steps: {completedSubtasks}/{totalSubtasks}
                  </span>
                  {completedSubtasks === totalSubtasks && totalSubtasks > 0 && (
                    <span className="text-xs text-green-600 font-semibold">✓ All done!</span>
                  )}
                </div>
                <div className="space-y-1.5 pl-2 border-l-2 border-gray-200">
                  {subtasks.slice(0, 5).map((subtask) => (
                    <div
                      key={subtask.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      {subtask.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      )}
                      <span
                        className={
                          subtask.completed
                            ? "line-through text-gray-500"
                            : "text-gray-700"
                        }
                      >
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                  {subtasks.length > 5 && (
                    <div className="text-xs text-gray-500 pl-6">
                      +{subtasks.length - 5} more steps - Click to view all
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Badge variant={task.priority === "high" ? "danger" : task.priority === "medium" ? "warning" : "success"}>
                {priorityLabels[task.priority as keyof typeof priorityLabels]}
              </Badge>
              {task.tags.map((tag, index) => (
                <Badge key={index} variant="info">
                  {tag}
                </Badge>
              ))}
              {task.dueDate && (
                <span className="text-sm text-gray-500">
                  📅 {formatDate(task.dueDate)}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(task)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(task.id)}
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

