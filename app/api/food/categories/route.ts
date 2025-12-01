import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const THEMEALDB_API = "https://www.themealdb.com/api/json/v1/1"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const response = await fetch(`${THEMEALDB_API}/categories.php`)
    const data = await response.json()

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("TheMealDB API error:", error)
    return NextResponse.json(
      { error: error.message || "Error fetching categories" },
      { status: 500 }
    )
  }
}

