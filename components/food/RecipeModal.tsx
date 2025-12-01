"use client"

import { useState, useEffect } from "react"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import { Clock, Users, ChefHat, ExternalLink, Loader2 } from "lucide-react"
import toast from "react-hot-toast"

interface Recipe {
  idMeal: string
  strMeal: string
  strMealThumb: string
  strCategory?: string
  strArea?: string
  strInstructions?: string
  strYoutube?: string
  strSource?: string
  [key: string]: any
}

interface RecipeModalProps {
  isOpen: boolean
  onClose: () => void
  recipeId: string | null
}

export function RecipeModal({ isOpen, onClose, recipeId }: RecipeModalProps) {
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && recipeId) {
      fetchRecipe()
    } else {
      setRecipe(null)
    }
  }, [isOpen, recipeId])

  const fetchRecipe = async () => {
    if (!recipeId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/food/${recipeId}`)
      if (!response.ok) throw new Error("Failed to fetch recipe")

      const data = await response.json()
      setRecipe(data)
    } catch (error) {
      toast.error("Error loading recipe")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const getIngredients = (recipe: Recipe) => {
    const ingredients: { name: string; measure: string }[] = []
    for (let i = 1; i <= 20; i++) {
      const ingredient = recipe[`strIngredient${i}`]
      const measure = recipe[`strMeasure${i}`]
      if (ingredient && ingredient.trim()) {
        ingredients.push({
          name: ingredient,
          measure: measure || "",
        })
      }
    }
    return ingredients
  }

  const formatInstructions = (instructions: string) => {
    if (!instructions) return []
    return instructions
      .split(/\r\n|\r|\n/)
      .filter((step) => step.trim().length > 0)
      .map((step) => step.trim())
  }

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={recipe?.strMeal || "Recipe Details"}
      size="xl"
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : recipe ? (
        <div className="space-y-6">
          {/* Image */}
          <div className="relative w-full h-64 rounded-xl overflow-hidden">
            <img
              src={recipe.strMealThumb || "/placeholder-food.jpg"}
              alt={recipe.strMeal}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4">
            {recipe.strCategory && (
              <div className="flex items-center gap-2 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                <ChefHat className="w-4 h-4" />
                {recipe.strCategory}
              </div>
            )}
            {recipe.strArea && (
              <div className="flex items-center gap-2 px-3 py-1 bg-accent-100 text-accent-700 rounded-full text-sm font-medium">
                🌍 {recipe.strArea}
              </div>
            )}
          </div>

          {/* Ingredients */}
          {getIngredients(recipe).length > 0 && (
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-3">Ingredients</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {getIngredients(recipe).map((ingredient, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">
                      <span className="font-medium">{ingredient.measure}</span>{" "}
                      {ingredient.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          {recipe.strInstructions && (
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-3">Instructions</h3>
              <div className="space-y-3">
                {formatInstructions(recipe.strInstructions).map((step, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold text-sm">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 leading-relaxed flex-1 pt-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
            {recipe.strYoutube && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(recipe.strYoutube, "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Watch on YouTube
              </Button>
            )}
            {recipe.strSource && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(recipe.strSource, "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Source
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          Recipe not found
        </div>
      )}
    </Modal>
  )
}

