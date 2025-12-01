import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Layout } from "@/components/layout/Layout"
import { Card } from "@/components/ui/Card"
import { Music, Construction } from "lucide-react"

export default async function SoundsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Ambient Sounds</h1>
          <p className="text-gray-600">
            Improve your concentration with soothing sounds
          </p>
        </div>
        
        <Card variant="elevated" className="p-12">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-400 via-accent-400 to-glow-pink rounded-full blur-xl opacity-50" />
              <div className="relative bg-gradient-to-br from-primary-100 to-accent-100 p-6 rounded-full">
                <Construction className="w-16 h-16 text-primary-600" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">In Development</h2>
              <p className="text-gray-600 max-w-md">
                The ambient sounds feature is currently being developed. 
                Check back soon for soothing sounds to help you focus!
              </p>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  )
}

