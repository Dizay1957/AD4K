import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Layout } from "@/components/layout/Layout"
import { prisma } from "@/lib/prisma"
import { DashboardStats } from "@/components/dashboard/DashboardStats"
import { AdviceCard } from "@/components/dashboard/AdviceCard"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  // Fetch user data
  const [tasksRaw, notes, progressRaw, preferences] = await Promise.all([
    prisma.task.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.note.findMany({
      where: { userId: session.user.id, pinned: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.userProgress.findUnique({
      where: { userId: session.user.id },
    }),
    prisma.userPreferences.findUnique({
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

  const todayTasks = tasks.filter((task) => {
    if (!task.dueDate) return false
    const today = new Date()
    const dueDate = new Date(task.dueDate)
    return (
      dueDate.getDate() === today.getDate() &&
      dueDate.getMonth() === today.getMonth() &&
      dueDate.getFullYear() === today.getFullYear()
    )
  })

  const completedToday = tasks.filter((task) => task.status === "done").length

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome, {session.user?.name || "User"}! 👋
          </h1>
          <p className="text-gray-600">
            Here's an overview of your productivity today
          </p>
        </div>

        <DashboardStats
          tasksCompleted={completedToday}
          totalTasks={tasks.length}
          todayTasks={todayTasks.length}
          xp={progress?.xp || 0}
          level={progress?.level || 1}
          streak={progress?.currentStreak || 0}
        />

        {/* Daily Advice */}
        <AdviceCard />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Tasks */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Recent Tasks
            </h2>
            {tasks.length === 0 ? (
              <p className="text-gray-500">No tasks at the moment</p>
            ) : (
              <div className="space-y-3">
                {tasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-xl border-2"
                    style={{ borderColor: task.colorLabel }}
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{task.title}</h3>
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        task.status === "done"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {task.status === "done" ? "Done" : "In Progress"}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <a
              href="/tasks"
              className="mt-4 inline-block text-primary-600 hover:underline font-semibold"
            >
              View all tasks →
            </a>
          </div>

          {/* Pinned Notes */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Pinned Notes
            </h2>
            {notes.length === 0 ? (
              <p className="text-gray-500">No pinned notes</p>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 rounded-xl border-l-4"
                    style={{ borderLeftColor: note.color }}
                  >
                    <h3 className="font-semibold text-gray-900">{note.title}</h3>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {note.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <a
              href="/notes"
              className="mt-4 inline-block text-primary-600 hover:underline font-semibold"
            >
              View all notes →
            </a>
          </div>
        </div>
      </div>
    </Layout>
  )
}

