import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Layout } from "@/components/layout/Layout"
import { TaskManager } from "@/components/tasks/TaskManager"
import { prisma } from "@/lib/prisma"

export default async function TasksPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const tasksRaw = await prisma.task.findMany({
    where: { userId: session.user.id },
    orderBy: { order: "asc" },
  })

  // Parse tags and subtasks from JSON strings for SQLite
  const tasks = tasksRaw.map((task) => ({
    ...task,
    tags: JSON.parse(task.tags || "[]"),
    subtasks: task.subtasks ? JSON.parse(task.subtasks) : null,
  }))

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Tasks</h1>
          <p className="text-gray-600">
            Manage your tasks and stay organized
          </p>
        </div>
        <TaskManager initialTasks={tasks} />
      </div>
    </Layout>
  )
}

