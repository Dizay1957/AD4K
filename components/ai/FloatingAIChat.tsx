"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Send, Loader2, MessageCircle, X, Square, Maximize2, Move } from "lucide-react"
import toast from "react-hot-toast"
import { useSession } from "next-auth/react"

interface Message {
  role: "user" | "assistant"
  content: string
}

type ChatSize = "small" | "medium" | "large"

export function FloatingAIChat() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [chatSize, setChatSize] = useState<ChatSize>("medium")
  
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [pomPersonality, setPomPersonality] = useState<string>("warm-accountability")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const initialMessageSet = useRef(false)
  const previousPersonalityRef = useRef<string>("warm-accountability")

  // Function to generate initial message based on personality
  const getInitialMessage = useCallback((personality: string, userName: string | null): string => {
    const messages: Record<string, string> = {
      "strict-structured": userName 
        ? `Ready, ${userName}. Step 1: Tell me what you need to do.`
        : "Ready. Step 1: Tell me what you need to do.",
      
      "warm-accountability": userName
        ? `Hey, ${userName}! 🌟 I'm Pom — your friendly ADHD productivity companion! I'm here to help you break down tasks into tiny "Pom seeds" 🍒 and celebrate every win, no matter how small. What would you like to tackle today?`
        : `Hey there! 🌟 I'm Pom — your friendly ADHD productivity companion! I'm here to help you break down tasks into tiny "Pom seeds" 🍒 and celebrate every win, no matter how small. What would you like to tackle today?`,
      
      "hyper-focused": userName
        ? `Hey ${userName}! ⚡ Pom here — let's power through your tasks! Ready for a focus sprint? What's first? 🎯`
        : `Hey! ⚡ Pom here — let's power through your tasks! Ready for a focus sprint? What's first? 🎯`,
      
      "minimalist-robot": "Pom. What task?",
      
      "flexible-problem-solver": userName
        ? `Hello ${userName}. I'm Pom. You have tasks. I'll help organize them. What needs attention?`
        : `Hello. I'm Pom. You have tasks. I'll help organize them. What needs attention?`,
      
      "calm-monk": userName
        ? `Pause. Breathe. I'm Pom. ${userName}, what one task can we focus on?`
        : `Pause. Breathe. I'm Pom. What one task can we focus on?`,
      
      "compassionate-firm": userName
        ? `Hi ${userName}. I'm Pom. I know you can do this. Let's start with one task. What is it?`
        : `Hi. I'm Pom. I know you can do this. Let's start with one task. What is it?`,
      
      "chaos-wrangler": userName
        ? `Hey ${userName}! 🍎 Pom here. Drop all your thoughts — I'll help sort them. What's on your mind? 🎯`
        : `Hey! 🍎 Pom here. Drop all your thoughts — I'll help sort them. What's on your mind? 🎯`,
    }
    
    return messages[personality] || messages["warm-accountability"]
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  // Fetch user preferences to get Pom's personality
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await fetch("/api/profile")
        if (response.ok) {
          const data = await response.json()
          if (data?.preferences?.pomPersonality) {
            const newPersonality = data.preferences.pomPersonality
            setPomPersonality(newPersonality)
          }
        }
      } catch (error) {
        console.error("Error fetching preferences:", error)
      }
    }
    
    if (session?.user) {
      fetchPreferences()
    }
  }, [session])

  // Update initial message when session and personality are loaded or changed
  useEffect(() => {
    if (session?.user) {
      const userName = session.user.name || session.user.email?.split("@")[0] || null
      const initialMessage = getInitialMessage(pomPersonality, userName)
      
      // If initial message hasn't been set, set it
      if (!initialMessageSet.current) {
        setMessages([{ role: "assistant", content: initialMessage }])
        initialMessageSet.current = true
        previousPersonalityRef.current = pomPersonality
      } 
      // If personality changed and we only have the initial message (no conversation yet)
      else if (previousPersonalityRef.current !== pomPersonality && messages.length === 1 && messages[0].role === "assistant") {
        setMessages([{ role: "assistant", content: initialMessage }])
        previousPersonalityRef.current = pomPersonality
      }
    }
  }, [session, pomPersonality, getInitialMessage])

  // Show chat optimistically - only hide if explicitly unauthenticated
  // (Pages redirect if not authenticated, so showing chat is safe)
  if (status === "unauthenticated") return null

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    const currentInput = input
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentInput }),
      })

      if (!response.ok) throw new Error("Error sending message")

      const data = await response.json()
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ])

      // Handle navigation if the AI suggests it
      if (data.navigateTo) {
        console.log("Navigating to:", data.navigateTo)
        setTimeout(() => {
          router.push(data.navigateTo)
          const pageName = data.navigateTo.replace("/", "") || "dashboard"
          toast.success(`Navigating to ${pageName}...`)
        }, 500)
      } else {
        console.log("No navigation detected in response:", data)
      }
    } catch (error) {
      toast.error("Error sending message")
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group overflow-hidden bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
          aria-label="Open Pom Chat"
        >
          <div className="relative w-10 h-10">
            <Image
              src="/pome.png"
              alt="Pom"
              width={40}
              height={40}
              className="w-full h-full object-contain drop-shadow-sm"
              quality={100}
              unoptimized
            />
          </div>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-pulse border-2 border-red-500" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
            chatSize === "small"
              ? "w-80 h-[400px]"
              : chatSize === "medium"
              ? "w-96 h-[600px]"
              : "w-[500px] h-[700px]"
          } max-h-[85vh]`}
        >
          <Card
            variant="elevated"
            className="h-full flex flex-col shadow-2xl border-2 border-red-200 p-0 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-500 via-red-600 to-pink-600 text-white rounded-t-2xl shadow-lg">
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-white/30 p-1 shadow-md">
                  <Image
                    src="/pome.png"
                    alt="Pom"
                    fill
                    className="object-contain drop-shadow-sm"
                    quality={100}
                    unoptimized
                  />
                </div>
                <h3 className="font-semibold text-lg">Pom</h3>
              </div>
              <div className="flex items-center gap-2">
                {/* Size Controls */}
                <div className="flex items-center gap-2 mr-2 border-r border-white/30 pr-3">
                  <button
                    onClick={() => setChatSize("small")}
                    className={`p-2 rounded-lg transition-all ${
                      chatSize === "small"
                        ? "bg-white/30 shadow-lg scale-110"
                        : "hover:bg-white/20"
                    }`}
                    aria-label="Small size"
                    title="Small (320×400px)"
                  >
                    <Square className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setChatSize("medium")}
                    className={`p-2 rounded-lg transition-all ${
                      chatSize === "medium"
                        ? "bg-white/30 shadow-lg scale-110"
                        : "hover:bg-white/20"
                    }`}
                    aria-label="Medium size"
                    title="Medium (384×600px)"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setChatSize("large")}
                    className={`p-2 rounded-lg transition-all ${
                      chatSize === "large"
                        ? "bg-white/30 shadow-lg scale-110"
                        : "hover:bg-white/20"
                    }`}
                    aria-label="Large size"
                    title="Large (500×700px)"
                  >
                    <Move className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false)
                  }}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Close"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gradient-to-b from-red-50/30 via-white to-teal-50/30">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-xl p-3 ${
                          message.role === "user"
                            ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md"
                            : "bg-white text-gray-900 border-2 border-red-100 shadow-sm"
                        }`}
                      >
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border-2 border-red-100 rounded-xl p-3 shadow-sm">
                        <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-red-100 bg-gradient-to-r from-white to-red-50/30 rounded-b-2xl">
                  <div className="flex gap-2">
                    <Input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSend()
                        }
                      }}
                      placeholder="Type your message to Pom..."
                      disabled={isLoading}
                      className="flex-1 border-red-200 focus:border-red-400 focus:ring-red-200"
                    />
                    <Button
                      variant="primary"
                      onClick={handleSend}
                      disabled={isLoading || !input.trim()}
                      size="sm"
                      className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 border-0"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
            </>
          </Card>
        </div>
      )}
    </>
  )
}

