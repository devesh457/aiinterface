/**
 * Path utilities for handling different deployment modes
 */

// Check if we're in AI Tools mode (default true)
export const isAIToolsMode = process.env.NEXT_PUBLIC_AI_TOOLS_MODE !== 'false'

// Get the correct base path
export const getBasePath = () => isAIToolsMode ? '/ai_tools' : '/mpr'

// Helper to build paths correctly
export const buildPath = (path: string) => {
  const basePath = getBasePath()
  // Remove leading slash from path if it exists to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  // For home path, just return the base path
  if (!cleanPath) return basePath || '/'
  return basePath ? `${basePath}/${cleanPath}` : `/${cleanPath}`
}

// Pre-built common paths
export const paths = {
  home: '/',
  chat: '/chat',
  mprInsights: '/mpr-insights',
  scheduleChecker: '/schedule-checker'
}
