'use client'

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { MapPin, Clock, Leaf, Apple, Carrot, Egg, Fish, Beef, Wheat, Utensils, Droplet, Coffee, ChefHat, Salad, Plus, X } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

type Market = {
  id: string
  name: string
  address: string
  products: string
  schedule: string
  googleLink: string
  distance?: number
}

type Product = {
  name: string
  category: string
  icon?: React.ReactNode
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Product category mapping
const getProductCategory = (product: string): { category: string, icon: React.ReactNode } => {
  const lowerProduct = product.toLowerCase()
  
  if (lowerProduct.includes('apple') || lowerProduct.includes('berry') || lowerProduct.includes('fruit')) {
    return { category: 'Fruits', icon: <Apple className="h-5 w-5 text-red-500" /> }
  }
  if (lowerProduct.includes('carrot') || lowerProduct.includes('kale') || lowerProduct.includes('spinach') || lowerProduct.includes('lettuce')) {
    return { category: 'Vegetables', icon: <Carrot className="h-5 w-5 text-orange-500" /> }
  }
  if (lowerProduct.includes('egg')) {
    return { category: 'Dairy & Eggs', icon: <Egg className="h-5 w-5 text-yellow-500" /> }
  }
  if (lowerProduct.includes('fish') || lowerProduct.includes('salmon')) {
    return { category: 'Seafood', icon: <Fish className="h-5 w-5 text-blue-500" /> }
  }
  if (lowerProduct.includes('beef') || lowerProduct.includes('meat') || lowerProduct.includes('chicken')) {
    return { category: 'Meat', icon: <Beef className="h-5 w-5 text-red-700" /> }
  }
  if (lowerProduct.includes('bread') || lowerProduct.includes('pasta') || lowerProduct.includes('flour')) {
    return { category: 'Grains', icon: <Wheat className="h-5 w-5 text-amber-700" /> }
  }
  if (lowerProduct.includes('honey') || lowerProduct.includes('syrup')) {
    return { category: 'Sweeteners', icon: <Droplet className="h-5 w-5 text-amber-500" /> }
  }
  if (lowerProduct.includes('coffee') || lowerProduct.includes('tea')) {
    return { category: 'Beverages', icon: <Coffee className="h-5 w-5 text-brown-500" /> }
  }
  if (lowerProduct.includes('soap') || lowerProduct.includes('candle')) {
    return { category: 'Home Goods', icon: <Utensils className="h-5 w-5 text-gray-500" /> }
  }
  
  return { category: 'Produce', icon: <Leaf className="h-5 w-5 text-green-500" /> }
}

export default function MarketDetailsClient({ id }: { id: string }) {
  const [market, setMarket] = useState<Market | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showMealPlanner, setShowMealPlanner] = useState(false)
  const [showSmartBundles, setShowSmartBundles] = useState(false)
  const [mealPlan, setMealPlan] = useState("")
  const [bundles, setBundles] = useState("")
  const [wellnessGoal, setWellnessGoal] = useState("")
  const [isGeneratingMealPlan, setIsGeneratingMealPlan] = useState(false)
  const [isGeneratingBundles, setIsGeneratingBundles] = useState(false)

  useEffect(() => {
    const fetchMarketDetails = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/produce-nearby?location=${id}`)
        if (!res.ok) throw new Error('Failed to fetch market details')
        
        const data = await res.json()
        const marketData = data.markets.find((m: Market) => m.id === id)
        
        if (marketData) {
          setMarket(marketData)
          // Process products
          const productList = marketData.products.split(',').map((p: string) => {
            const { category, icon } = getProductCategory(p.trim())
            return {
              name: p.trim(),
              category,
              icon
            }
          })
          setProducts(productList)
        } else {
          setError('Market not found')
        }
      } catch (error) {
        console.error('Error fetching market details:', error)
        setError('Failed to load market details')
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchMarketDetails()
    }
  }, [id])

  const generateMealPlan = async () => {
    if (!wellnessGoal) return
    
    setIsGeneratingMealPlan(true)
    try {
      const res = await fetch(`${BACKEND_URL}/planner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: wellnessGoal,
          available_products: products.map(p => p.name)
        })
      })
      
      if (!res.ok) throw new Error('Failed to generate meal plan')
      
      const data = await res.json()
      setMealPlan(data.meal_plan)
    } catch (error) {
      console.error('Error generating meal plan:', error)
      setError('Failed to generate meal plan')
    } finally {
      setIsGeneratingMealPlan(false)
    }
  }

  const generateSmartBundles = async () => {
    setIsGeneratingBundles(true)
    try {
      const res = await fetch(`${BACKEND_URL}/bundle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: products.map(p => p.name)
        })
      })
      
      if (!res.ok) throw new Error('Failed to generate bundles')
      
      const data = await res.json()
      setBundles(data.bundles)
    } catch (error) {
      console.error('Error generating bundles:', error)
      setError('Failed to generate bundles')
    } finally {
      setIsGeneratingBundles(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (error || !market) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-600">{error || 'Market not found'}</p>
            <Link href="/marketplace">
              <Button className="mt-4">Back to Marketplace</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/marketplace">
          <Button variant="outline" className="mb-6">
            ← Back to Marketplace
          </Button>
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold mb-4">{market.name}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center mb-2">
                <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                <span>{market.address}</span>
              </div>
              <div className="flex items-center mb-2">
                <Clock className="h-5 w-5 text-gray-500 mr-2" />
                <span>{market.schedule}</span>
              </div>
              {market.distance && (
                <div className="text-sm text-gray-500">
                  {market.distance} km away
                </div>
              )}
              <a
                href={market.googleLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4"
              >
                <Button variant="outline">
                  View on Google Maps
                </Button>
              </a>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Available Products</h2>
              <div className="grid grid-cols-2 gap-4">
                {products.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 p-2 bg-gray-50 rounded"
                  >
                    {product.icon}
                    <span>{product.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Meal Planner */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Meal Planner</h2>
            <div className="space-y-4">
              <Input
                placeholder="Enter your wellness goal (e.g., 'High protein meals')"
                value={wellnessGoal}
                onChange={(e) => setWellnessGoal(e.target.value)}
              />
              <Button
                onClick={generateMealPlan}
                disabled={isGeneratingMealPlan || !wellnessGoal}
                className="w-full"
              >
                {isGeneratingMealPlan ? (
                  <Spinner className="h-5 w-5 mr-2" />
                ) : (
                  <ChefHat className="h-5 w-5 mr-2" />
                )}
                Generate Meal Plan
              </Button>
              {mealPlan && (
                <div className="mt-4 p-4 bg-gray-50 rounded">
                  <pre className="whitespace-pre-wrap">{mealPlan}</pre>
                </div>
              )}
            </div>
          </div>

          {/* Smart Bundles */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Smart Bundles</h2>
            <div className="space-y-4">
              <Button
                onClick={generateSmartBundles}
                disabled={isGeneratingBundles}
                className="w-full"
              >
                {isGeneratingBundles ? (
                  <Spinner className="h-5 w-5 mr-2" />
                ) : (
                  <Salad className="h-5 w-5 mr-2" />
                )}
                Generate Bundles
              </Button>
              {bundles && (
                <div className="mt-4 p-4 bg-gray-50 rounded">
                  <pre className="whitespace-pre-wrap">{bundles}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 