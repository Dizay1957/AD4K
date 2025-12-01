"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import toast from "react-hot-toast"
import { Mail } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error")
      }

      setIsSent(true)
      toast.success("Password reset email sent!")
    } catch (error: any) {
      toast.error(error.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 via-white to-accent-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-3xl text-center">Email Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 mb-6">
              If an account exists with this email, you will receive a reset link.
            </p>
            <Link href="/auth/signin">
              <Button variant="primary" className="w-full">
                Back to Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 via-white to-accent-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl text-center">Forgot Password</CardTitle>
          <p className="text-center text-gray-600 mt-2">
            Enter your email to receive a reset link
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              <Mail className="w-5 h-5 mr-2" />
              Send Reset Link
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/auth/signin" className="text-sm text-primary-600 hover:underline">
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

