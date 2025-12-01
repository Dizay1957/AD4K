"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Lightbulb, RefreshCw, Loader2 } from "lucide-react"
import toast from "react-hot-toast"

interface Advice {
  id: string
  advice: string
}

export function AdviceCard() {
  const [advice, setAdvice] = useState<Advice | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchAdvice = async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true)
    } else {
      setIsRefreshing(true)
    }

    try {
      const response = await fetch("/api/advice?count=1")
      
      if (!response.ok) {
        throw new Error("Failed to fetch advice")
      }

      const data = await response.json()
      
      if (data.advices && data.advices.length > 0) {
        setAdvice(data.advices[0])
      } else {
        throw new Error("No advice available")
      }
    } catch (error) {
      console.error("Error fetching advice:", error)
      toast.error("Unable to load advice. Please try again.")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAdvice()
  }, [])

  const handleRefresh = () => {
    fetchAdvice(false)
  }

  return (
    <Card variant="elevated" className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-yellow-600" />
            </div>
            <CardTitle className="text-xl text-gray-900">Daily Advice</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-yellow-700 hover:text-yellow-800 hover:bg-yellow-100"
          >
            {isRefreshing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-600" />
          </div>
        ) : advice ? (
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-center min-h-[120px]">
              <p className="text-2xl md:text-3xl text-gray-800 leading-relaxed italic text-center max-w-4xl px-4">
                "{advice.advice}"
              </p>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Powered by Advice Slip API
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-500 text-center text-lg">
              No advice available at the moment.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

