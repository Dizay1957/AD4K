"use client"

import { useState, useEffect } from "react"
import { RecipeCard } from "./RecipeCard"
import { RecipeModal } from "./RecipeModal"
import { FoodAIAssistant } from "./FoodAIAssistant"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card } from "@/components/ui/Card"
import { Search, ChefHat, Loader2, Brain } from "lucide-react"
import toast from "react-hot-toast"

interface Meal {
  idMeal: string
  strMeal: string
  strMealThumb: string
  strCategory?: string
  strArea?: string
}

interface Category {
  idCategory: string
  strCategory: string
  strCategoryThumb: string
  strCategoryDescription: string
}

export function FoodManager() {
  const [searchQuery, setSearchQuery] = useState("")
  const [meals, setMeals] = useState<Meal[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"search" | "ai">("ai")

  useEffect(() => {
    fetchCategories()
    fetchRandomMeals()
  }, [])

  const fetchRandomMeals = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/food/random?count=12")
      if (!response.ok) throw new Error("Failed to fetch random meals")
      const data = await response.json()
      setMeals(data.meals || [])
    } catch (error) {
      console.error("Error fetching random recipes:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/food/categories")
      if (!response.ok) throw new Error("Failed to fetch categories")
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(
        `/api/food/search?q=${encodeURIComponent(searchQuery)}&type=name`
      )
      if (!response.ok) throw new Error("Failed to search recipes")

      const data = await response.json()
      // TheMealDB returns null when no results, not an empty array
      if (data.meals && Array.isArray(data.meals) && data.meals.length > 0) {
        setMeals(data.meals)
        toast.success(`Found ${data.meals.length} recipe(s)`)
      } else {
        setMeals([])
        toast.error("No recipes found. Try a different search term!")
      }
    } catch (error) {
      toast.error("Error searching recipes")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewRecipe = (recipeId: string) => {
    setSelectedRecipeId(recipeId)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <ChefHat className="w-8 h-8 text-primary-600" />
          Food & Recipes
        </h1>
        <p className="text-gray-600 mt-1">
          Discover delicious recipes powered by TheMealDB
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("ai")}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
            activeTab === "ai"
              ? "border-primary-500 text-primary-700"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          <Brain className="w-4 h-4 inline mr-2" />
          AI Assistant
        </button>
        <button
          onClick={() => setActiveTab("search")}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
            activeTab === "search"
              ? "border-primary-500 text-primary-700"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          <Search className="w-4 h-4 inline mr-2" />
          Search
        </button>
      </div>

      {/* AI Assistant Tab */}
      {activeTab === "ai" && (
        <FoodAIAssistant onRecipeSelect={handleViewRecipe} />
      )}

      {/* Search Tab */}
      {activeTab === "search" && (
        <>
          {/* Search Section */}
          <Card>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search recipes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleSearch()
                      }
                    }}
                    className="pl-10"
                  />
                </div>
                <Button variant="primary" onClick={handleSearch} isLoading={loading}>
                  Search
                </Button>
              </div>
            </div>
          </Card>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {meals.length > 0 ? `${meals.length} Recipe(s)` : "Recipes"}
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : meals.length === 0 ? (
          <Card className="text-center py-12">
            <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">
              No recipes found. Try a different search term!
            </p>
            <Button variant="outline" onClick={fetchRandomMeals}>
              Show Random Recipes
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {meals.map((meal) => (
              <RecipeCard
                key={meal.idMeal}
                recipe={meal}
                onViewDetails={handleViewRecipe}
              />
            ))}
          </div>
        )}
      </div>

          {/* Recipe Modal */}
          <RecipeModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false)
              setSelectedRecipeId(null)
            }}
            recipeId={selectedRecipeId}
          />
        </>
      )}

      {/* Shared Recipe Modal */}
      <RecipeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedRecipeId(null)
        }}
        recipeId={selectedRecipeId}
      />
    </div>
  )
}

