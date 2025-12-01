"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { AlertCircle } from "lucide-react"

const errorMessages: Record<string, string> = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "You do not have permission to sign in.",
  Verification: "The verification token has expired or has already been used.",
  Default: "An error occurred during authentication.",
}

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error") || "Default"
  const errorMessage = errorMessages[error] || errorMessages.Default

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 via-white to-accent-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <CardTitle className="text-2xl text-center text-red-600">
            Authentication Error
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">{errorMessage}</p>
          
          {error === "Configuration" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Possible causes:</strong>
              </p>
              <ul className="text-sm text-yellow-700 mt-2 list-disc list-inside space-y-1">
                <li>OAuth credentials not configured correctly</li>
                <li>Redirect URI mismatch in Google Cloud Console</li>
                <li>Missing environment variables</li>
              </ul>
            </div>
          )}

          {error === "AccessDenied" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                You may need to add your email to the test users list in Google Cloud Console.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button
              variant="primary"
              className="w-full"
              onClick={() => window.location.href = "/auth/signin"}
            >
              Try Again
            </Button>
            <Link href="/auth/signin">
              <Button variant="outline" className="w-full">
                Back to Sign In
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

