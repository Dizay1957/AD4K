import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Delete all user data (cascade will handle related records)
    await prisma.user.delete({
      where: { id: session.user.id },
    })

    return NextResponse.json({ message: "Account deleted" })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error deleting account" },
      { status: 500 }
    )
  }
}

