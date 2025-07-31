'use client'

import { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Eye, 
  Brain, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb, 
  FileText,
  Hash,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { type UploadedDocument } from '@/lib/document-processor'

interface AnalysisViewerProps {
  document: UploadedDocument
}

interface SubtaskSection {
  title: string
  content: string
  icon: React.ReactNode
}

export function AnalysisViewer({ document }: AnalysisViewerProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  const extractSubtasks = (analysis: string): SubtaskSection[] => {
    const subtasks: SubtaskSection[] = []
    
    // Extract Subtask 1: Contractual Data Extraction
    const subtask1Match = analysis.match(/(?:subtask\s*1|<subtask1>)([\s\S]*?)(?=subtask\s*2|<subtask2>|$)/i)
    if (subtask1Match) {
      subtasks.push({
        title: 'Subtask 1: Contractual Data Extraction',
        content: subtask1Match[1].trim(),
        icon: <FileText className="h-4 w-4 text-blue-500" />
      })
    }

    // Extract Subtask 2: Cross-Section Analysis
    const subtask2Match = analysis.match(/(?:subtask\s*2|<subtask2>)([\s\S]*?)(?=subtask\s*3|<subtask3>|$)/i)
    if (subtask2Match) {
      subtasks.push({
        title: 'Subtask 2: Highway Cross-Section Analysis',
        content: subtask2Match[1].trim(),
        icon: <Hash className="h-4 w-4 text-green-500" />
      })
    }

    // Extract Subtask 3: IRC Code Compliance
    const subtask3Match = analysis.match(/(?:subtask\s*3|<subtask3>)([\s\S]*?)(?=subtask\s*4|<subtask4>|$)/i)
    if (subtask3Match) {
      subtasks.push({
        title: 'Subtask 3: IRC Code Compliance Check',
        content: subtask3Match[1].trim(),
        icon: <CheckCircle2 className="h-4 w-4 text-purple-500" />
      })
    }

    // Extract Subtask 4: Cross-Verification
    const subtask4Match = analysis.match(/(?:subtask\s*4|<subtask4>)([\s\S]*?)$/i)
    if (subtask4Match) {
      subtasks.push({
        title: 'Subtask 4: Cross-Verification & Differences',
        content: subtask4Match[1].trim(),
        icon: <Brain className="h-4 w-4 text-orange-500" />
      })
    }

    return subtasks
  }

  const formatAnalysisContent = (content: string) => {
    // Format tables
    const tableFormatted = content.replace(
      /\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|/g,
      '<div class="overflow-x-auto mb-4"><table class="min-w-full border border-gray-300"><tr><td class="border border-gray-300 px-2 py-1 font-medium">$1</td><td class="border border-gray-300 px-2 py-1">$2</td><td class="border border-gray-300 px-2 py-1">$3</td><td class="border border-gray-300 px-2 py-1">$4</td></tr></table></div>'
    )
    
    // Format IRC codes
    const ircFormatted = tableFormatted.replace(
      /(IRC[\s-]*\d+[:\s-]*\d*\.?\d*)/gi,
      '<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">$1</span>'
    )
    
    // Format dimensions and measurements
    const dimensionFormatted = ircFormatted.replace(
      /(\d+\.?\d*\s*(?:m|mm|cm|%|degrees?))/gi,
      '<span class="bg-green-100 text-green-800 px-1 py-0.5 rounded text-xs font-mono">$1</span>'
    )

    return dimensionFormatted
  }

  const getComplianceColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-800'
    if (score >= 80) return 'bg-green-100 text-green-800'
    if (score >= 60) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  if (!document.geminiAnalysis?.success) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" disabled>
            <Eye className="h-3 w-3 mr-1" />
            No Analysis
          </Button>
        </DialogTrigger>
      </Dialog>
    )
  }

  const subtasks = extractSubtasks(document.geminiAnalysis.analysis || '')

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-3 w-3 mr-1" />
          View Analysis
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            AI Analysis Results: {document.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Analysis Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {document.complianceScore && (
                  <div className="text-center">
                    <div className={`inline-flex items-center px-3 py-2 rounded-full ${getComplianceColor(document.complianceScore)}`}>
                      <span className="font-semibold text-lg">{document.complianceScore}/100</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Compliance Score</p>
                  </div>
                )}
                
                {document.issues && (
                  <div className="text-center">
                    <div className="inline-flex items-center px-3 py-2 rounded-full bg-orange-100 text-orange-800">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      <span className="font-semibold">{document.issues.length}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Issues Found</p>
                  </div>
                )}
                
                {document.recommendations && (
                  <div className="text-center">
                    <div className="inline-flex items-center px-3 py-2 rounded-full bg-blue-100 text-blue-800">
                      <Lightbulb className="h-4 w-4 mr-1" />
                      <span className="font-semibold">{document.recommendations.length}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Recommendations</p>
                  </div>
                )}
              </div>
              
              {document.aiSummary && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm">{document.aiSummary}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subtasks Section */}
          {subtasks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detailed Analysis by Subtask</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {subtasks.map((subtask, index) => (
                  <div key={index} className="border rounded-lg">
                    <button
                      onClick={() => toggleSection(`subtask-${index}`)}
                      className="w-full p-4 text-left hover:bg-gray-50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        {subtask.icon}
                        <span className="font-medium">{subtask.title}</span>
                      </div>
                      {expandedSections[`subtask-${index}`] ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    
                    {expandedSections[`subtask-${index}`] && (
                      <div className="px-4 pb-4 border-t">
                        <div 
                          className="prose prose-sm max-w-none mt-3"
                          dangerouslySetInnerHTML={{ 
                            __html: formatAnalysisContent(subtask.content) 
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Issues Section */}
          {document.issues && document.issues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Issues Found ({document.issues.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {document.issues.map((issue, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-orange-50 rounded">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{issue}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations Section */}
          {document.recommendations && document.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-blue-500" />
                  Recommendations ({document.recommendations.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {document.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded">
                      <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Full Analysis Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Complete Analysis Output</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-xs whitespace-pre-wrap font-mono">
                  {document.geminiAnalysis.analysis}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
} 