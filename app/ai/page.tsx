import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Layout } from "@/components/layout/Layout"
import { AITools } from "@/components/ai/AITools"

export default async function AIPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Tools</h1>
          <p className="text-gray-600">
            Use AI to improve your productivity
          </p>
        </div>
        <AITools />
      </div>
    </Layout>
  )
}

