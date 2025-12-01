"use client"

import { useState, useEffect } from "react"
import { Modal } from "@/components/ui/Modal"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import toast from "react-hot-toast"

interface Note {
  id: string
  title: string
  content: string
  color: string
  pinned: boolean
}

interface NoteModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (note: Note) => void
  note?: Note | null
}

export function NoteModal({ isOpen, onClose, onSave, note }: NoteModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    color: "#fbbf24",
    pinned: false,
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title,
        content: note.content,
        color: note.color,
        pinned: note.pinned,
      })
    } else {
      setFormData({
        title: "",
        content: "",
        color: "#fbbf24",
        pinned: false,
      })
    }
  }, [note, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const url = note ? `/api/notes/${note.id}` : "/api/notes/create"
      const method = note ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Error saving note")

      const savedNote = await response.json()
      onSave(savedNote)
      toast.success(note ? "Note updated" : "Note created")
    } catch (error) {
      toast.error("Error saving note")
    } finally {
      setIsLoading(false)
    }
  }

  const colors = [
    "#fbbf24", "#3b82f6", "#ef4444", "#10b981",
    "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16",
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={note ? "Edit Note" : "New Note"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          placeholder="Note title"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contenu
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all duration-200 min-h-[200px]"
            placeholder="Write your note here..."
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
                onClick={() => setFormData({ ...formData, color })}
                className={`w-10 h-10 rounded-full border-2 transition-all ${
                  formData.color === color
                    ? "border-gray-900 scale-110"
                    : "border-gray-300"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="pinned"
            checked={formData.pinned}
            onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
          />
          <label htmlFor="pinned" className="ml-2 text-sm text-gray-700">
            Pin this note
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {note ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

