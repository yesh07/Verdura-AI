'use client';

import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Calculator, Plus, X } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// Get the backend URL from environment variables
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function MacroAnalyzer() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState("");
  const [nutritionInfo, setNutritionInfo] = useState<NutritionInfo | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addIngredient = () => {
    if (newIngredient.trim() && !ingredients.includes(newIngredient.trim())) {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient("");
      setError(null);
    }
  };

  const removeIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter(i => i !== ingredient));
    setError(null);
  };

  const tryParseJSON = (jsonString: string): NutritionInfo | null => {
    try {
      // If the string is already a valid JSON object, parse it directly
      if (jsonString.trim().startsWith('{') && jsonString.trim().endsWith('}')) {
        const parsed = JSON.parse(jsonString);
        if (isValidNutritionInfo(parsed)) {
          return parsed;
        }
      }

      // Clean up the string and extract the JSON part
      let cleaned = jsonString
        // Remove any markdown formatting
        .replace(/```json\n?/g, '')
        .replace(/```/g, '')
        // Replace single quotes with double quotes
        .replace(/'/g, '"')
        // Remove any leading/trailing whitespace
        .trim();

      // Try to find a JSON-like structure
      const jsonMatch = cleaned.match(/\{[^}]+\}/);
      if (jsonMatch) {
        const jsonPart = jsonMatch[0];
        const parsed = JSON.parse(jsonPart);
        if (isValidNutritionInfo(parsed)) {
          return parsed;
        }
      }

      // If no JSON structure found, try to extract key-value pairs
      const lines = cleaned.split('\n');
      const nutritionData: Record<string, number> = {};
      
      for (const line of lines) {
        // Match patterns like "calories: 100" or "protein: 20g" or "Calories - 100"
        const match = line.match(/(?:calories|protein|carbs|fat)[:\s-]+(\d+)(?:g|kcal)?/i);
        if (match) {
          const value = parseInt(match[1]);
          if (!isNaN(value)) {
            const key = line.toLowerCase().match(/^[a-z]+/)?.[0] || '';
            nutritionData[key] = value;
          }
        }
      }

      if (Object.keys(nutritionData).length >= 4) {
        return {
          calories: nutritionData.calories || 0,
          protein: nutritionData.protein || 0,
          carbs: nutritionData.carbs || 0,
          fat: nutritionData.fat || 0
        };
      }

      return null;
    } catch (error) {
      console.error('Error parsing nutrition data:', error);
      return null;
    }
  };

  const isValidNutritionInfo = (data: any): data is NutritionInfo => {
    return (
      typeof data === 'object' &&
      data !== null &&
      typeof data.calories === 'number' &&
      typeof data.protein === 'number' &&
      typeof data.carbs === 'number' &&
      typeof data.fat === 'number'
    );
  };

  const analyzeMacros = async () => {
    if (ingredients.length === 0) {
      setError('Please add at least one ingredient')
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch('/api/macro-analyzer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients: ingredients.map(i => i.name),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze nutrition')
      }

      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }

      setNutritionInfo(data.nutrition)
    } catch (error) {
      console.error('Error analyzing nutrition:', error)
      setError(error instanceof Error ? error.message : 'Failed to analyze nutrition')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <main className="container mx-auto p-4 sm:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">🔍 Macro Analyzer</h1>
          <p className="text-gray-600">Analyze the nutritional content of your ingredients.</p>
        </div>

        <div className="space-y-6">
          {/* Ingredient Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Add your ingredients
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter an ingredient"
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addIngredient()}
                className="flex-1"
              />
              <Button 
                onClick={addIngredient}
                disabled={!newIngredient.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Ingredient Tags */}
          {ingredients.length > 0 && (
            <div>
              <div className="flex flex-wrap gap-2">
                {ingredients.map((ingredient) => (
                  <div 
                    key={ingredient} 
                    className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm"
                  >
                    <span>{ingredient}</span>
                    <button 
                      onClick={() => removeIngredient(ingredient)}
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

          {/* Analyze Button */}
          <Button
            onClick={analyzeMacros}
            disabled={isAnalyzing || ingredients.length === 0}
            className="w-full"
          >
            {isAnalyzing ? (
              <span className="flex items-center justify-center">
                <Spinner size="sm" className="mr-2" />
                Analyzing Nutrition...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <Calculator className="mr-2 h-4 w-4" />
                Analyze Nutrition
              </span>
            )}
          </Button>

          {/* Results */}
          {nutritionInfo && (
            <div className="mt-8 p-6 bg-white rounded-lg border shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Nutritional Analysis</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-primary/5 p-4 rounded-lg text-center">
                  <p className="text-sm font-medium text-primary mb-1">Calories</p>
                  <p className="text-2xl font-semibold text-gray-900">{nutritionInfo.calories}</p>
                  <p className="text-xs text-gray-500">kcal</p>
                </div>
                <div className="bg-primary/5 p-4 rounded-lg text-center">
                  <p className="text-sm font-medium text-primary mb-1">Protein</p>
                  <p className="text-2xl font-semibold text-gray-900">{nutritionInfo.protein}</p>
                  <p className="text-xs text-gray-500">g</p>
                </div>
                <div className="bg-primary/5 p-4 rounded-lg text-center">
                  <p className="text-sm font-medium text-primary mb-1">Carbs</p>
                  <p className="text-2xl font-semibold text-gray-900">{nutritionInfo.carbs}</p>
                  <p className="text-xs text-gray-500">g</p>
                </div>
                <div className="bg-primary/5 p-4 rounded-lg text-center">
                  <p className="text-sm font-medium text-primary mb-1">Fat</p>
                  <p className="text-2xl font-semibold text-gray-900">{nutritionInfo.fat}</p>
                  <p className="text-xs text-gray-500">g</p>
                </div>
              </div>
              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 italic">
                  Note: These are estimated values and may vary based on specific varieties and preparation methods.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
