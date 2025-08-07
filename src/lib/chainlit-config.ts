/**
 * Configuration for Chainlit chat integration
 */

export const chainlitConfig = {
  // Chainlit server configuration
  serverUrl: process.env.NEXT_PUBLIC_CHAINLIT_URL || 'http://localhost:8003',
  
  // Integration modes
  integrationMode: process.env.NEXT_PUBLIC_CHAINLIT_INTEGRATION_MODE || 'iframe', // 'iframe' | 'proxy' | 'embedded'
  
  // Authentication
  enableAuth: process.env.NEXT_PUBLIC_CHAINLIT_AUTH_ENABLED === 'true',
  
  // UI customization
  theme: {
    primaryColor: '#6366f1', // Match the main interface theme
    backgroundColor: '#ffffff',
    textColor: '#1f2937'
  },
  
  // Features
  features: {
    fileUpload: true,
    voiceChat: false,
    persistence: true,
    multiModel: true
  }
}

export const getChainlitUrl = (path: string = '/chat/') => {
  return `${chainlitConfig.serverUrl}${path}`
}

export const isChainlitAvailable = async (): Promise<boolean> => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    const response = await fetch(`${chainlitConfig.serverUrl}/chat/`, {
      method: 'GET',
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    return response.ok
  } catch (error) {
    console.warn('Chainlit server not available:', error)
    return false
  }
}
