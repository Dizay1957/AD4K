"use client"

import { useState } from "react"
import { NoteCard } from "./NoteCard"
import { NoteModal } from "./NoteModal"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card } from "@/components/ui/Card"
import { Plus, Search, Pin } from "lucide-react"
import toast from "react-hot-toast"

interface Note {
  id: string
  title: string
  content: string
  color: string
  pinned: boolean
  createdAt: string
  updatedAt: string
}

interface NotesManagerProps {
  initialNotes: Note[]
}

export function NotesManager({ initialNotes }: NotesManagerProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [filteredNotes, setFilteredNotes] = useState<Note[]>(initialNotes)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showPinnedOnly, setShowPinnedOnly] = useState(false)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    let filtered = [...notes]

    if (showPinnedOnly) {
      filtered = filtered.filter((note) => note.pinned)
    }

    if (query) {
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(query.toLowerCase()) ||
          note.content.toLowerCase().includes(query.toLowerCase())
      )
    }

    setFilteredNotes(filtered)
  }

  const handleCreateNote = () => {
    setEditingNote(null)
    setIsModalOpen(true)
  }

  const handleEditNote = (note: Note) => {
    setEditingNote(note)
    setIsModalOpen(true)
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Error deleting note")

      setNotes(notes.filter((n) => n.id !== noteId))
      handleSearch(searchQuery)
      toast.success("Note deleted")
    } catch (error) {
      toast.error("Error deleting note")
    }
  }

  const handleNoteSaved = (newNote: Note) => {
    let updatedNotes: Note[]
    if (editingNote) {
      updatedNotes = notes.map((n) => (n.id === newNote.id ? newNote : n))
    } else {
      updatedNotes = [newNote, ...notes]
    }
    
    setNotes(updatedNotes)
    
    // Update filtered notes immediately
    let filtered = [...updatedNotes]
    
    if (showPinnedOnly) {
      filtered = filtered.filter((note) => note.pinned)
    }
    
    if (searchQuery) {
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    setFilteredNotes(filtered)
    setIsModalOpen(false)
    setEditingNote(null)
  }

  const handleTogglePin = async (noteId: string) => {
    const note = notes.find((n) => n.id === noteId)
    if (!note) return

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned: !note.pinned }),
      })

      if (!response.ok) throw new Error("Error")

      const updatedNote = await response.json()
      setNotes(notes.map((n) => (n.id === noteId ? updatedNote : n)))
      handleSearch(searchQuery)
    } catch (error) {
      toast.error("Error")
    }
  }

  const handleNoteUpdated = (updatedNote: Note) => {
    // Update note silently without opening modal
    const updatedNotes = notes.map((n) => (n.id === updatedNote.id ? updatedNote : n))
    setNotes(updatedNotes)
    
    // Update filtered notes immediately
    let filtered = [...updatedNotes]
    
    if (showPinnedOnly) {
      filtered = filtered.filter((note) => note.pinned)
    }
    
    if (searchQuery) {
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    setFilteredNotes(filtered)
  }

  // Separate pinned and unpinned notes
  const pinnedNotes = filteredNotes.filter((n) => n.pinned)
  const unpinnedNotes = filteredNotes.filter((n) => !n.pinned)

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 w-full sm:max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Rechercher des notes..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={showPinnedOnly ? "primary" : "outline"}
            onClick={() => {
              setShowPinnedOnly(!showPinnedOnly)
              handleSearch(searchQuery)
            }}
          >
            <Pin className="w-4 h-4 mr-2" />
            Pinned
          </Button>
          <Button variant="primary" onClick={handleCreateNote}>
            <Plus className="w-5 h-5 mr-2" />
            New Note
          </Button>
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No notes found. Create your first note!
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {pinnedNotes.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Pin className="w-5 h-5" />
                Pinned Notes
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pinnedNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={handleEditNote}
                    onDelete={handleDeleteNote}
                    onTogglePin={handleTogglePin}
                    onNoteUpdated={handleNoteUpdated}
                  />
                ))}
              </div>
            </div>
          )}

          {unpinnedNotes.length > 0 && (
            <div>
              {pinnedNotes.length > 0 && (
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                  Other Notes
                </h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unpinnedNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={handleEditNote}
                    onDelete={handleDeleteNote}
                    onTogglePin={handleTogglePin}
                    onNoteUpdated={handleNoteUpdated}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <NoteModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingNote(null)
        }}
        onSave={handleNoteSaved}
        note={editingNote}
      />
    </div>
  )
}

