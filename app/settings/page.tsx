import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Layout } from "@/components/layout/Layout"
import { SettingsManager } from "@/components/settings/SettingsManager"
import { prisma } from "@/lib/prisma"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const preferences = await prisma.userPreferences.findUnique({
    where: { userId: session.user.id },
  })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, image: true },
  })

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">
            Customize your AD4K experience
          </p>
        </div>
        <SettingsManager
          user={user}
          preferences={preferences}
        />
      </div>
    </Layout>
  )
}

