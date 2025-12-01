import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const emailSchema = z.object({
  email: z.string().email("Invalid email"),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = emailSchema.parse(body)

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Always return success to prevent email enumeration
    // In production, you would send an email here
    if (user) {
      // TODO: Send password reset email
      // For now, just log (in production, use a service like SendGrid, Resend, etc.)
      console.log(`Password reset requested for: ${email}`)
    }

    return NextResponse.json({
      message: "If an account exists with this email, you will receive a reset link.",
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Error processing request" },
      { status: 500 }
    )
  }
}

