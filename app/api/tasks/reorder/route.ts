import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { tasks } = await request.json()

    // Update all tasks in a transaction
    await prisma.$transaction(
      tasks.map((task: { id: string; order: number }) =>
        prisma.task.update({
          where: {
            id: task.id,
            userId: session.user.id,
          },
          data: { order: task.order },
        })
      )
    )

    return NextResponse.json({ message: "Order updated" })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error updating order" },
      { status: 500 }
    )
  }
}

