import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  tags: z.array(z.string()).default([]),
  dueDate: z.string().nullable().optional(),
  colorLabel: z.string().default("#3b82f6"),
  reminderTime: z.string().nullable().optional(),
  subtasks: z.any().optional(),
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    // Handle subtasks before validation
    const bodyWithSubtasks = {
      ...body,
      subtasks: body.subtasks || undefined,
    }
    const validatedData = taskSchema.parse(bodyWithSubtasks)

    // Get max order
    const maxOrder = await prisma.task.findFirst({
      where: { userId: session.user.id },
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const task = await prisma.task.create({
      data: {
        userId: session.user.id,
        title: validatedData.title,
        description: validatedData.description,
        priority: validatedData.priority,
        tags: JSON.stringify(validatedData.tags), // Convert array to JSON string for SQLite
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        colorLabel: validatedData.colorLabel,
        reminderTime: validatedData.reminderTime ? new Date(validatedData.reminderTime) : null,
        subtasks: validatedData.subtasks ? JSON.stringify(validatedData.subtasks) : null, // Convert subtasks to JSON string
        order: (maxOrder?.order ?? -1) + 1,
      },
    })

    // Parse tags back to array for response
    const taskResponse = {
      ...task,
      tags: JSON.parse(task.tags || "[]"),
      subtasks: task.subtasks ? JSON.parse(task.subtasks) : null,
    }

    return NextResponse.json(taskResponse, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: error.message || "Error creating task" },
      { status: 500 }
    )
  }
}

