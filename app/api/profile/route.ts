import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        preferences: true,
        progress: true,
      },
    })

    // Parse badges from JSON string for SQLite
    if (user?.progress) {
      user.progress = {
        ...user.progress,
        badges: JSON.parse(user.progress.badges || "[]"),
      }
    }

    return NextResponse.json(user)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erreur" },
      { status: 500 }
    )
  }
}

