"use client"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Send, Loader2 } from "lucide-react"
import toast from "react-hot-toast"

interface Message {
  role: "user" | "assistant"
  content: string
}

export function AIChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI assistant. How can I help you today?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      })

      if (!response.ok) throw new Error("Error")

      const data = await response.json()
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ])
    } catch (error) {
      toast.error("Error sending message")
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card variant="elevated" className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Assistant IA
      </h2>

      <div className="space-y-4">
        {/* Messages */}
        <div className="h-96 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-xl">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-xl p-4 ${
                  message.role === "user"
                    ? "bg-primary-600 text-white"
                    : "bg-white text-gray-900 border-2 border-gray-200"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
                <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Tapez votre message..."
            disabled={isLoading}
          />
          <Button
            variant="primary"
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

