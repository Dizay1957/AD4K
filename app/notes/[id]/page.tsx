"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Layout } from "@/components/layout/Layout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { ArrowLeft, Edit, Save, X, Pin, PinOff, Trash2 } from "lucide-react"
import toast from "react-hot-toast"
import { formatDate } from "@/lib/utils"

interface Note {
  id: string
  title: string
  content: string
  color: string
  pinned: boolean
  createdAt: string
  updatedAt: string
}

export default function NoteViewPage() {
  const router = useRouter()
  const params = useParams()
  const noteId = params.id as string

  const [note, setNote] = useState<Note | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    color: "#fbbf24",
    pinned: false,
  })

  useEffect(() => {
    fetchNote()
  }, [noteId])

  const fetchNote = async () => {
    try {
      const response = await fetch(`/api/notes/${noteId}`)
      if (!response.ok) {
        if (response.status === 404) {
          toast.error("Note not found")
          router.push("/notes")
          return
        }
        throw new Error("Failed to fetch note")
      }
      const data = await response.json()
      setNote(data)
      setFormData({
        title: data.title,
        content: data.content,
        color: data.color,
        pinned: data.pinned,
      })
    } catch (error) {
      toast.error("Error loading note")
      router.push("/notes")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Error saving note")

      const savedNote = await response.json()
      setNote(savedNote)
      setIsEditing(false)
      toast.success("Note updated")
    } catch (error) {
      toast.error("Error saving note")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this note?")) return

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Error deleting note")

      toast.success("Note deleted")
      router.push("/notes")
    } catch (error) {
      toast.error("Error deleting note")
    }
  }

  const handleTogglePin = async () => {
    const newPinned = !formData.pinned
    setFormData({ ...formData, pinned: newPinned })
    
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, pinned: newPinned }),
      })

      if (!response.ok) throw new Error("Error updating note")

      const updatedNote = await response.json()
      setNote(updatedNote)
      toast.success(newPinned ? "Note pinned" : "Note unpinned")
    } catch (error) {
      setFormData({ ...formData, pinned: !newPinned })
      toast.error("Error updating note")
    }
  }

  const colors = [
    "#fbbf24", "#3b82f6", "#ef4444", "#10b981",
    "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16",
  ]

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-gray-500">Loading...</div>
        </div>
      </Layout>
    )
  }

  if (!note) {
    return null
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/notes")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTogglePin}
                >
                  {note.pinned ? (
                    <PinOff className="w-4 h-4" />
                  ) : (
                    <Pin className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false)
                    setFormData({
                      title: note.title,
                      content: note.content,
                      color: note.color,
                      pinned: note.pinned,
                    })
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSave}
                  isLoading={isSaving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Note Content */}
        <div
          className="min-h-[70vh] rounded-2xl p-8 md:p-12 transition-all"
          style={{
            backgroundColor: `${formData.color}15`,
            borderLeft: `6px solid ${formData.color}`,
          }}
        >
          {isEditing ? (
            <div className="space-y-6">
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Note title"
                className="text-3xl font-bold border-0 bg-transparent focus:ring-0 p-0"
              />
              
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Start writing..."
                className="w-full min-h-[50vh] text-lg text-gray-700 bg-transparent border-0 focus:ring-0 focus:outline-none resize-none leading-relaxed"
                style={{ fontFamily: "inherit" }}
              />

              <div className="pt-6 border-t border-gray-300">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Color
                </label>
                <div className="flex gap-3">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        formData.color === color
                          ? "border-gray-900 scale-110"
                          : "border-gray-300 hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                {note.pinned && <Pin className="w-4 h-4 text-yellow-600" />}
                <span>Updated {formatDate(note.updatedAt)}</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {note.title}
              </h1>
              
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-lg">
                  {note.content || (
                    <span className="text-gray-400 italic">No content</span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

