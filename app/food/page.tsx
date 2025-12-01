import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Layout } from "@/components/layout/Layout"
import { FoodManager } from "@/components/food/FoodManager"

export default async function FoodPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Food</h1>
          <p className="text-gray-600">
            Discover recipes and meal ideas
          </p>
        </div>
        <FoodManager />
      </div>
    </Layout>
  )
}

