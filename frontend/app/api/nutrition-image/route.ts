import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    
    // Add timeout to the fetch request
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 20000) // 20 second timeout for image processing

    try {
      const response = await fetch(`${BACKEND_URL}/nutrition-image`, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Backend server error: ${response.status}`)
      }

      const data = await response.json()
      return NextResponse.json(data)
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { 
            error: 'The request took too long to process. Please try again.' 
          },
          { status: 408 }
        )
      }
      
      if (error.message?.includes('fetch failed')) {
        return NextResponse.json(
          { 
            error: 'Unable to connect to the nutrition image analysis service. Please ensure the backend server is running and try again.' 
          },
          { status: 503 }
        )
      }

      throw error // Re-throw other errors to be caught by outer try-catch
    }
  } catch (error) {
    console.error('Nutrition Image API error:', error)
    return NextResponse.json(
      { 
        error: 'The nutrition image analysis service is currently unavailable. Please try again later or contact support if the issue persists.' 
      },
      { status: 500 }
    )
  }
} 