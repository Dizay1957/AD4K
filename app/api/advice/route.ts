import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const ADVICE_SLIP_API = "https://api.adviceslip.com"

// Helper function to fetch with timeout and retry
async function fetchWithRetry(url: string, retries = 3, timeout = 10000): Promise<Response> {
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
    const count = parseInt(searchParams.get("count") || "1")
    const searchQuery = searchParams.get("search")

    // Limit count to prevent too many requests
    const limitedCount = Math.min(count, 5)

    if (searchQuery) {
      // Search for advice
      const response = await fetchWithRetry(`${ADVICE_SLIP_API}/advice/search/${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      
      if (data.slips && data.slips.length > 0) {
        return NextResponse.json({ 
          advices: data.slips.slice(0, limitedCount).map((slip: any) => ({
            id: slip.id || Math.random().toString(36).substring(7),
            advice: slip.advice,
          }))
        })
      } else {
        return NextResponse.json({ advices: [] })
      }
    } else {
      // Fetch random advice(s)
      const promises = Array.from({ length: limitedCount }, () =>
        fetchWithRetry(`${ADVICE_SLIP_API}/advice`)
          .then((res) => res.json())
          .catch((error) => {
            console.error("Error fetching random advice:", error)
            return { slip: null }
          })
      )

      const results = await Promise.all(promises)
      const advices = results
        .map((result) => result.slip)
        .filter(Boolean)
        .map((slip: any) => ({
          id: slip.id || slip.slip_id || Math.random().toString(36).substring(7),
          advice: slip.advice,
        }))

      if (advices.length === 0) {
        return NextResponse.json(
          { error: "No advice available at the moment. Please try again later." },
          { status: 503 }
        )
      }

      return NextResponse.json({ advices })
    }
  } catch (error: any) {
    console.error("Advice Slip API error:", error)
    return NextResponse.json(
      { error: "Unable to fetch advice at the moment. Please try again later." },
      { status: 503 }
    )
  }
}

