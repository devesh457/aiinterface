'use client'

import { useState, useEffect, useRef } from 'react'
import { Bot, ExternalLink, RefreshCw, AlertCircle, Maximize2, Minimize2 } from 'lucide-react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { chainlitConfig, getChainlitUrl, isChainlitAvailable } from '@/lib/chainlit-config'

interface ChainlitChatProps {
  className?: string
}

export function ChainlitChat({ className = '' }: ChainlitChatProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAvailable, setIsAvailable] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkChainlitAvailability()
  }, [])

  const checkChainlitAvailability = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const available = await isChainlitAvailable()
      setIsAvailable(available)
      
      if (!available) {
        setError('Chainlit chat server is not available. Please start the Chainlit server.')
      }
    } catch (err) {
      console.error('Error checking Chainlit availability:', err)
      setError('Failed to connect to chat service.')
      setIsAvailable(false)
    } finally {
      setIsLoading(false)
    }
  }

  const openChainlitChat = () => {
    const chatUrl = getChainlitUrl('/chat/')
    window.open(chatUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes')
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-full min-h-[600px] ${className}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Checking Chainlit availability...</p>
        </div>
      </div>
    )
  }

  if (error || !isAvailable) {
    return (
      <div className={`flex items-center justify-center h-full min-h-[600px] ${className}`}>
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Chat Service Unavailable
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              {error || 'The advanced chat service is currently unavailable.'}
            </p>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Make sure the MPRBOT container is running:
              </p>
              <code className="block bg-muted p-2 rounded text-sm">
                docker-compose up -d
              </code>
            </div>
            <Button onClick={checkChainlitAvailability} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      {/* Chat Launch Interface */}
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Bot className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl">Advanced AI Chat with Chainlit</CardTitle>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
              Connected
            </span>
            <span className="text-sm text-muted-foreground">
              Ready to chat with AI models
            </span>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Experience advanced conversational AI with Google OAuth authentication, 
              persistent chat history, and multiple AI models including AWS Bedrock Nova and Google Gemini.
            </p>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">🤖 AI Models</h3>
                <p className="text-sm text-muted-foreground">
                  AWS Bedrock Nova & Google Gemini
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">💾 Persistent Memory</h3>
                <p className="text-sm text-muted-foreground">
                  Your conversations are saved with PostgreSQL
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">🔐 Secure Auth</h3>
                <p className="text-sm text-muted-foreground">
                  Google OAuth for secure authentication
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">📁 File Upload</h3>
                <p className="text-sm text-muted-foreground">
                  Upload documents for AI analysis
                </p>
              </div>
            </div>
            
            <div className="pt-4">
              <Button 
                onClick={openChainlitChat} 
                size="lg"
                className="w-full md:w-auto px-8 py-4 text-lg"
              >
                <Bot className="h-5 w-5 mr-2" />
                Launch AI Chat
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
              
              <p className="text-xs text-muted-foreground mt-2">
                Opens in a new window for optimal OAuth experience
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ChatPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">AI Chat</h1>
            <p className="text-muted-foreground">
              Advanced conversational AI powered by AWS Bedrock & Google Gemini with persistent memory
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              Powered by <span className="font-medium text-primary">Chainlit</span>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <ChainlitChat />
      </div>
    </MainLayout>
  )
}
