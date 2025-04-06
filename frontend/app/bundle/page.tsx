'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShoppingBag, Plus, X, Package, Tag, Leaf } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

interface Bundle {
  name: string;
  description: string;
  items: string[];
  benefits: string[];
  price?: string;
}

interface BundleResponse {
  title: string;
  bundles: Bundle[];
  focus?: string;
  note?: string;
}

// Get the backend URL from environment variables
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function SmartBundles() {
  const [products, setProducts] = useState<string[]>([])
  const [newProduct, setNewProduct] = useState("")
  const [wellnessGoal, setWellnessGoal] = useState("")
  const [bundleResponse, setBundleResponse] = useState<BundleResponse | null>(null)
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

  const parseBundles = (text: string | undefined | null): BundleResponse | null => {
    try {
      // Check if text is undefined or null
      if (!text) {
        console.error('No text provided to parse')
        return null
      }

      // First try to clean up any markdown formatting
      const cleanText = text.replace(/```[a-z]*\n/g, '').replace(/```/g, '')
      
      // Initialize response object
      const response: BundleResponse = {
        title: '',
        bundles: []
      }

      // Split by lines and process each line
      const lines = cleanText.split('\n').map(line => line.trim()).filter(Boolean)
      
      // Debug log
      console.log('Processing lines:', lines)

      // Create a single bundle from the text
      const bundle: Bundle = {
        name: '',
        description: '',
        items: [],
        benefits: []
      }

      let currentSection: 'name' | 'description' | 'items' | 'benefits' | null = null
      
      for (const line of lines) {
        // Extract bundle name from title-like lines
        if (line.toLowerCase().includes('bundle') && !line.startsWith('-') && !line.startsWith('*')) {
          bundle.name = line.replace(/^[#\s]+/, '').trim()
          continue
        }

        // Handle sections
        if (line.toLowerCase().includes('why it\'s good for')) {
          currentSection = 'benefits'
          bundle.benefits.push(line.trim())
          continue
        }

        if (line.toLowerCase().includes('ingredients from produce')) {
          currentSection = 'items'
          continue
        }

        if (line.toLowerCase().includes('recipe idea')) {
          bundle.description += (bundle.description ? '\n' : '') + line.trim()
          continue
        }

        // Handle list items and content
        if (line.startsWith('-') || line.startsWith('*') || /^\d+\./.test(line)) {
          const item = line.replace(/^[-*\d.\s]+/, '').trim()
          
          if (currentSection === 'items') {
            bundle.items.push(item)
          } else if (currentSection === 'benefits') {
            bundle.benefits.push(item)
          } else if (item.toLowerCase().includes('benefit:')) {
            bundle.benefits.push(item.replace(/^benefit:/i, '').trim())
          } else {
            // If we can't determine the section but it's a list item, assume it's an item
            bundle.items.push(item)
          }
        } else if (line.length > 0) {
          // Non-list content gets added to the appropriate section or description
          if (currentSection === 'benefits') {
            bundle.benefits.push(line)
          } else if (currentSection === 'items') {
            bundle.items.push(line)
          } else {
            bundle.description += (bundle.description ? '\n' : '') + line
          }
        }
      }

      // Clean up empty arrays
      bundle.items = bundle.items.filter(Boolean)
      bundle.benefits = bundle.benefits.filter(Boolean)

      // Only add the bundle if it has content
      if (bundle.name || bundle.items.length > 0 || bundle.benefits.length > 0) {
        // If no name was found, use a default
        if (!bundle.name) {
          bundle.name = 'Smart Food Bundle'
        }
        response.bundles = [bundle]
      }

      // Debug log
      console.log('Parsed response:', response)

      return response
    } catch (error) {
      console.error('Error parsing bundles:', error)
      return null
    }
  }

  const generateBundles = async () => {
    if (products.length === 0 || !wellnessGoal) {
      setError('Please add products and select a wellness goal')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/bundle', {
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
        throw new Error('Failed to generate bundles')
      }

      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }

      setBundleResponse(data.bundles)
    } catch (error) {
      console.error('Error generating bundles:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate bundles')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <main className="container mx-auto p-4 sm:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">🛍️ Smart Bundles</h1>
          <p className="text-gray-600">Create personalized product bundles based on your wellness goals.</p>
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
              Add your available products
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter a product"
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
            onClick={generateBundles}
            disabled={isGenerating || products.length === 0 || !wellnessGoal}
            className="w-full"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center">
                <Spinner size="sm" className="mr-2" />
                Generating Bundles...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Generate Bundles
              </span>
            )}
          </Button>

          {/* Results */}
          {bundleResponse && (
            <div className="mt-8 space-y-6">
              <div className="bg-white rounded-lg border shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Your Smart Bundles</h2>
                
                {/* Focus Section */}
                {bundleResponse.focus && (
                  <div className="mb-6 bg-primary/5 p-4 rounded-lg">
                    <p className="text-sm font-medium text-primary mb-1">Focus</p>
                    <p className="text-gray-600">{bundleResponse.focus}</p>
                  </div>
                )}

                {/* Bundles Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                  {bundleResponse.bundles.map((bundle, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start gap-3 mb-4">
                        <Package className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{bundle.name}</h3>
                          <p className="text-gray-600 mt-1">{bundle.description}</p>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Tag className="h-4 w-4 text-primary" />
                            <p className="font-medium text-gray-900">Items</p>
                          </div>
                          <ul className="list-disc list-inside text-gray-600 space-y-1">
                            {bundle.items.map((item, itemIndex) => (
                              <li key={itemIndex}>{item}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Benefits */}
                        {bundle.benefits.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Leaf className="h-4 w-4 text-primary" />
                              <p className="font-medium text-gray-900">Benefits</p>
                            </div>
                            <ul className="list-disc list-inside text-gray-600 space-y-1">
                              {bundle.benefits.map((benefit, benefitIndex) => (
                                <li key={benefitIndex}>{benefit}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Price */}
                        {bundle.price && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm font-medium text-gray-900">
                              Estimated Price: <span className="text-primary">{bundle.price}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Note Section */}
                {bundleResponse.note && (
                  <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 italic">{bundleResponse.note}</p>
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
