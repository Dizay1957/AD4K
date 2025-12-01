"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import toast from "react-hot-toast"
import { Github, Mail, UserPlus } from "lucide-react"
import Link from "next/link"
import { signIn } from "next-auth/react"

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error during registration")
      }

      toast.success("Account created successfully! Please sign in to continue.")
      
      // Redirect to sign in page instead of auto-login
      router.push("/auth/signin")
    } catch (error: any) {
      toast.error(error.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialSignIn = async (provider: string) => {
    setIsLoading(true)
    await signIn(provider, { callbackUrl: "/dashboard" })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 via-white to-accent-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl text-center">Create Account</CardTitle>
          <p className="text-center text-gray-600 mt-2">
            Start your productivity journey
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Your name"
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="your@email.com"
            />
            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              placeholder="••••••••"
            />
            <Input
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              placeholder="••••••••"
            />
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Sign Up
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialSignIn("google")}
                disabled={isLoading}
                className="w-full"
              >
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialSignIn("github")}
                disabled={isLoading}
                className="w-full"
              >
                <Github className="w-5 h-5 mr-2" />
                GitHub
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account\?{" "}
              <Link href="/auth/signin" className="text-primary-600 hover:underline font-semibold">
                Sign In
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

