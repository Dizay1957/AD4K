import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Layout } from "@/components/layout/Layout"
import { NotesManager } from "@/components/notes/NotesManager"
import { prisma } from "@/lib/prisma"

export default async function NotesPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const notes = await prisma.note.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  })

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Notes</h1>
          <p className="text-gray-600">
            Capture your thoughts and ideas
          </p>
        </div>
        <NotesManager initialNotes={notes} />
      </div>
    </Layout>
  )
}

