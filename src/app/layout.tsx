import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Interface - Multi-Tool AI Platform',
  description: 'AI Interface platform with chat, document insights, and knowledge base analysis using FastAPI and Next.js',
  keywords: ['AI', 'Chat', 'Documents', 'Knowledge Base', 'Ollama', 'Gemini'],
  authors: [{ name: 'AI Interface Team' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
} 