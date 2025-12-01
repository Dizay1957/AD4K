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

    const [user, tasksRaw, notes, preferences, progressRaw] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      }),
      prisma.task.findMany({
        where: { userId: session.user.id },
      }),
      prisma.note.findMany({
        where: { userId: session.user.id },
      }),
      prisma.userPreferences.findUnique({
        where: { userId: session.user.id },
      }),
      prisma.userProgress.findUnique({
        where: { userId: session.user.id },
      }),
    ])

    // Parse tags and subtasks from JSON strings for SQLite
    const tasks = tasksRaw.map((task) => ({
      ...task,
      tags: JSON.parse(task.tags || "[]"),
      subtasks: task.subtasks ? JSON.parse(task.subtasks) : null,
    }))

    // Parse badges from JSON string for SQLite
    const progress = progressRaw ? {
      ...progressRaw,
      badges: JSON.parse(progressRaw.badges || "[]"),
    } : null

    const exportData = {
      user,
      tasks,
      notes,
      preferences,
      progress,
      exportedAt: new Date().toISOString(),
    }

    return NextResponse.json(exportData, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="ad4k-data-${Date.now()}.json"`,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error exporting data" },
      { status: 500 }
    )
  }
}

