/** @type {import('next').NextConfig} */
// Check if this is for AI Tools (default true) or regular MPR 
const isAITools = process.env.NEXT_PUBLIC_AI_TOOLS_MODE !== 'false'

const nextConfig = {
  // Only use basePath for regular MPR, not for AI Tools
  basePath: isAITools ? '/ai_tools' : '/mpr',
  // assetPrefix: isAITools ? '/ai_tools/' : '/mpr/',  // Removed - causes static asset loading issues

  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/:path*`,
      },
    ]
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    }
    return config
  },
}

module.exports = nextConfig