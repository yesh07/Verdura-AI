'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, Plus, X, Utensils, Clock, Apple } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

interface MealPlan {
  title: string;
  days: {
    day: string;
    meals: {
      type: string;
      description: string;
    }[];
  }[];
  focus?: string;
  note?: string;
}

// Get the backend URL from environment variables
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function MealPlanner() {
  const [products, setProducts] = useState<string[]>([])
  const [newProduct, setNewProduct] = useState("")
  const [wellnessGoal, setWellnessGoal] = useState("")
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addProduct = () => {
    if (newProduct.trim() && !products.includes(newProduct.trim())) {
      setProducts([...products, newProduct.trim()])
      setNewProduct("")
      setError(null)
    }
  }

  const removeProduct = (product: string) => {
    setProducts(products.filter(p => p !== product))
    setError(null)
  }

  const parseMealPlan = (text: string): MealPlan | null => {
    try {
      const lines = text.split('\n')
      const mealPlan: MealPlan = {
        title: '',
        days: []
      }

      let currentDay: typeof mealPlan.days[0] | null = null
      
      for (const line of lines) {
        if (line.startsWith('##')) {
          mealPlan.title = line.replace('##', '').trim()
        } else if (line.startsWith('**Focus:**')) {
          mealPlan.focus = line.replace('**Focus:**', '').trim()
        } else if (line.startsWith('**Note:**')) {
          mealPlan.note = line.replace('**Note:**', '').trim()
        } else if (line.startsWith('**Day')) {
          if (currentDay) {
            mealPlan.days.push(currentDay)
          }
          currentDay = {
            day: line.match(/\*\*Day \d+:\*\*/)?.[0] || 'Day',
            meals: []
          }
        } else if (currentDay && (line.includes('Breakfast:') || line.includes('Lunch:') || line.includes('Dinner:'))) {
          const [type, description] = line.split(':')
          currentDay.meals.push({
            type: type.trim(),
            description: description.trim()
          })
        }
      }

      if (currentDay) {
        mealPlan.days.push(currentDay)
      }

      return mealPlan
    } catch (error) {
      console.error('Error parsing meal plan:', error)
      return null
    }
  }

  const generateMealPlan = async () => {
    if (products.length === 0 || !wellnessGoal) {
      setError('Please add products and select a wellness goal')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/planner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goal: wellnessGoal,
          produce: products.map(p => p.name),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate meal plan')
      }

      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }

      setMealPlan(data.plan)
    } catch (error) {
      console.error('Error generating meal plan:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate meal plan')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <main className="container mx-auto p-4 sm:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">📅 Seasonal Eating Planner</h1>
          <p className="text-gray-600">Create a personalized meal plan with your available ingredients.</p>
        </div>

        <div className="space-y-6">
          {/* Wellness Goal Input */}
          <div>
            <label htmlFor="wellnessGoal" className="block text-sm font-medium text-gray-700 mb-1">
              What's your wellness goal?
            </label>
            <Input
              id="wellnessGoal"
              type="text"
              placeholder="e.g. more energy, better sleep, immunity"
              value={wellnessGoal}
              onChange={(e) => setWellnessGoal(e.target.value)}
              className="border-gray-300 focus:border-primary focus:ring-primary"
            />
          </div>

          {/* Product Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Add your available ingredients
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter an ingredient"
                value={newProduct}
                onChange={(e) => setNewProduct(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addProduct()}
                className="flex-1"
              />
              <Button 
                onClick={addProduct}
                disabled={!newProduct.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Product Tags */}
          {products.length > 0 && (
            <div>
              <div className="flex flex-wrap gap-2">
                {products.map((product) => (
                  <div 
                    key={product} 
                    className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm"
                  >
                    <span>{product}</span>
                    <button 
                      onClick={() => removeProduct(product)}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={generateMealPlan}
            disabled={isGenerating || products.length === 0 || !wellnessGoal}
            className="w-full"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center">
                <Spinner size="sm" className="mr-2" />
                Generating Meal Plan...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <Calendar className="mr-2 h-4 w-4" />
                Generate Weekly Plan
              </span>
            )}
          </Button>

          {/* Results */}
          {mealPlan && (
            <div className="mt-8 space-y-6">
              <div className="bg-white rounded-lg border shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Your Weekly Meal Plan</h2>
                
                {/* Focus Section */}
                {mealPlan.focus && (
                  <div className="mb-6 bg-primary/5 p-4 rounded-lg">
                    <p className="text-sm font-medium text-primary mb-1">Focus</p>
                    <p className="text-gray-600">{mealPlan.focus}</p>
                  </div>
                )}

                {/* Days Grid */}
                <div className="space-y-6">
                  {mealPlan.days.map((day, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">{day.day}</h3>
                      <div className="space-y-4">
                        {day.meals.map((meal, mealIndex) => (
                          <div key={mealIndex} className="bg-white rounded-lg p-4 border border-gray-100">
                            <div className="flex items-start">
                              <div className="flex-shrink-0 mr-3">
                                {meal.type.toLowerCase().includes('breakfast') && (
                                  <Apple className="h-5 w-5 text-primary" />
                                )}
                                {meal.type.toLowerCase().includes('lunch') && (
                                  <Utensils className="h-5 w-5 text-primary" />
                                )}
                                {meal.type.toLowerCase().includes('dinner') && (
                                  <Clock className="h-5 w-5 text-primary" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{meal.type}</p>
                                <p className="text-gray-600 mt-1">{meal.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Note Section */}
                {mealPlan.note && (
                  <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 italic">{mealPlan.note}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
