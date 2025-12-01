"use client"

import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Clock, Users, ChefHat, ExternalLink } from "lucide-react"

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

interface RecipeCardProps {
  recipe: Recipe
  onViewDetails?: (recipeId: string) => void
  variant?: "grid" | "list"
}

export function RecipeCard({ recipe, onViewDetails, variant = "grid" }: RecipeCardProps) {
  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(recipe.idMeal)
    }
  }

  if (variant === "list") {
    return (
      <Card
        variant="elevated"
        className="flex items-center gap-4 p-4 hover:shadow-xl transition-all cursor-pointer"
        onClick={handleViewDetails}
      >
        <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
          <img
            src={recipe.strMealThumb || "/placeholder-food.jpg"}
            alt={recipe.strMeal}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-gray-900 truncate">
            {recipe.strMeal}
          </h3>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            {recipe.strCategory && (
              <span className="flex items-center gap-1">
                <ChefHat className="w-4 h-4" />
                {recipe.strCategory}
              </span>
            )}
            {recipe.strArea && (
              <span className="flex items-center gap-1">
                🌍 {recipe.strArea}
              </span>
            )}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={(e) => {
          e.stopPropagation()
          handleViewDetails()
        }}>
          View Recipe
        </Button>
      </Card>
    )
  }

  return (
    <Card
      variant="elevated"
      className="overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
      onClick={handleViewDetails}
    >
      <div className="relative w-full h-48 overflow-hidden">
        <img
          src={recipe.strMealThumb || "/placeholder-food.jpg"}
          alt={recipe.strMeal}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {recipe.strCategory && (
          <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
            {recipe.strCategory}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
          {recipe.strMeal}
        </h3>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          {recipe.strArea && (
            <span className="flex items-center gap-1">
              🌍 {recipe.strArea}
            </span>
          )}
        </div>
        <Button
          variant="primary"
          size="sm"
          className="w-full mt-4"
          onClick={(e) => {
            e.stopPropagation()
            handleViewDetails()
          }}
        >
          View Recipe
          <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </Card>
  )
}

