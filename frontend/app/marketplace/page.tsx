'use client'

import { useEffect, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ShoppingBag, Calendar, Package, Calculator, MessageSquare, MapPin, Clock, Leaf, Apple, Carrot, Egg, Fish, Beef, Wheat, Utensils, Droplet, Coffee, Search, Navigation, Crosshair, ChefHat, Salad, Plus, X } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Spinner } from "@/components/ui/spinner"
import _ from 'lodash'

type Market = {
  id: string
  name: string
  address: string
  products: string
  schedule: string
  googleLink: string
  distance?: number
}

type Location = {
  name: string
  latitude: number
  longitude: number
}

type Product = {
  name: string
  category: string
  icon?: React.ReactNode
}

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
  
  // Default category
  return { category: 'Produce', icon: <Leaf className="h-5 w-5 text-green-500" /> }
}

// Get the backend URL from environment variables
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function Marketplace() {
  const searchParams = useSearchParams()
  const locationParam = searchParams.get('location')
  const [markets, setMarkets] = useState<Market[]>([])
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [searchLocation, setSearchLocation] = useState(locationParam || '')
  const [isLoading, setIsLoading] = useState(false)
  const [searchType, setSearchType] = useState<'zip' | 'area'>('zip')
  const [userLocation, setUserLocation] = useState<Location | null>(null)
  const [isGeolocating, setIsGeolocating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastSearched, setLastSearched] = useState<string | null>(null)
  const [showMealPlanner, setShowMealPlanner] = useState(false)
  const [showSmartBundles, setShowSmartBundles] = useState(false)
  const [showMacroAnalyzer, setShowMacroAnalyzer] = useState(false)
  const [mealPlan, setMealPlan] = useState<string>("")
  const [bundles, setBundles] = useState<string>("")
  const [nutritionEstimate, setNutritionEstimate] = useState<string>("")
  const [isGeneratingMealPlan, setIsGeneratingMealPlan] = useState(false)
  const [isGeneratingBundles, setIsGeneratingBundles] = useState(false)
  const [isAnalyzingNutrition, setIsAnalyzingNutrition] = useState(false)
  const [wellnessGoal, setWellnessGoal] = useState("")
  const [customProducts, setCustomProducts] = useState<string[]>([])
  const [newProduct, setNewProduct] = useState("")

  // Debounced search function
  const debouncedFetchMarkets = useCallback(
    _.debounce(async (searchTerm: string) => {
      if (!searchTerm.trim()) return
      
      setIsLoading(true)
      setError(null)
      
      try {
        const res = await fetch(`/api/marketplace?location=${encodeURIComponent(searchTerm)}`)
        if (!res.ok) {
          throw new Error('Failed to fetch markets')
        }
        
        const data = await res.json()
        if (data.error) {
          throw new Error(data.error)
        }
        
        setMarkets(data.markets || [])
        setError(null)
      } catch (err) {
        console.error('Error fetching markets:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch markets')
      } finally {
        setIsLoading(false)
      }
    }, 500),
    []
  )

  useEffect(() => {
    if (locationParam) {
      debouncedFetchMarkets(locationParam)
    }
    
    // Cleanup
    return () => {
      debouncedFetchMarkets.cancel()
    }
  }, [locationParam, debouncedFetchMarkets])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchLocation.trim()) {
      debouncedFetchMarkets(searchLocation)
    }
  }

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchLocation(value)
    if (value.length >= 3) {
      debouncedFetchMarkets(value)
    }
  }

  const useCurrentLocation = () => {
    setIsGeolocating(true)
    setError(null)
    
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      setIsGeolocating(false)
      return
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        
        try {
          const res = await fetch(`/api/marketplace?location=${latitude},${longitude}`)
          if (!res.ok) {
            throw new Error('Failed to fetch markets')
          }
          
          const data = await res.json()
          if (data.error) {
            throw new Error(data.error)
          }
          
          setMarkets(data.markets || [])
          setUserLocation({ name: 'Your Location', latitude, longitude })
          setError(null)
        } catch (err) {
          console.error('Error fetching markets:', err)
          setError(err instanceof Error ? err.message : 'Failed to fetch markets')
        } finally {
          setIsGeolocating(false)
        }
      },
      (err) => {
        console.error('Geolocation error:', err)
        setError("Unable to retrieve your location. Please enter your location manually.")
        setIsGeolocating(false)
      }
    )
  }

  const handleMarketSelect = (market: Market) => {
    setSelectedMarket(market)
    // Parse products string into array of products with categories
    const productList = market.products.split(', ').map(name => {
      const { category, icon } = getProductCategory(name)
      return {
        name,
        category,
        icon
      }
    })
    setProducts(productList)
    // Reset the meal planner and bundles when selecting a new market
    setShowMealPlanner(false)
    setShowSmartBundles(false)
    setMealPlan("")
    setBundles("")
  }

  const toggleSearchType = () => {
    setSearchType(searchType === 'zip' ? 'area' : 'zip')
    setSearchLocation('')
    setMarkets([])
    setError(null)
  }

  const addCustomProduct = () => {
    if (newProduct.trim() && !customProducts.includes(newProduct.trim())) {
      setCustomProducts([...customProducts, newProduct.trim()])
      setNewProduct("")
    }
  }

  const removeCustomProduct = (product: string) => {
    setCustomProducts(customProducts.filter(p => p !== product))
  }

  const generateMealPlan = async () => {
    if (selectedMarket && products.length > 0) {
      try {
        const response = await fetch('/api/planner', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            goal: "Create a healthy meal plan with the selected products",
            produce: products,
          }),
        })
        
        if (!response.ok) {
          throw new Error('Failed to generate meal plan')
        }
        
        const data = await response.json()
        if (data.error) {
          throw new Error(data.error)
        }
        
        // Navigate to planner page with the generated plan
        window.location.href = `/planner?plan=${encodeURIComponent(JSON.stringify(data))}`
      } catch (error) {
        console.error('Error generating meal plan:', error)
        setError(error instanceof Error ? error.message : 'Failed to generate meal plan')
      }
    }
  }

  const generateSmartBundles = async () => {
    if (selectedMarket && products.length > 0) {
      try {
        const response = await fetch('/api/bundle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            goal: "Create smart bundles with the selected products",
            produce: products,
          }),
        })
        
        if (!response.ok) {
          throw new Error('Failed to generate bundles')
        }
        
        const data = await response.json()
        if (data.error) {
          throw new Error(data.error)
        }
        
        // Navigate to bundle page with the generated bundles
        window.location.href = `/bundle?bundles=${encodeURIComponent(JSON.stringify(data))}`
      } catch (error) {
        console.error('Error generating bundles:', error)
        setError(error instanceof Error ? error.message : 'Failed to generate bundles')
      }
    }
  }

  const analyzeNutrition = async () => {
    if (customProducts.length > 0) {
      try {
        const response = await fetch('/api/macro-analyzer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ingredients: customProducts,
          }),
        })
        
        if (!response.ok) {
          throw new Error('Failed to analyze nutrition')
        }
        
        const data = await response.json()
        if (data.error) {
          throw new Error(data.error)
        }
        
        // Navigate to macro-analyzer page with the analysis results
        window.location.href = `/macro-analyzer?analysis=${encodeURIComponent(JSON.stringify(data))}`
      } catch (error) {
        console.error('Error analyzing nutrition:', error)
        setError(error instanceof Error ? error.message : 'Failed to analyze nutrition')
      }
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  }

  return (
    <main className="container mx-auto p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Find Farmers Markets Near You</h1>
          <p className="text-gray-600">Discover fresh, local produce from farmers markets in your area.</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="search" className="text-sm font-medium text-gray-700">
                  {searchType === 'zip' ? 'ZIP Code' : 'Location'}
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={toggleSearchType}
                    className={`text-xs px-2 py-1 rounded-md ${
                      searchType === 'zip'
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    ZIP
                  </button>
                  <button
                    type="button"
                    onClick={toggleSearchType}
                    className={`text-xs px-2 py-1 rounded-md ${
                      searchType === 'area'
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Area
                  </button>
                </div>
              </div>
              <div className="flex space-x-2">
                <Input
                  id="search"
                  type="text"
                  placeholder={
                    searchType === 'zip'
                      ? 'Enter ZIP code (e.g., 60616)'
                      : 'Enter city, neighborhood, or address'
                  }
                  value={searchLocation}
                  onChange={handleSearchInput}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={useCurrentLocation}
                  disabled={isGeolocating}
                  className="whitespace-nowrap"
                >
                  {isGeolocating ? (
                    <Spinner className="h-4 w-4 mr-2" />
                  ) : (
                    <Crosshair className="h-4 w-4 mr-2" />
                  )}
                  {isGeolocating ? 'Locating...' : 'Use My Location'}
                </Button>
                <Button type="submit" disabled={!searchLocation.trim() || isLoading}>
                  {isLoading ? (
                    <Spinner className="h-4 w-4 mr-2" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Search
                </Button>
              </div>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Results */}
        {markets.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              {userLocation ? `Markets near ${userLocation.name}` : 'Markets Found'}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {markets.map((market) => (
                <div
                  key={market.id}
                  className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleMarketSelect(market)}
                >
                  <h3 className="text-lg font-semibold">{market.name}</h3>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{market.address}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{market.schedule}</span>
                  </div>
                  {market.distance && (
                    <div className="text-sm text-gray-500 mt-1">
                      {market.distance.toFixed(1)} km away
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {market.products.split(',').map((product, index) => {
                      const { category, icon } = getProductCategory(product.trim())
                      return (
                        <div
                          key={index}
                          className="flex items-center bg-gray-100 rounded-full px-2 py-1 text-xs"
                        >
                          {icon}
                          <span className="ml-1">{product.trim()}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Market Details */}
        {selectedMarket && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-bold">{selectedMarket.name}</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedMarket(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center mb-2">
                  <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                  <span>{selectedMarket.address}</span>
                </div>
                <div className="flex items-center mb-2">
                  <Clock className="h-5 w-5 text-gray-500 mr-2" />
                  <span>{selectedMarket.schedule}</span>
                </div>
                {selectedMarket.distance && (
                  <div className="text-sm text-gray-500 mb-4">
                    {selectedMarket.distance.toFixed(1)} km away
                  </div>
                )}
                <a
                  href={selectedMarket.googleLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button variant="outline">
                    <Navigation className="h-4 w-4 mr-2" />
                    View on Google Maps
                  </Button>
                </a>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Available Products</h3>
                <div className="grid grid-cols-2 gap-2">
                  {products.map((product, index) => {
                    const { category, icon } = getProductCategory(product.name)
                    return (
                      <div
                        key={index}
                        className="flex items-center bg-gray-50 rounded p-2"
                      >
                        {icon}
                        <span className="ml-2">{product.name}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
            
            {/* Meal Planner and Smart Bundles */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Meal Planner */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Meal Planner</h3>
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
                      <Spinner className="h-4 w-4 mr-2" />
                    ) : (
                      <ChefHat className="h-4 w-4 mr-2" />
                    )}
                    Generate Meal Plan
                  </Button>
                  {mealPlan && (
                    <div className="mt-4 p-4 bg-white rounded border">
                      <pre className="whitespace-pre-wrap text-sm">{mealPlan}</pre>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Smart Bundles */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Smart Bundles</h3>
                <div className="space-y-4">
                  <Button
                    onClick={generateSmartBundles}
                    disabled={isGeneratingBundles}
                    className="w-full"
                  >
                    {isGeneratingBundles ? (
                      <Spinner className="h-4 w-4 mr-2" />
                    ) : (
                      <Salad className="h-4 w-4 mr-2" />
                    )}
                    Generate Bundles
                  </Button>
                  {bundles && (
                    <div className="mt-4 p-4 bg-white rounded border">
                      <pre className="whitespace-pre-wrap text-sm">{bundles}</pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
