'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Bot, 
  TrendingUp,
  FileCheck,
  Settings, 
  User,
  LogOut,
  Moon,
  Sun
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const router = useRouter()

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.classList.toggle('dark')
  }

  const handleLogout = () => {
    // TODO: Implement logout logic
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left side - Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="relative">
            <Bot className="h-8 w-8 text-primary" />
            <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500 animate-pulse" />
          </div>
          <span className="font-bold text-xl gradient-text">AI Interface</span>
        </Link>

        {/* Center - Navigation links (will expand with more tools) */}
        <nav className="flex items-center gap-6">
          <Link 
            href="/chat" 
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <Bot className="h-4 w-4" />
            Chat
          </Link>
          <Link 
            href="/mpr-insights" 
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <TrendingUp className="h-4 w-4" />
            MPR Insights
          </Link>
          <Link 
            href="/schedule-checker" 
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <FileCheck className="h-4 w-4" />
            Schedule Checker
          </Link>
          {/* Future navigation items will be added here */}
        </nav>

        {/* Right side - Theme toggle and user menu */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9"
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>

          {/* User menu */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Settings className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-2 px-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium hidden sm:block">John Doe</span>
            </div>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout}
              className="h-9 w-9 text-destructive hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
} 