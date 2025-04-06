'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Search, Navigation, Crosshair } from "lucide-react"
import { motion } from "framer-motion"
import { Spinner } from "@/components/ui/spinner"

export default function GetStarted() {
  const router = useRouter()
  const [location, setLocation] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [searchType, setSearchType] = useState<'zip' | 'area'>('zip')
  const [isGeolocating, setIsGeolocating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!location.trim()) return

    setIsLoading(true)
    
    // Simulate loading for better UX
    setTimeout(() => {
      router.push(`/marketplace?location=${encodeURIComponent(location)}`)
    }, 1000)
  }

  const toggleSearchType = () => {
    setSearchType(prev => prev === 'zip' ? 'area' : 'zip')
  }

  const useCurrentLocation = () => {
    setIsGeolocating(true)
    
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser")
      setIsGeolocating(false)
      return
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setLocation(`${latitude},${longitude}`)
        setIsGeolocating(false)
      },
      (error) => {
        console.error('Error getting location:', error)
        alert("Unable to retrieve your location. Please enter it manually.")
        setIsGeolocating(false)
      }
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-b from-green-50 to-white">
      <motion.div 
        className="w-full max-w-md p-6 bg-white rounded-xl shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-center mb-6">Find Local Farmer's Markets</h1>
        <p className="text-gray-600 text-center mb-8">
          Enter your location to discover fresh produce and local markets near you.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              {searchType === 'zip' ? 'ZIP Code' : 'Area Location'}
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                id="location"
                type="text"
                placeholder={searchType === 'zip' ? "Enter ZIP code" : "Enter city, neighborhood, or area"}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10 border-gray-300 focus:border-primary focus:ring-primary"
                required
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {searchType === 'zip' 
                ? "Enter your 5-digit ZIP code to find markets in your area" 
                : "Enter a city, neighborhood, or area name to find nearby markets"}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              type="button"
              variant="outline"
              onClick={toggleSearchType}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              {searchType === 'zip' ? 'Search by Area' : 'Search by ZIP'}
            </Button>
            <Button 
              type="button"
              variant="outline"
              onClick={useCurrentLocation}
              disabled={isGeolocating}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              {isGeolocating ? (
                <span className="flex items-center justify-center">
                  <Spinner size="sm" className="mr-2" />
                  Locating...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Crosshair className="mr-2 h-4 w-4" />
                  Use My Location
                </span>
              )}
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Spinner size="sm" className="mr-2" />
                  Finding markets...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Search className="mr-2 h-4 w-4" />
                  Find Markets
                </span>
              )}
            </Button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <a 
            href="https://www.usps.com/manage/addresses.htm" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline"
          >
            Need to look up a ZIP code?
          </a>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-100">
          <h2 className="text-lg font-semibold mb-3">How it works</h2>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="bg-primary/10 rounded-full p-2 mr-3">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Enter your location</h3>
                <p className="text-sm text-gray-600">Provide your ZIP code or area name</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-primary/10 rounded-full p-2 mr-3">
                <Navigation className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Find nearby markets</h3>
                <p className="text-sm text-gray-600">We'll show you markets sorted by distance</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-primary/10 rounded-full p-2 mr-3">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Explore products</h3>
                <p className="text-sm text-gray-600">Browse available products at each market</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  )
} 