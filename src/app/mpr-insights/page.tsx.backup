'use client'

import { useState } from 'react'
import { TrendingUp, Filter, Calendar, User, BarChart3, FileText, Search, Eye, ChevronDown } from 'lucide-react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface MPRInsight {
  id: string
  title: string
  content: string
  category: 'performance' | 'risk' | 'opportunity' | 'achievement'
  priority: 'high' | 'medium' | 'low'
  month: string
  year: string
  department: string
  author: string
  generatedDate: string
  viewableBy: string[] // User roles/departments that can see this insight
}

export default function MPRInsightsPage() {
  // Current user context (would come from auth)
  const currentUser = {
    id: 'user123',
    name: 'John Doe',
    role: 'manager',
    department: 'Engineering'
  }

  const [selectedFilter, setSelectedFilter] = useState<'all' | 'performance' | 'risk' | 'opportunity' | 'achievement'>('all')
  const [selectedMonth, setSelectedMonth] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Sample insights data - filtered based on user permissions
  const allInsights: MPRInsight[] = [
    {
      id: '1',
      title: 'Engineering Team Performance Exceeded Targets',
      content: 'The engineering team delivered 127% of planned features in January, with particularly strong performance in backend development. Key contributors include faster deployment cycles and improved code review processes.',
      category: 'achievement',
      priority: 'high',
      month: 'January',
      year: '2024',
      department: 'Engineering',
      author: 'System Analysis',
      generatedDate: '2024-02-01',
      viewableBy: ['manager', 'admin', 'Engineering']
    },
    {
      id: '2',
      title: 'Resource Allocation Risk Identified',
      content: 'Analysis shows potential resource constraints in Q2 due to 3 upcoming project overlaps. Recommend reviewing project timelines or additional staffing for the mobile app development track.',
      category: 'risk',
      priority: 'high',
      month: 'February',
      year: '2024',
      department: 'Engineering',
      author: 'System Analysis',
      generatedDate: '2024-03-01',
      viewableBy: ['manager', 'admin', 'Engineering']
    },
    {
      id: '3',
      title: 'Cross-Department Collaboration Opportunity',
      content: 'Marketing and Engineering teams show 40% overlap in customer feedback analysis. Opportunity to create shared insights dashboard to improve product-market alignment.',
      category: 'opportunity',
      priority: 'medium',
      month: 'February',
      year: '2024',
      department: 'Cross-functional',
      author: 'System Analysis',
      generatedDate: '2024-03-05',
      viewableBy: ['manager', 'admin', 'Engineering', 'Marketing']
    },
    {
      id: '4',
      title: 'Development Velocity Improvement',
      content: 'Sprint velocity increased by 23% compared to previous quarter. Contributing factors include new CI/CD pipeline implementation and team training completion.',
      category: 'performance',
      priority: 'medium',
      month: 'March',
      year: '2024',
      department: 'Engineering',
      author: 'System Analysis',
      generatedDate: '2024-04-01',
      viewableBy: ['manager', 'admin', 'Engineering']
    }
  ]

  // Filter insights based on user permissions
  const userVisibleInsights = allInsights.filter(insight => 
    insight.viewableBy.some(permission => 
      permission === currentUser.role || 
      permission === currentUser.department ||
      permission === 'admin'
    )
  )

  // Apply filters
  const filteredInsights = userVisibleInsights.filter(insight => {
    const matchesCategory = selectedFilter === 'all' || insight.category === selectedFilter
    const matchesMonth = selectedMonth === 'all' || insight.month === selectedMonth
    const matchesSearch = searchQuery === '' || 
      insight.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      insight.content.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesCategory && matchesMonth && matchesSearch
  })

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'achievement': return 'text-green-600 bg-green-100 border-green-200'
      case 'performance': return 'text-blue-600 bg-blue-100 border-blue-200'
      case 'risk': return 'text-red-600 bg-red-100 border-red-200'
      case 'opportunity': return 'text-purple-600 bg-purple-100 border-purple-200'
      default: return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴'
      case 'medium': return '🟡'
      case 'low': return '🟢'
      default: return '⚪'
    }
  }

  const categoryStats = {
    achievements: userVisibleInsights.filter(i => i.category === 'achievement').length,
    risks: userVisibleInsights.filter(i => i.category === 'risk').length,
    opportunities: userVisibleInsights.filter(i => i.category === 'opportunity').length,
    performance: userVisibleInsights.filter(i => i.category === 'performance').length
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                MPR Insights Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                AI-generated insights from monthly progress reports • Viewing as <span className="font-medium">{currentUser.role}</span> in <span className="font-medium">{currentUser.department}</span>
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search insights..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select 
                value={selectedFilter} 
                onChange={(e) => setSelectedFilter(e.target.value as any)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Categories</option>
                <option value="achievement">Achievements</option>
                <option value="performance">Performance</option>
                <option value="risk">Risks</option>
                <option value="opportunity">Opportunities</option>
              </select>
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Months</option>
                <option value="January">January</option>
                <option value="February">February</option>
                <option value="March">March</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Achievements</CardTitle>
              <div className="text-xl">🏆</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{categoryStats.achievements}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{categoryStats.performance}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Risks</CardTitle>
              <div className="text-xl">⚠️</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{categoryStats.risks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Opportunities</CardTitle>
              <div className="text-xl">💡</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{categoryStats.opportunities}</div>
            </CardContent>
          </Card>
        </div>

        {/* Insights Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {filteredInsights.length} Insights Found
            </h2>
          </div>
          
          {filteredInsights.map((insight) => (
            <Card key={insight.id} className="group hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(insight.category)}`}>
                        {insight.category}
                      </span>
                      <span className="text-sm">
                        {getPriorityIcon(insight.priority)} {insight.priority} priority
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {insight.month} {insight.year}
                      </span>
                    </div>
                    <CardTitle className="text-lg mb-2">{insight.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {insight.content}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {insight.department}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Generated {new Date(insight.generatedDate).toLocaleDateString()}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredInsights.length === 0 && (
            <Card className="p-8 text-center">
              <div className="text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No insights found matching your criteria.</p>
                <p className="text-sm mt-2">Try adjusting your filters or search terms.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  )
} 