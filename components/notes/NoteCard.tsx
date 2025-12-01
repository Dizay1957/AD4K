"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Modal } from "@/components/ui/Modal"
import { Edit, Trash2, Pin, PinOff } from "lucide-react"
import { formatDate } from "@/lib/utils"
import toast from "react-hot-toast"

interface Note {
  id: string
  title: string
  content: string
  color: string
  pinned: boolean
  updatedAt: string
}

interface NoteCardProps {
  note: Note
  onEdit: (note: Note) => void
  onDelete: (noteId: string) => void
  onTogglePin: (noteId: string) => void
  onNoteUpdated?: (note: Note) => void
}

export function NoteCard({ note, onEdit, onDelete, onTogglePin, onNoteUpdated }: NoteCardProps) {
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    color: "#fbbf24",
    pinned: false,
  })
  const [isSaving, setIsSaving] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isViewModalOpen && note) {
      setEditingNote(note)
      setFormData({
        title: note.title,
        content: note.content,
        color: note.color,
        pinned: note.pinned,
      })
    }
  }, [isViewModalOpen, note])

  const handleSave = async () => {
    if (!editingNote) return
    
    setIsSaving(true)
    try {
      const response = await fetch(`/api/notes/${editingNote.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Error saving note")

      const savedNote = await response.json()
      setEditingNote(savedNote)
      // Update parent component silently without opening edit modal
      if (onNoteUpdated) {
        onNoteUpdated(savedNote)
      }
      toast.success("Note updated")
    } catch (error) {
      toast.error("Error saving note")
    } finally {
      setIsSaving(false)
    }
  }

  const hasChanges = editingNote && (
    formData.title !== editingNote.title ||
    formData.content !== editingNote.content ||
    formData.color !== editingNote.color ||
    formData.pinned !== editingNote.pinned
  )

  const colors = [
    "#fbbf24", "#3b82f6", "#ef4444", "#10b981",
    "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16",
  ]

  return (
    <>
      <Card
        variant="elevated"
        className="border-l-4 transition-all hover:shadow-xl relative cursor-pointer"
        style={{ borderLeftColor: note.color }}
        onClick={() => setIsViewModalOpen(true)}
      >
        {note.pinned && (
          <div className="absolute top-2 right-2">
            <Pin className="w-4 h-4 text-yellow-600" />
          </div>
        )}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">{note.title}</h3>
          <p className="text-gray-600 text-sm line-clamp-4">{note.content}</p>
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <span className="text-xs text-gray-500">
              {formatDate(note.updatedAt)}
            </span>
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTogglePin(note.id)}
              >
                {note.pinned ? (
                  <PinOff className="w-4 h-4" />
                ) : (
                  <Pin className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(note.id)}
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* View Note Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title=""
        size="xl"
        showCloseButton={true}
      >
        <div className="space-y-6">
          {/* Header with editable title and actions */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-200">
            <div className="flex-1">
              <input
                ref={titleInputRef}
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="text-3xl font-bold text-gray-900 mb-2 w-full bg-transparent border-none outline-none focus:ring-0 p-0"
                placeholder="Note title"
              />
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {formData.pinned && <Pin className="w-4 h-4 text-yellow-600" />}
                <span>Updated {editingNote ? formatDate(editingNote.updatedAt) : formatDate(note.updatedAt)}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const newPinned = !formData.pinned
                  setFormData({ ...formData, pinned: newPinned })
                  try {
                    const response = await fetch(`/api/notes/${note.id}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ ...formData, pinned: newPinned }),
                    })
                    if (response.ok) {
                      const updatedNote = await response.json()
                      setEditingNote(updatedNote)
                      onTogglePin(note.id)
                    }
                  } catch (error) {
                    setFormData({ ...formData, pinned: !newPinned })
                  }
                }}
              >
                {formData.pinned ? (
                  <PinOff className="w-4 h-4" />
                ) : (
                  <Pin className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Content area - directly editable */}
          <div
            className="min-h-[400px] rounded-xl p-6 md:p-8 transition-all"
            style={{
              backgroundColor: `${formData.color}10`,
              borderLeft: `6px solid ${formData.color}`,
            }}
          >
            <textarea
              ref={contentTextareaRef}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full min-h-[400px] text-gray-700 whitespace-pre-wrap leading-relaxed text-base md:text-lg font-normal bg-transparent border-none outline-none focus:ring-0 resize-none break-words overflow-wrap-anywhere"
              style={{
                direction: 'ltr',
                textAlign: 'left',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
              }}
              placeholder="Start writing your note here..."
            />
          </div>

          {/* Footer with color picker and actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <div className="flex gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, color })
                    }}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      formData.color === color
                        ? "border-gray-900 scale-110"
                        : "border-gray-300 hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              {hasChanges && (
                <Button
                  variant="primary"
                  onClick={handleSave}
                  isLoading={isSaving}
                >
                  Update
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  if (hasChanges && !confirm("You have unsaved changes. Are you sure you want to close?")) {
                    return
                  }
                  setIsViewModalOpen(false)
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}

