"use client"

import { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd"
import { TaskCard } from "./TaskCard"
import { TaskModal } from "./TaskModal"
import { TaskBreakdownModal } from "./TaskBreakdownModal"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Plus, Filter, Search } from "lucide-react"
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
  order: number
}

interface TaskManagerProps {
  initialTasks: Task[]
}

export function TaskManager({ initialTasks }: TaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(initialTasks)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false)
  const [breakdownTask, setBreakdownTask] = useState<Task | null>(null)
  const [view, setView] = useState<"all" | "today" | "upcoming" | "completed">("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    let filtered = [...tasks]

    // View filter
    if (view === "today") {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      filtered = filtered.filter((task) => {
        if (!task.dueDate) return false
        const dueDate = new Date(task.dueDate)
        dueDate.setHours(0, 0, 0, 0)
        return dueDate.getTime() === today.getTime()
      })
    } else if (view === "upcoming") {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      filtered = filtered.filter((task) => {
        if (!task.dueDate) return false
        const dueDate = new Date(task.dueDate)
        dueDate.setHours(0, 0, 0, 0)
        return dueDate.getTime() > today.getTime()
      })
    } else if (view === "completed") {
      filtered = filtered.filter((task) => task.status === "done")
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter((task) => task.priority === priorityFilter)
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredTasks(filtered)
  }, [tasks, view, priorityFilter, searchQuery])

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(filteredTasks)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update order
    const updatedTasks = items.map((task, index) => ({
      ...task,
      order: index,
    }))

    setTasks(updatedTasks)

    // Update in database
    try {
      await fetch("/api/tasks/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks: updatedTasks.map((t) => ({ id: t.id, order: t.order })),
        }),
      })
    } catch (error) {
      toast.error("Error reordering tasks")
    }
  }

  const handleCreateTask = () => {
    setEditingTask(null)
    setIsModalOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Error deleting task")

      setTasks(tasks.filter((t) => t.id !== taskId))
      toast.success("Task deleted")
    } catch (error) {
      toast.error("Error deleting task")
    }
  }

  const handleTaskSaved = (newTask: Task) => {
    if (editingTask) {
      setTasks(tasks.map((t) => (t.id === newTask.id ? newTask : t)))
    } else {
      setTasks([...tasks, newTask])
    }
    setIsModalOpen(false)
    setEditingTask(null)
  }

  const handleToggleStatus = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    const newStatus = task.status === "done" ? "pending" : "done"

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error("Error updating task")

      const updatedTask = await response.json()
      setTasks(tasks.map((t) => (t.id === taskId ? updatedTask : t)))

      // Award XP for completing task
      if (newStatus === "done") {
        toast.success("Task completed! +10 XP")
      }
    } catch (error) {
      toast.error("Error updating task")
    }
  }

  const handleBreakDown = (task: Task) => {
    setBreakdownTask(task)
    setIsBreakdownModalOpen(true)
  }

  const handleSaveBreakdown = async (taskId: string, subtasks: any[]) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subtasks }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText || "Error saving breakdown" }
        }
        throw new Error(errorData.error || "Error saving breakdown")
      }

      const updatedTask = await response.json()
      // Parse subtasks for display
      const taskWithParsedSubtasks = {
        ...updatedTask,
        tags: updatedTask.tags ? (typeof updatedTask.tags === 'string' ? JSON.parse(updatedTask.tags) : updatedTask.tags) : [],
        subtasks: updatedTask.subtasks ? (typeof updatedTask.subtasks === 'string' ? JSON.parse(updatedTask.subtasks) : updatedTask.subtasks) : null,
      }
      const updatedTasks = tasks.map((t) => (t.id === taskId ? taskWithParsedSubtasks : t))
      setTasks(updatedTasks)
      
      // The useEffect will automatically update filteredTasks based on the new tasks
    } catch (error: any) {
      console.error("Error saving breakdown:", error)
      toast.error(error.message || "Error saving breakdown")
      throw error
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={view === "all" ? "primary" : "outline"}
            size="sm"
            onClick={() => setView("all")}
          >
            All
          </Button>
          <Button
            variant={view === "today" ? "primary" : "outline"}
            size="sm"
            onClick={() => setView("today")}
          >
            Today
          </Button>
          <Button
            variant={view === "upcoming" ? "primary" : "outline"}
            size="sm"
            onClick={() => setView("upcoming")}
          >
            Upcoming
          </Button>
          <Button
            variant={view === "completed" ? "primary" : "outline"}
            size="sm"
            onClick={() => setView("completed")}
          >
            Completed
          </Button>
        </div>
        <Button variant="primary" onClick={handleCreateTask}>
          <Plus className="w-5 h-5 mr-2" />
          New Task
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </Card>

      {/* Tasks List */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="tasks">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {filteredTasks.length === 0 ? (
                <Card className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    No tasks found. Create your first task!
                  </p>
                </Card>
              ) : (
                filteredTasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={snapshot.isDragging ? "opacity-50" : ""}
                        style={provided.draggableProps.style}
                      >
                        <div className="flex items-start gap-2">
                          <div
                            {...provided.dragHandleProps}
                            className="mt-6 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 flex-shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                              <circle cx="7" cy="5" r="1.5" />
                              <circle cx="13" cy="5" r="1.5" />
                              <circle cx="7" cy="10" r="1.5" />
                              <circle cx="13" cy="10" r="1.5" />
                              <circle cx="7" cy="15" r="1.5" />
                              <circle cx="13" cy="15" r="1.5" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <TaskCard
                              task={task}
                              onEdit={handleEditTask}
                              onDelete={handleDeleteTask}
                              onToggleStatus={handleToggleStatus}
                              onBreakDown={handleBreakDown}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTask(null)
        }}
        onSave={handleTaskSaved}
        task={editingTask}
      />

      <TaskBreakdownModal
        isOpen={isBreakdownModalOpen}
        onClose={() => {
          setIsBreakdownModalOpen(false)
          setBreakdownTask(null)
        }}
        task={breakdownTask}
        onSave={handleSaveBreakdown}
      />
    </div>
  )
}

