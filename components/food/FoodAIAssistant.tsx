"use client"

import { useState } from "react"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Sparkles, Send, Loader2, ChefHat } from "lucide-react"
import toast from "react-hot-toast"
import { RecipeCard } from "./RecipeCard"

interface Meal {
  idMeal: string
  strMeal: string
  strMealThumb: string
  strCategory?: string
  strArea?: string
}

interface FoodAIAssistantProps {
  onRecipeSelect?: (recipeId: string) => void
}

export function FoodAIAssistant({ onRecipeSelect }: FoodAIAssistantProps) {
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [meals, setMeals] = useState<Meal[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  const examplePrompts = [
    "Something healthy with chicken",
    "Quick vegetarian pasta",
    "Comfort food for dinner",
    "Easy breakfast ideas",
    "Dessert with chocolate",
    "Light lunch options",
  ]

  const handleRecommend = async () => {
    if (!description.trim()) {
      toast.error("Please describe what you're looking for")
      return
    }

    setLoading(true)
    setHasSearched(true)
    try {
      const response = await fetch("/api/food/ai-recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to get recommendations")
      }

      const data = await response.json()
      if (data.meals && data.meals.length > 0) {
        setMeals(data.meals)
        toast.success(`Found ${data.meals.length} recipe(s) matching your description!`)
      } else {
        setMeals([])
        toast.error("No recipes found. Try a different description!")
      }
    } catch (error: any) {
      toast.error(error.message || "Error getting recommendations")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleExampleClick = (example: string) => {
    setDescription(example)
  }

  const handleRecipeClick = (recipeId: string) => {
    if (onRecipeSelect) {
      onRecipeSelect(recipeId)
    }
  }

  return (
    <div className="space-y-6">
      {/* AI Assistant Card */}
      <Card className="p-6 bg-gradient-to-r from-primary-50 to-accent-50 border-2 border-primary-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-primary-100 rounded-xl">
            <Sparkles className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">AI Food Assistant</h3>
            <p className="text-sm text-gray-600">
              Describe what you want to cook, and I'll find matching recipes!
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="e.g., 'healthy chicken dinner' or 'quick vegetarian pasta'..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !loading) {
                  handleRecommend()
                }
              }}
              className="flex-1"
            />
            <Button
              variant="primary"
              onClick={handleRecommend}
              isLoading={loading}
              disabled={!description.trim()}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Find Recipes
                </>
              )}
            </Button>
          </div>

          {/* Example Prompts */}
          <div>
            <p className="text-xs text-gray-500 mb-2">Try these examples:</p>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-full hover:border-primary-500 hover:text-primary-700 hover:bg-primary-50 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Results */}
      {hasSearched && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-primary-600" />
              {loading ? "Searching..." : meals.length > 0 ? `${meals.length} Recipe(s) Found` : "No Results"}
            </h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
          ) : meals.length === 0 ? (
            <Card className="text-center py-12">
              <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No recipes found</p>
              <p className="text-gray-400 text-sm">
                Try a different description or use one of the examples above
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {meals.map((meal) => (
                <RecipeCard
                  key={meal.idMeal}
                  recipe={meal}
                  onViewDetails={handleRecipeClick}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

