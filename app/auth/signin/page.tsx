"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import toast from "react-hot-toast"
import { Github, Mail } from "lucide-react"
import Link from "next/link"

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Sign In réussie!")
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error) {
      toast.error("An error occurred")
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
          <CardTitle className="text-3xl text-center">Sign In</CardTitle>
          <p className="text-center text-gray-600 mt-2">
            Welcome to AD4K
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
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              <Mail className="w-5 h-5 mr-2" />
              Sign In
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
              Don't have an account\?{" "}
              <Link href="/auth/signup" className="text-primary-600 hover:underline font-semibold">
                Sign Up
              </Link>
            </p>
            <Link href="/auth/forgot-password" className="text-sm text-primary-600 hover:underline mt-2 block">
              Password oublié?
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

