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

    const note = await prisma.note.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    return NextResponse.json(note)
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

    const note = await prisma.note.update({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.color && { color: body.color }),
        ...(body.pinned !== undefined && { pinned: body.pinned }),
      },
    })

    return NextResponse.json(note)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error updating note" },
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

    await prisma.note.delete({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ message: "Note deleted" })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error deleting note" },
      { status: 500 }
    )
  }
}

