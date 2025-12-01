import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Layout } from "@/components/layout/Layout"
import { FocusTimer } from "@/components/timer/FocusTimer"
import { prisma } from "@/lib/prisma"

export default async function TimerPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const preferences = await prisma.userPreferences.findUnique({
    where: { userId: session.user.id },
  })

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Pomodoro Timer</h1>
          <p className="text-gray-600">
            Stay focused with the Pomodoro technique
          </p>
        </div>
        <FocusTimer
          defaultFocusTime={preferences?.focusTime || 25}
          defaultBreakTime={preferences?.breakTime || 5}
          defaultLongBreakTime={preferences?.longBreakTime || 15}
        />
      </div>
    </Layout>
  )
}

