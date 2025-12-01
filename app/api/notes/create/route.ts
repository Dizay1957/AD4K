import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const noteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string(),
  color: z.string().default("#fbbf24"),
  pinned: z.boolean().default(false),
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = noteSchema.parse(body)

    const note = await prisma.note.create({
      data: {
        userId: session.user.id,
        title: validatedData.title,
        content: validatedData.content,
        color: validatedData.color,
        pinned: validatedData.pinned,
      },
    })

    return NextResponse.json(note, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: error.message || "Error creating note" },
      { status: 500 }
    )
  }
}

