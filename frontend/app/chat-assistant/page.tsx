'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquare, Send } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

interface ChatResponse {
  message: string
  highlights: string[]
}

interface Message {
  text: string
  isUser: boolean
  highlights?: string[]
  error?: boolean
}

export default function ChatAssistant() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isBackendError, setIsBackendError] = useState(false)

  const parseResponse = (data: any): ChatResponse => {
    if (!data) {
      return {
        message: "I apologize, but I couldn't process your request. Please try again.",
        highlights: []
      }
    }

    if (data.error) {
      return {
        message: data.error,
        highlights: []
      }
    }

    try {
      const text = data.response
      if (!text) {
        return {
          message: "I apologize, but I received an empty response. Please try again.",
          highlights: []
        }
      }

      const lines = text.split('\n')
      const response: ChatResponse = {
        message: '',
        highlights: [],
      }

      let isHighlight = false
      for (const line of lines) {
        if (line.toLowerCase().includes('highlights:')) {
          isHighlight = true
          continue
        }

        if (isHighlight) {
          if (line.trim().startsWith('-')) {
            response.highlights.push(line.trim().substring(1).trim())
          }
        } else {
          response.message += line + '\n'
        }
      }

      return {
        message: response.message.trim() || "I understand you're asking about nutrition. Could you please provide more context about what specific information you're looking for?",
        highlights: response.highlights
      }
    } catch (error) {
      console.error('Error parsing response:', error)
      return {
        message: "I apologize, but I couldn't process your request properly. Please try again.",
        highlights: []
      }
    }
  }

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage = input.trim()
    setInput("")
    setIsLoading(true)
    setIsBackendError(false)

    // Add user message to chat
    setMessages(prev => [...prev, { text: userMessage, isUser: true }])

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error('Backend service error')
      }

      const parsedResponse = parseResponse(data)

      // Add AI response to chat
      setMessages(prev => [...prev, {
        text: parsedResponse.message,
        isUser: false,
        highlights: parsedResponse.highlights,
        error: !response.ok
      }])
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        text: "Unable to connect to the nutrition service. Please ensure the backend server is running and try again.",
        isUser: false,
        error: true
      }])
      setIsBackendError(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col h-[calc(100vh-200px)]">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
            <MessageSquare className="h-8 w-8 text-primary" />
            Chat Assistant
          </h1>
          <p className="text-gray-600">
            Get personalized nutrition advice and wellness recommendations from our AI assistant.
            Ask about any food item, dietary concerns, or wellness goals!
          </p>
          {isBackendError && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
              <p className="text-sm">
                ⚠️ The nutrition service is currently experiencing issues. Your questions might not be processed correctly.
                Please try again later or contact support if the issue persists.
              </p>
            </div>
          )}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto mb-6 space-y-4 bg-gray-50/50 rounded-lg p-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Try asking questions like:<br />
              "What are the health benefits of oranges?"<br />
              "Can you suggest a balanced meal plan?"<br />
              "What nutrients are important for energy?"
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.isUser
                      ? 'bg-primary text-white'
                      : message.error
                      ? 'bg-red-50 border border-red-200 text-red-700'
                      : 'bg-white border shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>
                  {message.highlights && message.highlights.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="font-semibold mb-2">Key Points:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {message.highlights.map((highlight, i) => (
                          <li key={i} className="text-sm">{highlight}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Input
              placeholder="Ask about nutrition, wellness, or specific foods..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full p-4"
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="h-[46px]"
          >
            {isLoading ? (
              <Spinner size="sm" />
            ) : (
              <>
                <Send className="h-5 w-5" />
                <span className="sr-only">Send message</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}