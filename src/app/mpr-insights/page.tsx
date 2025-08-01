'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { TrendingUp, Filter, Calendar, User, BarChart3, FileText, Search, Eye, ChevronDown, AlertCircle, Loader2, Info } from 'lucide-react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useMPRCriticalIssues, useMPRHealth, useMPRCategories } from '@/lib/api/hooks'
import { transformCriticalIssuesToInsights } from '@/lib/api/transformers'
import { MPRInsight } from '@/types/mpr'

export default function MPRInsightsPage() {
  // Current user context (would come from auth)
  const currentUser = {
    id: 'user123',
    name: 'Devesh Meena',
    role: 'manager',
    department: 'Engineering'
  }

  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [selectedProjectType, setSelectedProjectType] = useState<string>('all')
  const [selectedPersona, setSelectedPersona] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set())
  const [collapsedCards, setCollapsedCards] = useState<Set<string>>(new Set())

  // API Data Fetching
  const { data: healthData, isLoading: healthLoading } = useMPRHealth()
  const { data: criticalIssuesData, isLoading: criticalIssuesLoading, error: criticalIssuesError } = useMPRCriticalIssues()
  const { data: categoriesData, isLoading: categoriesLoading } = useMPRCategories()

  // Transform API data to insights
  const allInsights = useMemo(() => {
    if (!criticalIssuesData?.critical_issues) return []
    return transformCriticalIssuesToInsights(criticalIssuesData.critical_issues)
  }, [criticalIssuesData])

  // Filter insights based on user permissions
  const userVisibleInsights = useMemo(() => {
    return allInsights.filter(insight => 
      insight.viewableBy.some(permission => 
        permission === currentUser.role || 
        permission === currentUser.department ||
        permission === 'admin'
      )
    )
  }, [allInsights, currentUser])

  // Initialize collapsed state for all insights (collapsed by default)
  useEffect(() => {
    if (userVisibleInsights.length > 0 && collapsedCards.size === 0) {
      const allInsightIds = new Set(userVisibleInsights.map(insight => String(insight.id)))
      setCollapsedCards(allInsightIds)
    }
  }, [userVisibleInsights, collapsedCards.size])

  // Apply filters
  const filteredInsights = useMemo(() => {
    return userVisibleInsights.filter(insight => {
      const matchesCategory = selectedFilter === 'all' || insight.category === selectedFilter
      const matchesProject = selectedProject === 'all' || 
        (insight.projectInfo?.name && insight.projectInfo.name.toLowerCase().includes(selectedProject.toLowerCase())) ||
        (insight.sourceReport?.project_name && insight.sourceReport.project_name.toLowerCase().includes(selectedProject.toLowerCase()))
      const matchesProjectType = selectedProjectType === 'all' || insight.department === selectedProjectType
      const matchesPersona = selectedPersona === 'all' || insight.persona === selectedPersona
      const matchesSearch = searchQuery === '' || 
        insight.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        insight.content.toLowerCase().includes(searchQuery.toLowerCase())
      
      return matchesCategory && matchesProject && matchesProjectType && matchesPersona && matchesSearch
    })
  }, [userVisibleInsights, selectedFilter, selectedProject, selectedProjectType, selectedPersona, searchQuery])

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

  // Get unique personas from the insights
  const availablePersonas = useMemo(() => {
    const personas = userVisibleInsights
      .map(insight => insight.persona)
      .filter(persona => persona && persona.trim() !== '')
      .filter((persona, index, self) => self.indexOf(persona) === index)
      .sort()
    return personas
  }, [userVisibleInsights])

  // Get unique project names from the insights
  const availableProjects = useMemo(() => {
    const projects = userVisibleInsights
      .map(insight => insight.projectInfo?.name || insight.sourceReport?.project_name)
      .filter(project => project && project.trim() !== '')
      .filter((project, index, self) => self.indexOf(project) === index)
      .sort()
    return projects
  }, [userVisibleInsights])

  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {}
    if (categoriesData?.categories) {
      categoriesData.categories.forEach(category => {
        stats[category] = userVisibleInsights.filter(i => i.category === category).length
      })
    }
    return stats
  }, [userVisibleInsights, categoriesData])

  // Toggle expanded state for insight details
  const toggleExpanded = (insightId: string) => {
    setExpandedInsights(prev => {
      const newSet = new Set(prev)
      if (newSet.has(insightId)) {
        newSet.delete(insightId)
      } else {
        newSet.add(insightId)
      }
      return newSet
    })
  }

  // Toggle collapsed state for entire card
  const toggleCardCollapsed = (insightId: string) => {
    setCollapsedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(insightId)) {
        newSet.delete(insightId)
      } else {
        newSet.add(insightId)
      }
      return newSet
    })
  }

  // Expand all filtered insights
  const expandAllFiltered = useCallback(() => {
    const filteredIds = filteredInsights.map(insight => String(insight.id))
    
    setCollapsedCards(prev => {
      const newSet = new Set<string>()
      // Keep all non-filtered items collapsed
      prev.forEach(id => {
        if (!filteredIds.includes(id)) {
          newSet.add(id)
        }
      })
      return newSet
    })
  }, [filteredInsights])

  // Collapse all filtered insights  
  const collapseAllFiltered = useCallback(() => {
    const filteredIds = filteredInsights.map(insight => String(insight.id))
    
    setCollapsedCards(prev => {
      const newSet = new Set(prev)
      filteredIds.forEach(id => {
        newSet.add(id)
      })
      return newSet
    })
  }, [filteredInsights])

  // Check if all filtered insights are expanded
  const allFilteredExpanded = filteredInsights.length > 0 && filteredInsights.every(insight => !collapsedCards.has(String(insight.id)))
  // Check if all filtered insights are collapsed
  const allFilteredCollapsed = filteredInsights.length > 0 && filteredInsights.every(insight => collapsedCards.has(String(insight.id)))

  // Loading state
  if (criticalIssuesLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-lg font-medium">Loading MPR insights...</p>
            <p className="text-muted-foreground">Fetching data from MPRBOT API</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  // Error state
  if (criticalIssuesError) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="p-8 text-center max-w-md">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Unable to Load Data</h3>
            <p className="text-muted-foreground mb-4">
              There was an error connecting to the MPRBOT API. Please check if the API is running.
            </p>
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded border mb-4">
              {criticalIssuesError.message}
            </div>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </Card>
        </div>
      </MainLayout>
    )
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
                <div className="group relative">
                  <Info className="h-5 w-5 text-muted-foreground hover:text-blue-600 cursor-help" />
                  <div className="absolute left-0 top-8 z-50 w-80 p-4 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Priority Classification</h4>
                    <div className="text-sm text-gray-700 space-y-1">
                      <div><span className="font-medium text-red-600">High:</span> CVS ≥ 4.0 or Critical escalation</div>
                      <div><span className="font-medium text-yellow-600">Medium:</span> CVS 2.5-3.9 or Standard escalation</div>
                      <div><span className="font-medium text-green-600">Low:</span> CVS &lt; 2.5 or Minor escalation</div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      CVS scores are rated on a scale of 0-5
                    </div>
                  </div>
                </div>
              </h1>
              <p className="text-muted-foreground mt-2">
                AI-generated insights from monthly progress reports 
                {healthData && (
                  <span className="ml-2">
                    • API Status: <span className={`font-medium ${healthData.status === 'healthy' ? 'text-green-600' : 'text-red-600'}`}>
                      {healthData.status}
                    </span>
                  </span>
                )}
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
                disabled={categoriesLoading}
              >
                <option value="all">All Categories</option>
                {categoriesData?.categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select 
                value={selectedProject} 
                onChange={(e) => setSelectedProject(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Projects</option>
                {availableProjects.map(project => (
                  <option key={project} value={project}>
                    {project && project.length > 50 ? project.substring(0, 50) + '...' : project}
                  </option>
                ))}
              </select>
              <select 
                value={selectedProjectType} 
                onChange={(e) => setSelectedProjectType(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Types</option>
                <option value="Operations & Maintenance">OM</option>
                <option value="Under Construction">UC</option>
              </select>
              <select 
                value={selectedPersona} 
                onChange={(e) => setSelectedPersona(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Personas</option>
                {availablePersonas.map(persona => (
                  <option key={persona} value={persona}>{persona}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          {categoriesData?.categories.map((category, index) => {
            // Define colors for each category
            const getCategoryColor = (cat: string) => {
              switch (cat) {
                case 'Financial': return 'text-green-600'
                case 'Quality/NCR': return 'text-orange-600'
                case 'ROW': return 'text-blue-600'
                case 'Safety': return 'text-red-600'
                default: return 'text-gray-600'
              }
            }
            
            // Define icons for each category
            const getCategoryIcon = (cat: string) => {
              switch (cat) {
                case 'Financial': return '💰'
                case 'Quality/NCR': return '🔍'
                case 'ROW': return '🛣️'
                case 'Safety': return '⚠️'
                default: return '📊'
              }
            }
            
            return (
              <Card key={category}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{category}</CardTitle>
                  <div className="text-xl">{getCategoryIcon(category)}</div>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getCategoryColor(category)}`}>
                    {categoryStats[category] || 0}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Data Source Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-blue-700">
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium">
                Real-time data from MPRBOT API • {criticalIssuesData?.total || 0} critical issues • {filteredInsights.length} insights shown
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Insights Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {filteredInsights.length} Insights Found
            </h2>
            {filteredInsights.length > 0 && (
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={allFilteredExpanded ? collapseAllFiltered : expandAllFiltered}
                  className="text-xs"
                  disabled={filteredInsights.length === 0}
                >
                  {allFilteredExpanded ? (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" />
                      Collapse All
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" />
                      Expand All
                    </>
                  )}
                </Button>
                <span className="text-xs text-muted-foreground">
                  {allFilteredExpanded ? 'All expanded' : allFilteredCollapsed ? 'All collapsed' : 'Mixed state'}
                </span>
              </div>
            )}
          </div>
          
          {filteredInsights.map((insight) => {
            const isCollapsed = collapsedCards.has(String(insight.id))
            
            return (
            <Card key={insight.id} className="group hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Project Info - Always visible */}
                    {insight.projectInfo && (
                      <div className="bg-gray-50 p-3 rounded-md mb-3">
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {insight.projectInfo.name}
                        </div>
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">UPC:</span> {insight.projectInfo.upc}
                          {(insight.projectInfo.member || insight.projectInfo.ro || insight.projectInfo.piu) && (
                            <>
                              {' • '}
                              <span className="font-medium">Member/RO/PIU:</span> {[
                                insight.projectInfo.member, 
                                insight.projectInfo.ro, 
                                insight.projectInfo.piu
                              ].filter(item => item && item.trim() !== '').join('/')}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                    {insight.sourceReport && (
                      <div className="bg-gray-50 p-3 rounded-md mb-3">
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {insight.sourceReport.project_name}
                        </div>
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">UPC:</span> {insight.sourceReport.upc_code}
                        </div>
                      </div>
                    )}
                    
                    {/* Metadata - Always visible */}
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
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {insight.department === 'Operations & Maintenance' ? 'OM' : 'UC'}
                      </span>
                      {insight.persona && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {insight.persona}
                        </span>
                      )}
                    </div>
                    
                    {/* Title and Toggle Button */}
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg mb-2 flex-1">{insight.title}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCardCollapsed(String(insight.id))}
                        className="ml-3 flex-shrink-0"
                      >
                        <ChevronDown className={`h-4 w-4 transition-transform ${!isCollapsed ? 'rotate-180' : ''}`} />
                        <span className="ml-1 text-xs">
                          {isCollapsed ? 'Expand' : 'Collapse'}
                        </span>
                      </Button>
                    </div>
                    
                    {/* Collapsible Content */}
                    {!isCollapsed && (
                      <CardDescription className="text-base leading-relaxed">
                        {/* Enhanced formatting for all insights */}
                        <div className="space-y-3">
                          {/* Main content with cleaned text */}
                          {(() => {
                            const content = insight.content;
                            // Remove Root Cause and Recommended Action from main content for cleaner display
                            let cleanContent = content
                              .replace(/Root Cause: [^.]+(?:\.|$)/g, '')
                              .replace(/Recommended Action: .+/g, '')
                              .trim();
                            
                            // If content is empty after cleaning, show original
                            if (!cleanContent) {
                              cleanContent = content;
                            }
                            
                            return <p className="mb-3">{cleanContent}</p>;
                          })()}
                          
                          {/* Extract and display Root Cause and Recommended Action for all insights */}
                          {(() => {
                            // Get Root Cause and Recommended Action directly from API data instead of parsing content
                            const criticalIssue = criticalIssuesData?.critical_issues.find(issue => issue.id.toString() === insight.id)
                            
                            if (criticalIssue) {
                              // For critical issues, use API data directly
                              return (
                                <>
                                  {/* Root Cause Analysis - Enhanced */}
                                  {criticalIssue.preliminary_root_cause && (
                                    <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-400 p-4 rounded-lg">
                                      <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center">
                                          <AlertCircle className="h-5 w-5 text-orange-600 mr-2" />
                                          <span className="font-semibold text-orange-800 text-base">Root Cause Analysis</span>
                                        </div>
                                        <span className="text-xs bg-orange-200 text-orange-800 px-3 py-1 rounded-full font-medium">
                                          📊 Analysis Required
                                        </span>
                                      </div>
                                      
                                      {/* Primary Root Cause */}
                                      <div className="mb-3">
                                        <div className="flex items-center mb-2">
                                          <div className="w-2 h-2 bg-orange-600 rounded-full mr-2"></div>
                                          <span className="font-semibold text-orange-900 text-sm">Primary Cause</span>
                                        </div>
                                        <p className="text-orange-800 text-sm ml-4 bg-white/50 p-2 rounded border-l-2 border-orange-300">
                                          {criticalIssue.preliminary_root_cause}
                                        </p>
                                      </div>
                                      
                                      {/* Analysis Dimensions */}
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                        {/* Impact Analysis */}
                                        <div className="bg-white/60 p-3 rounded border border-orange-200">
                                          <div className="flex items-center mb-2">
                                            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                                            <span className="font-medium text-red-700 text-xs">IMPACT SEVERITY</span>
                                          </div>
                                          <div className="flex items-center">
                                            <span className="text-lg font-bold text-red-600">
                                              {criticalIssue.cvs_score ? `${criticalIssue.cvs_score}/5` : 'High'}
                                            </span>
                                            <span className="text-xs text-red-600 ml-2">CVS Score</span>
                                          </div>
                                        </div>
                                        
                                        {/* Age Analysis */}
                                        <div className="bg-white/60 p-3 rounded border border-orange-200">
                                          <div className="flex items-center mb-2">
                                            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                                            <span className="font-medium text-yellow-700 text-xs">PERSISTENCE</span>
                                          </div>
                                          <div className="flex items-center">
                                            <span className="text-lg font-bold text-yellow-600">
                                              {criticalIssue.age_days ? `${Math.floor(criticalIssue.age_days / 30)}` : '?'}
                                            </span>
                                            <span className="text-xs text-yellow-600 ml-2">months old</span>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {/* Risk Factors */}
                                      <div className="mt-3 p-3 bg-white/40 rounded border border-orange-200">
                                        <div className="flex items-center mb-2">
                                          <AlertCircle className="h-4 w-4 text-orange-600 mr-2" />
                                          <span className="font-medium text-orange-800 text-sm">Contributing Risk Factors</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                          {(() => {
                                            const riskFactors = [];
                                            
                                            // Determine risk factors based on root cause
                                            const rootCause = criticalIssue.preliminary_root_cause.toLowerCase();
                                            if (rootCause.includes('contractor') || rootCause.includes('performance')) {
                                              riskFactors.push('👷 Contractor Management', '📈 Performance Monitoring');
                                            }
                                            if (rootCause.includes('regulatory') || rootCause.includes('clearance')) {
                                              riskFactors.push('📋 Regulatory Compliance', '⏰ Approval Delays');
                                            }
                                            if (rootCause.includes('financial') || rootCause.includes('fund')) {
                                              riskFactors.push('💰 Financial Planning', '💳 Cash Flow');
                                            }
                                            if (rootCause.includes('technical') || rootCause.includes('design')) {
                                              riskFactors.push('🔧 Technical Complexity', '📐 Design Issues');
                                            }
                                            
                                            // Default factors if none match
                                            if (riskFactors.length === 0) {
                                              riskFactors.push('⚠️ Process Risk', '🔍 Monitoring Gap');
                                            }
                                            
                                            return riskFactors.map((factor, index) => (
                                              <span key={index} className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded border">
                                                {factor}
                                              </span>
                                            ));
                                          })()}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Recommended Action - Enhanced */}
                                  {criticalIssue.recommended_action && (
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 p-4 rounded-lg">
                                      <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center">
                                          <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                                          <span className="font-semibold text-blue-800 text-base">Recommended Action</span>
                                        </div>
                                        <span className="text-xs bg-blue-200 text-blue-800 px-3 py-1 rounded-full font-medium">
                                          👤 {criticalIssue.persona || insight.persona || 'Manager'}
                                        </span>
                                      </div>
                                      
                                      {/* Action Details */}
                                      <div className="mb-3">
                                        <p className="text-blue-800 text-sm bg-white/50 p-3 rounded border-l-2 border-blue-300">
                                          {criticalIssue.recommended_action}
                                        </p>
                                      </div>
                                      
                                      {/* Action Metrics */}
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                                        {/* Priority Level */}
                                        <div className="bg-white/60 p-3 rounded border border-blue-200">
                                          <div className="flex items-center mb-1">
                                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                                            <span className="font-medium text-blue-700 text-xs">PRIORITY</span>
                                          </div>
                                          <span className="text-sm font-bold text-blue-600">
                                            {insight.priority.toUpperCase()}
                                          </span>
                                        </div>
                                        
                                        {/* Timeline */}
                                        {criticalIssue.target_date && (
                                          <div className="bg-white/60 p-3 rounded border border-blue-200">
                                            <div className="flex items-center mb-1">
                                              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                              <span className="font-medium text-green-700 text-xs">TARGET</span>
                                            </div>
                                            <span className="text-sm font-bold text-green-600">
                                              {new Date(criticalIssue.target_date).toLocaleDateString('en-US', { 
                                                month: 'short', 
                                                day: 'numeric' 
                                              })}
                                            </span>
                                          </div>
                                        )}
                                        
                                        {/* Escalation Level */}
                                        {criticalIssue.escalation_level && (
                                          <div className="bg-white/60 p-3 rounded border border-blue-200">
                                            <div className="flex items-center mb-1">
                                              <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                                              <span className="font-medium text-purple-700 text-xs">ESCALATION</span>
                                            </div>
                                            <span className="text-sm font-bold text-purple-600">
                                              {criticalIssue.escalation_level}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </>
                              );
                            } else {
                              // Fallback: try to extract from content (for non-critical issue insights)
                              const content = insight.content;
                              const rootCauseMatch = content.match(/Root Cause: ([^.]+(?:\.|$))/i) || 
                                                   content.match(/root cause: ([^.]+(?:\.|$))/i);
                              const actionMatch = content.match(/Recommended Action: (.+)/i) || 
                                                content.match(/recommended action: (.+)/i) ||
                                                content.match(/Action: (.+)/i) ||
                                                content.match(/action: (.+)/i);
                              
                              return (
                                <>
                                  {/* Root Cause */}
                                  {rootCauseMatch ? (
                                    <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded">
                                      <div className="flex items-center mb-1">
                                        <AlertCircle className="h-4 w-4 text-orange-600 mr-2" />
                                        <span className="font-semibold text-orange-800">Root Cause</span>
                                      </div>
                                      <p className="text-orange-700 text-sm">{rootCauseMatch[1].replace(/\.$/, '')}</p>
                                    </div>
                                  ) : (
                                    // Generate generic root cause based on category if not explicitly mentioned
                                    insight.category === 'risk' && (
                                      <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded">
                                        <div className="flex items-center mb-1">
                                          <AlertCircle className="h-4 w-4 text-orange-600 mr-2" />
                                          <span className="font-semibold text-orange-800">Root Cause</span>
                                        </div>
                                        <p className="text-orange-700 text-sm">Requires investigation and analysis</p>
                                      </div>
                                    )
                                  )}
                                  
                                  {/* Recommended Action */}
                                  {actionMatch ? (
                                    <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                                      <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center">
                                          <TrendingUp className="h-4 w-4 text-blue-600 mr-2" />
                                          <span className="font-semibold text-blue-800">Recommended Action</span>
                                        </div>
                                        <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                                          👤 {insight.persona || 'Manager'}
                                        </span>
                                      </div>
                                      <p className="text-blue-700 text-sm">{actionMatch[1]}</p>
                                    </div>
                                  ) : (
                                    // Generate generic action based on category if not explicitly mentioned
                                    <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                                      <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center">
                                          <TrendingUp className="h-4 w-4 text-blue-600 mr-2" />
                                          <span className="font-semibold text-blue-800">Recommended Action</span>
                                        </div>
                                        <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                                          👤 {(() => {
                                            switch (insight.category) {
                                              case 'risk': return 'Manager';
                                              case 'performance': return 'RO/PIU';
                                              case 'opportunity': return 'Member-Admin';
                                              case 'achievement': return 'All Stakeholders';
                                              default: return 'Manager';
                                            }
                                          })()}
                                        </span>
                                      </div>
                                      <p className="text-blue-700 text-sm">
                                        {(() => {
                                          switch (insight.category) {
                                            case 'risk': return 'Monitor closely and develop mitigation strategies';
                                            case 'performance': return 'Review performance metrics and implement improvements';
                                            case 'opportunity': return 'Evaluate potential and implement implementation plan';
                                            case 'achievement': return 'Document best practices and share learnings';
                                            default: return 'Review and take appropriate action';
                                          }
                                        })()}
                                      </p>
                                    </div>
                                  )}
                                </>
                              );
                            }
                          })()}
                        </div>
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              {/* Impact Details Section - Only show when card is expanded */}
              {!isCollapsed && (
                <CardContent>
                  {/* Expandable Impact Details Section */}
                  {expandedInsights.has(insight.id) && (
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Impact Details
                      </h4>
                      <div className="text-sm text-blue-800 space-y-2">
                        {/* Get impact details from the database */}
                        {(() => {
                          // For critical issues, we should have impact_details from the API
                          const criticalIssue = criticalIssuesData?.critical_issues.find(issue => issue.id.toString() === insight.id)
                          
                          if (criticalIssue?.impact_details) {
                            return <p>{criticalIssue.impact_details}</p>
                          }
                          
                          // Fallback for other insights
                          return <p>Impact analysis available upon detailed review.</p>
                        })()}
                        
                        {/* Additional metrics if available */}
                        {(() => {
                          const criticalIssue = criticalIssuesData?.critical_issues.find(issue => issue.id.toString() === insight.id)
                          if (criticalIssue) {
                            return (
                              <div className="grid grid-cols-2 gap-4 mt-3">
                                {criticalIssue.age_days && (
                                  <div>
                                    <span className="font-medium">Age:</span> {criticalIssue.age_days} days
                                  </div>
                                )}
                                {criticalIssue.cvs_score && (
                                  <div>
                                    <span className="font-medium">CVS Score:</span> {criticalIssue.cvs_score}/5
                                  </div>
                                )}
                                {criticalIssue.escalation_level && (
                                  <div>
                                    <span className="font-medium">Escalation:</span> {criticalIssue.escalation_level}
                                  </div>
                                )}
                                {criticalIssue.issue_id && (
                                  <div>
                                    <span className="font-medium">Issue ID:</span> {criticalIssue.issue_id}
                                  </div>
                                )}
                              </div>
                            )
                          }
                        })()}
                      </div>
                    </div>
                  )}
                  
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
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => toggleExpanded(insight.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {expandedInsights.has(insight.id) ? 'Hide Details' : 'View Details'}
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
            )
          })}

          {filteredInsights.length === 0 && !criticalIssuesLoading && (
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
