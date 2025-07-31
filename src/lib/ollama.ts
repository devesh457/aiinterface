export interface OllamaModel {
  name: string
  model: string
  size: number
  digest: string
  details: {
    format: string
    family: string
    families: string[] | null
    parameter_size: string
    quantization_level: string
  }
  modified_at: string
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatResponse {
  model: string
  created_at: string
  message: {
    role: string
    content: string
  }
  done: boolean
  total_duration?: number
  load_duration?: number
  prompt_eval_count?: number
  prompt_eval_duration?: number
  eval_count?: number
  eval_duration?: number
}

interface OllamaErrorResponse {
  error: string
}

class OllamaAPI {
  private baseUrl: string

  constructor(baseUrl: string = 'http://localhost:11434') {
    this.baseUrl = baseUrl
  }

  /**
   * Get list of available models from Ollama
   */
  async getAvailableModels(): Promise<OllamaModel[]> {
    try {
      console.log('🔍 Fetching available models from Ollama...')
      const response = await fetch(`${this.baseUrl}/api/tags`)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Failed to fetch models:', response.status, errorText)
        throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('✅ Available models:', data.models?.map((m: OllamaModel) => m.name) || [])
      return data.models || []
    } catch (error) {
      console.error('❌ Error fetching Ollama models:', error)
      throw error
    }
  }

  /**
   * Check if Ollama server is running
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`)
      const isHealthy = response.ok
      console.log(`🏥 Ollama health check: ${isHealthy ? '✅ Healthy' : '❌ Unhealthy'}`)
      return isHealthy
    } catch (error) {
      console.log('🏥 Ollama health check: ❌ Not reachable')
      return false
    }
  }

  /**
   * Test a simple generation to verify model works
   */
  async testModel(model: string): Promise<boolean> {
    try {
      console.log(`🧪 Testing model: ${model}`)
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt: 'Hello',
          stream: false,
          options: {
            num_predict: 5
          }
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ Model test failed for ${model}:`, response.status, errorText)
        return false
      }

      const data = await response.json()
      console.log(`✅ Model ${model} is working:`, data.response?.substring(0, 50) + '...')
      return true
    } catch (error) {
      console.error(`❌ Error testing model ${model}:`, error)
      return false
    }
  }

  /**
   * Send chat message with streaming support
   */
  async *streamChat(
    model: string,
    messages: ChatMessage[],
    options: {
      temperature?: number
      max_tokens?: number
    } = {}
  ): AsyncGenerator<string, void, unknown> {
    try {
      console.log(`🚀 Starting streaming chat with model: ${model}`)
      console.log('💬 Messages:', messages)
      console.log('⚙️ Options:', options)

      const requestBody = {
        model,
        messages,
        stream: true,
        options: {
          temperature: options.temperature || 0.7,
          num_predict: options.max_tokens || 2048,
        },
      }

      console.log('📤 Request body:', JSON.stringify(requestBody, null, 2))

      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      console.log(`📥 Response status: ${response.status} ${response.statusText}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Ollama API error response:', errorText)
        
        try {
          const errorJson = JSON.parse(errorText) as OllamaErrorResponse
          throw new Error(`Ollama API error: ${errorJson.error}`)
        } catch {
          throw new Error(`Ollama API error: ${response.status} ${response.statusText} - ${errorText}`)
        }
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('Failed to get response reader')
      }

      const decoder = new TextDecoder()
      let buffer = ''
      let chunkCount = 0

      try {
        while (true) {
          const { done, value } = await reader.read()
          
          if (done) {
            console.log(`✅ Streaming completed. Total chunks: ${chunkCount}`)
            break
          }

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          
          // Keep the last potentially incomplete line in the buffer
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.trim()) {
              try {
                const data: ChatResponse = JSON.parse(line)
                chunkCount++
                
                if (data.message?.content) {
                  yield data.message.content
                }
                if (data.done) {
                  console.log('✅ Received done signal from Ollama')
                  return
                }
              } catch (parseError) {
                console.warn('⚠️ Failed to parse streaming response line:', line, parseError)
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }
    } catch (error) {
      console.error('❌ Error in Ollama streaming chat:', error)
      throw error
    }
  }

  /**
   * Send a single chat message (non-streaming) for testing
   */
  async sendMessage(
    model: string,
    messages: ChatMessage[],
    options: {
      temperature?: number
      max_tokens?: number
    } = {}
  ): Promise<string> {
    try {
      console.log(`🚀 Sending non-streaming message to model: ${model}`)
      
      const requestBody = {
        model,
        messages,
        stream: false,
        options: {
          temperature: options.temperature || 0.7,
          num_predict: options.max_tokens || 2048,
        },
      }

      console.log('📤 Request body:', JSON.stringify(requestBody, null, 2))

      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      console.log(`📥 Response status: ${response.status} ${response.statusText}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Ollama API error response:', errorText)
        
        try {
          const errorJson = JSON.parse(errorText) as OllamaErrorResponse
          throw new Error(`Ollama API error: ${errorJson.error}`)
        } catch {
          throw new Error(`Ollama API error: ${response.status} ${response.statusText} - ${errorText}`)
        }
      }

      const data: ChatResponse = await response.json()
      console.log('✅ Received response:', data)
      return data.message?.content || ''
    } catch (error) {
      console.error('❌ Error in Ollama chat:', error)
      throw error
    }
  }
}

export const ollama = new OllamaAPI()

/**
 * Format model name for display
 */
export function formatModelName(modelName: string): string {
  return modelName
    .split(':')[0] // Remove tag (e.g., ":latest")
    .split('/')
    .pop() // Get the last part after /
    ?.replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase()) || modelName
}

/**
 * Get model description based on common model names
 */
export function getModelDescription(modelName: string): string {
  const name = modelName.toLowerCase()
  
  if (name.includes('llama2') || name.includes('llama-2')) {
    if (name.includes('13b')) return 'Large language model with 13B parameters, excellent reasoning'
    if (name.includes('70b')) return 'Powerful 70B parameter model for complex tasks'
    return 'Fast and efficient general-purpose language model'
  }
  
  if (name.includes('codellama') || name.includes('code-llama')) {
    return 'Specialized for coding tasks and programming assistance'
  }
  
  if (name.includes('mistral')) {
    return 'High performance instruction-following model'
  }
  
  if (name.includes('qwen')) {
    return 'Excellent for multilingual tasks and reasoning'
  }
  
  if (name.includes('dolphin')) {
    return 'Uncensored model fine-tuned for helpful responses'
  }
  
  if (name.includes('neural-chat')) {
    return 'Optimized for conversational AI applications'
  }
  
  if (name.includes('openchat')) {
    return 'High-quality open-source conversational model'
  }
  
  if (name.includes('zephyr')) {
    return 'Helpful assistant model for various tasks'
  }
  
  return 'AI language model for text generation and conversation'
} 