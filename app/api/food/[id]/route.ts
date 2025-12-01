import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const THEMEALDB_API = "https://www.themealdb.com/api/json/v1/1"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const response = await fetch(`${THEMEALDB_API}/lookup.php?i=${params.id}`)
    const data = await response.json()

    if (!data.meals || data.meals.length === 0) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 })
    }

    return NextResponse.json(data.meals[0])
  } catch (error: any) {
    console.error("TheMealDB API error:", error)
    return NextResponse.json(
      { error: error.message || "Error fetching recipe" },
      { status: 500 }
    )
  }
}

