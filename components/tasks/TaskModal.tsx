"use client"

import { useState, useEffect } from "react"
import { Modal } from "@/components/ui/Modal"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Brain, Sparkles, CheckCircle2, Circle, X } from "lucide-react"
import toast from "react-hot-toast"

interface Task {
  id: string
  title: string
  description?: string | null
  priority: string
  tags: string[]
  dueDate?: string | null
  colorLabel: string
  reminderTime?: string | null
  subtasks?: any
  status: string
}

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (task: Task) => void
  task?: Task | null
}

export function TaskModal({ isOpen, onClose, onSave, task }: TaskModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    tags: [] as string[],
    dueDate: "",
    colorLabel: "#3b82f6",
    reminderTime: "",
  })
  const [tagInput, setTagInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [subtasks, setSubtasks] = useState<Array<{ id: string; title: string; completed: boolean }>>([])
  const [isBreakingDown, setIsBreakingDown] = useState(false)
  const [showBreakdownOption, setShowBreakdownOption] = useState(false)

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        tags: task.tags || [],
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
        colorLabel: task.colorLabel,
        reminderTime: task.reminderTime ? new Date(task.reminderTime).toISOString().slice(0, 16) : "",
      })
      // Load existing subtasks
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
    } else {
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        tags: [],
        dueDate: "",
        colorLabel: "#3b82f6",
        reminderTime: "",
      })
      setSubtasks([])
      setShowBreakdownOption(false)
    }
  }, [task, isOpen])

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] })
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    })
  }

  const handleBreakdownTask = async () => {
    if (!formData.title.trim()) {
      toast.error("Please enter a task title first")
      return
    }

    setIsBreakingDown(true)
    try {
      const response = await fetch("/api/ai/task-breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: formData.title }),
      })

      if (!response.ok) throw new Error("Error generating breakdown")

      const data = await response.json()
      const newSubtasks = (data.steps || []).map((step: string, index: number) => ({
        id: `subtask-${Date.now()}-${index}`,
        title: step,
        completed: false,
      }))
      setSubtasks(newSubtasks)
      setShowBreakdownOption(false)
      toast.success(`Generated ${newSubtasks.length} micro-steps!`)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const url = task ? `/api/tasks/${task.id}` : "/api/tasks/create"
      const method = task ? "PUT" : "POST"

      const payload = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        tags: formData.tags,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        colorLabel: formData.colorLabel,
        reminderTime: formData.reminderTime ? new Date(formData.reminderTime).toISOString() : null,
        subtasks: subtasks.length > 0 ? subtasks : null,
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error("Error saving task")

      const savedTask = await response.json()
      onSave(savedTask)
      toast.success(task ? "Task updated" : "Task created")
    } catch (error) {
      toast.error("Error saving task")
    } finally {
      setIsLoading(false)
    }
  }

  const colors = [
    "#3b82f6", "#ef4444", "#10b981", "#f59e0b",
    "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16",
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? "Edit Task" : "New Task"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          placeholder="Task name"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all duration-200"
            rows={4}
            placeholder="Task details..."
          />
        </div>


        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddTag()
                }
              }}
              placeholder="Add a tag"
            />
            <Button type="button" onClick={handleAddTag} variant="outline">
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm flex items-center gap-2"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-red-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />
          <Input
            label="Reminder"
            type="datetime-local"
            value={formData.reminderTime}
            onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color
          </label>
          <div className="flex gap-2">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData({ ...formData, colorLabel: color })}
                className={`w-10 h-10 rounded-full border-2 transition-all ${
                  formData.colorLabel === color
                    ? "border-gray-900 scale-110"
                    : "border-gray-300"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {task ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

