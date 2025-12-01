import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const THEMEALDB_API = "https://www.themealdb.com/api/json/v1/1"

// Helper function to fetch with timeout and retry
async function fetchWithRetry(url: string, retries = 3, timeout = 30000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        return response
      }
      
      // If not the last retry, wait a bit before retrying
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
      }
    } catch (error: any) {
      // If it's the last retry, throw the error
      if (i === retries - 1) {
        throw error
      }
      // Otherwise, wait and retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
  
  throw new Error("Failed to fetch after retries")
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const type = searchParams.get("type") || "name" // name, ingredient, category

    if (!query) {
      return NextResponse.json({ error: "Query parameter required" }, { status: 400 })
    }

    let url = ""
    if (type === "name") {
      url = `${THEMEALDB_API}/search.php?s=${encodeURIComponent(query)}`
    } else if (type === "ingredient") {
      url = `${THEMEALDB_API}/filter.php?i=${encodeURIComponent(query)}`
    } else if (type === "category") {
      url = `${THEMEALDB_API}/filter.php?c=${encodeURIComponent(query)}`
    }

    const response = await fetchWithRetry(url)
    const data = await response.json()

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("TheMealDB API error:", error)
    return NextResponse.json(
      { error: "Unable to fetch recipes at the moment. Please try again later." },
      { status: 503 }
    )
  }
}

