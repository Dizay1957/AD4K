import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const task = await prisma.task.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Parse tags and subtasks from JSON strings
    const taskResponse = {
      ...task,
      tags: JSON.parse(task.tags || "[]"),
      subtasks: task.subtasks ? JSON.parse(task.subtasks) : null,
    }

    return NextResponse.json(taskResponse)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erreur" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const updateData: any = {}
    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.priority) updateData.priority = body.priority
    if (body.tags) updateData.tags = JSON.stringify(body.tags) // Convert array to JSON string
    if (body.dueDate) updateData.dueDate = new Date(body.dueDate)
    if (body.colorLabel) updateData.colorLabel = body.colorLabel
    if (body.reminderTime) updateData.reminderTime = new Date(body.reminderTime)
    if (body.status) updateData.status = body.status
    if (body.subtasks !== undefined) {
      // Handle both array and null/empty cases
      updateData.subtasks = body.subtasks && body.subtasks.length > 0 
        ? JSON.stringify(body.subtasks) 
        : null
    }

    const task = await prisma.task.update({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: updateData,
    })

    // Award XP if task completed
    if (body.status === "done") {
      const progress = await prisma.userProgress.findUnique({
        where: { userId: session.user.id },
      })

      if (progress) {
        const newXP = progress.xp + 10
        const newLevel = Math.floor(newXP / 100) + 1

        await prisma.userProgress.update({
          where: { userId: session.user.id },
          data: {
            xp: newXP,
            level: newLevel,
            tasksCompleted: progress.tasksCompleted + 1,
          },
        })
      }
    }

    // Parse tags and subtasks from JSON strings
    let parsedTags = []
    let parsedSubtasks = null
    
    try {
      parsedTags = task.tags ? JSON.parse(task.tags || "[]") : []
    } catch {
      parsedTags = []
    }
    
    try {
      parsedSubtasks = task.subtasks ? JSON.parse(task.subtasks) : null
    } catch {
      parsedSubtasks = null
    }

    const taskResponse = {
      ...task,
      tags: parsedTags,
      subtasks: parsedSubtasks,
    }

    return NextResponse.json(taskResponse)
  } catch (error: any) {
    console.error("Error updating task:", error)
    return NextResponse.json(
      { error: error.message || "Error updating task" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.task.delete({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ message: "Task deleted" })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error deleting task" },
      { status: 500 }
    )
  }
}

