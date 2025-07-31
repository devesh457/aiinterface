'use client'

import { Bot, MessageSquare, TrendingUp, FileCheck } from 'lucide-react'
import Link from 'next/link'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function Home() {
  // Future tools can be easily added to this array
  const tools = [
    {
      id: 'chat',
      title: 'AI Chat',
      description: 'Chat with powerful open-source AI models',
      icon: MessageSquare,
      href: '/chat',
      gradient: 'from-blue-500 to-cyan-500',
      available: true
    },
    {
      id: 'mpr-insights',
      title: 'MPR Insights',
      description: 'Generate insights from monthly progress reports',
      icon: TrendingUp,
      href: '/mpr-insights',
      gradient: 'from-emerald-500 to-teal-500',
      available: true
    },
    {
      id: 'schedule-checker',
      title: 'Schedule B & C Checker',
      description: 'Upload and analyze Schedule B & C documents with AI',
      icon: FileCheck,
      href: '/schedule-checker',
      gradient: 'from-orange-500 to-red-500',
      available: true
    }
    // Future tools will be added here:
    // {
    //   id: 'documents',
    //   title: 'Document Insights',
    //   description: 'Analyze documents with AI-powered insights',
    //   icon: FileText,
    //   href: '/documents',
    //   gradient: 'from-green-500 to-emerald-500',
    //   available: false
    // },
    // {
    //   id: 'knowledge-base',
    //   title: 'Knowledge Base',
    //   description: 'Create and manage AI knowledge bases',
    //   icon: Database,
    //   href: '/knowledge-bases',
    //   gradient: 'from-purple-500 to-violet-500',
    //   available: false
    // }
  ]

  const availableTools = tools.filter(tool => tool.available)

  return (
    <MainLayout>
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <div className="relative inline-block mb-6">
              <Bot className="h-20 w-20 text-primary mx-auto" />
              <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-green-500 animate-pulse" />
            </div>
            <h1 className="text-5xl font-bold tracking-tight mb-4">
              AI Interface
            </h1>
            <p className="text-xl text-muted-foreground">
              Your gateway to powerful AI tools and models
            </p>
          </div>

          {/* Tools Grid - Will expand as more tools are added */}
          <div className={`grid gap-6 ${availableTools.length === 1 ? 'max-w-md mx-auto' : availableTools.length === 2 ? 'md:grid-cols-2 max-w-2xl mx-auto' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
            {availableTools.map((tool) => {
              const Icon = tool.icon
              return (
                <Link key={tool.id} href={tool.href} className="block">
                  <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/50 h-full relative">
                    <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-5 rounded-lg pointer-events-none`} />
                    <CardHeader className="text-center pb-4 relative z-10">
                      <div className={`p-4 rounded-full bg-gradient-to-br ${tool.gradient} w-fit mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                        {tool.title}
                      </CardTitle>
                      <CardDescription className="text-base">
                        {tool.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center relative z-10">
                      <Button size="lg" className="w-full text-lg py-6 group-hover:bg-primary group-hover:text-primary-foreground pointer-events-none">
                        Get Started
                        <Icon className="h-5 w-5 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>

          {/* Coming Soon Section - Will show future tools */}
          {tools.some(tool => !tool.available) && (
            <div className="mt-12 text-center">
              <h3 className="text-lg font-semibold text-muted-foreground mb-4">Coming Soon</h3>
              <div className="flex justify-center gap-4">
                {tools.filter(tool => !tool.available).map((tool) => {
                  const Icon = tool.icon
                  return (
                    <div key={tool.id} className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-full">
                      <Icon className="h-4 w-4" />
                      {tool.title}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Powered by open-source AI models and cutting-edge technology
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  )
} 