"use client"

import { useState, useEffect } from "react"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import { Brain, Sparkles, CheckCircle2, Circle, X, Loader2 } from "lucide-react"
import toast from "react-hot-toast"

interface Subtask {
  id: string
  title: string
  completed: boolean
}

interface Task {
  id: string
  title: string
  subtasks?: Subtask[] | string | null
}

interface TaskBreakdownModalProps {
  isOpen: boolean
  onClose: () => void
  task: Task | null
  onSave: (taskId: string, subtasks: Subtask[]) => void
}

export function TaskBreakdownModal({ isOpen, onClose, task, onSave }: TaskBreakdownModalProps) {
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [isBreakingDown, setIsBreakingDown] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [totalTime, setTotalTime] = useState<number | null>(null)

  useEffect(() => {
    if (task && isOpen) {
      // Parse existing subtasks
      if (task.subtasks) {
        try {
          const parsed = typeof task.subtasks === 'string' ? JSON.parse(task.subtasks) : task.subtasks
          setSubtasks(Array.isArray(parsed) ? parsed : [])
        } catch {
          setSubtasks([])
        }
      } else {
        setSubtasks([])
      }
      setTotalTime(null) // Reset total time when opening modal
    }
  }, [task, isOpen])

  const handleBreakdownTask = async () => {
    if (!task?.title.trim()) {
      toast.error("Task title is required")
      return
    }

    setIsBreakingDown(true)
    try {
      const response = await fetch("/api/ai/task-breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: task.title }),
      })

      if (!response.ok) throw new Error("Error generating breakdown")

      const data = await response.json()
      const newSubtasks = (data.steps || []).map((step: string, index: number) => ({
        id: `subtask-${Date.now()}-${index}`,
        title: step,
        completed: false,
      }))
      setSubtasks(newSubtasks)
      setTotalTime(data.totalTime || null)
      
      const timeMessage = data.totalTime 
        ? `Generated ${newSubtasks.length} micro-steps! Total estimated time: ${data.totalTime} minutes`
        : `Generated ${newSubtasks.length} micro-steps!`
      toast.success(timeMessage)
    } catch (error) {
      toast.error("Error generating task breakdown")
    } finally {
      setIsBreakingDown(false)
    }
  }

  const handleToggleSubtask = (subtaskId: string) => {
    setSubtasks(subtasks.map(st => 
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    ))
  }

  const handleRemoveSubtask = (subtaskId: string) => {
    setSubtasks(subtasks.filter(st => st.id !== subtaskId))
  }

  const handleSave = async () => {
    if (!task) return
    
    setIsSaving(true)
    try {
      await onSave(task.id, subtasks)
      toast.success("Task breakdown saved!")
      onClose()
    } catch (error: any) {
      console.error("Save breakdown error:", error)
      toast.error(error.message || "Error saving breakdown")
    } finally {
      setIsSaving(false)
    }
  }

  const completedCount = subtasks.filter(st => st.completed).length
  const totalCount = subtasks.length
  
  // Calculate sum of individual step times
  const calculatedTotalTime = subtasks.reduce((sum, st) => {
    const timeMatch = st.title.match(/\((\d+)\s*min\)/i)
    return sum + (timeMatch ? parseInt(timeMatch[1]) : 0)
  }, 0)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? `Break Down: ${task.title}` : "Task Breakdown"}
      size="lg"
    >
      <div className="space-y-6">
        {/* AI Breakdown Section */}
        {subtasks.length === 0 && (
          <div className="p-6 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl border-2 border-primary-200">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-6 h-6 text-primary-600" />
              <div>
                <h3 className="font-semibold text-gray-900">ADHD-Friendly Task Breakdown</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Break this big task into small, manageable micro-steps (5-15 min each) with time estimates.
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              onClick={handleBreakdownTask}
              isLoading={isBreakingDown}
              className="w-full"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Micro-Steps with AI
            </Button>
          </div>
        )}

        {/* Subtasks List */}
        {subtasks.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-semibold text-gray-900">Micro-Steps</h3>
                  {totalTime && (
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                      ⏱️ AI Estimate: {totalTime} min
                    </span>
                  )}
                  {calculatedTotalTime > 0 && (
                    <span className="px-3 py-1 bg-accent-100 text-accent-700 rounded-full text-sm font-medium">
                      📊 Sum: {calculatedTotalTime} min
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {completedCount}/{totalCount} completed
                  {completedCount === totalCount && totalCount > 0 && (
                    <span className="ml-2 text-green-600 font-semibold">✓ All done!</span>
                  )}
                </p>
              </div>
              {subtasks.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBreakdownTask}
                  isLoading={isBreakingDown}
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Regenerate
                </Button>
              )}
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {subtasks.map((subtask, index) => (
                <div
                  key={subtask.id}
                  className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-primary-300 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleSubtask(subtask.id)}
                    className="mt-0.5 flex-shrink-0"
                  >
                    {subtask.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-medium text-gray-500 mt-1">{index + 1}.</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-sm ${
                              subtask.completed
                                ? "line-through text-gray-500"
                                : "text-gray-700"
                            }`}
                          >
                            {subtask.title.replace(/\s*\(\d+\s*min\)/i, '')}
                          </span>
                          {subtask.title.match(/\((\d+)\s*min\)/i) && (
                            <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full font-medium">
                              {subtask.title.match(/\((\d+)\s*min\)/i)?.[1]} min
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(subtask.id)}
                    className="text-gray-400 hover:text-red-600 flex-shrink-0 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {subtasks.length > 0 && (
            <Button
              variant="primary"
              onClick={handleSave}
              isLoading={isSaving}
            >
              Save Breakdown
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}

