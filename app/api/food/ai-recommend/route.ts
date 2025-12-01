import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Groq from "groq-sdk"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

const THEMEALDB_API = "https://www.themealdb.com/api/json/v1/1"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Groq API key not configured" },
        { status: 500 }
      )
    }

    const { description } = await request.json()

    if (!description || !description.trim()) {
      return NextResponse.json(
        { error: "Description required" },
        { status: 400 }
      )
    }

    // Use AI to extract search terms from the description
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are a food recommendation assistant. Analyze the user's food request and extract:\n" +
            "1. Main ingredients (comma-separated, max 3 most important)\n" +
            "2. Meal type/category (e.g., Breakfast, Dessert, Side, etc.)\n" +
            "3. Dietary preferences (e.g., Vegetarian, Vegan, Gluten Free, etc.)\n" +
            "4. Cooking style (e.g., Quick, Healthy, Comfort Food, etc.)\n\n" +
            "Respond ONLY in this exact JSON format:\n" +
            '{"ingredients": ["ingredient1", "ingredient2"], "category": "category_name", "dietary": "preference", "style": "style_name", "searchTerms": ["term1", "term2", "term3"]}\n\n' +
            "If a field is not mentioned, use null. Keep searchTerms to 1-3 most relevant keywords for TheMealDB search.",
        },
        {
          role: "user",
          content: `Find recipes for: ${description}`,
        },
      ],
      max_tokens: 300,
      temperature: 0.7,
    })

    const aiResponse = completion.choices[0]?.message?.content || ""
    let searchParams: any = {}

    try {
      // Extract JSON from AI response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        searchParams = JSON.parse(jsonMatch[0])
      }
    } catch (error) {
      console.error("Error parsing AI response:", error)
      // Fallback: use description as search term
      searchParams = { searchTerms: [description] }
    }

    // Search TheMealDB with extracted terms
    const allMeals: any[] = []
    const searchPromises: Promise<any>[] = []

    // Search by name if we have search terms
    if (searchParams.searchTerms && searchParams.searchTerms.length > 0) {
      for (const term of searchParams.searchTerms.slice(0, 3)) {
        searchPromises.push(
          fetch(`${THEMEALDB_API}/search.php?s=${encodeURIComponent(term)}`).then(
            (res) => res.json()
          )
        )
      }
    }

    // Search by ingredient if we have ingredients
    if (searchParams.ingredients && searchParams.ingredients.length > 0) {
      for (const ingredient of searchParams.ingredients.slice(0, 2)) {
        searchPromises.push(
          fetch(
            `${THEMEALDB_API}/filter.php?i=${encodeURIComponent(ingredient)}`
          ).then((res) => res.json())
        )
      }
    }

    // Search by category if we have one
    if (searchParams.category) {
      searchPromises.push(
        fetch(
          `${THEMEALDB_API}/filter.php?c=${encodeURIComponent(searchParams.category)}`
        ).then((res) => res.json())
      )
    }

    const results = await Promise.all(searchPromises)

    // Collect all meals
    results.forEach((result) => {
      if (result.meals && Array.isArray(result.meals)) {
        result.meals.forEach((meal: any) => {
          // Avoid duplicates
          if (!allMeals.find((m) => m.idMeal === meal.idMeal)) {
            allMeals.push(meal)
          }
        })
      }
    })

    // If no results, try a broader search
    if (allMeals.length === 0 && description) {
      const fallbackResponse = await fetch(
        `${THEMEALDB_API}/search.php?s=${encodeURIComponent(description.split(" ")[0])}`
      )
      const fallbackData = await fallbackResponse.json()
      if (fallbackData.meals) {
        allMeals.push(...fallbackData.meals.slice(0, 10))
      }
    }

    return NextResponse.json({
      meals: allMeals.slice(0, 20), // Limit to 20 results
      searchParams,
      aiAnalysis: aiResponse,
    })
  } catch (error: any) {
    console.error("Food AI recommendation error:", error)
    return NextResponse.json(
      { error: error.message || "Error generating recommendations" },
      { status: 500 }
    )
  }
}

