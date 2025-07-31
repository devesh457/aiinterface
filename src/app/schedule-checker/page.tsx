'use client'

import { useState } from 'react'
import { FileCheck, Upload, FileText, Clock, CheckCircle, AlertCircle, Eye, Download, Trash2, Loader2 } from 'lucide-react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AnalysisViewer } from '@/components/analysis-viewer'
import { type UploadedDocument } from '@/lib/document-processor'

interface ScheduleDocument {
  id: string
  fileName: string
  fileSize: string
  uploadDate: string
  status: 'uploading' | 'processing' | 'completed' | 'error'
  analysisResult?: string
  scheduleType: 'Highway Engineering'
  complianceScore?: number
  issues?: string[]
  recommendations?: string[]
}

export default function ScheduleCheckerPage() {
  const [documents, setDocuments] = useState<ScheduleDocument[]>([
    {
      id: '1',
      fileName: 'Highway_Project_Schedule_B_Q1_2024.pdf',
      fileSize: '2.4 MB',
      uploadDate: '2024-01-15',
      status: 'completed',
      scheduleType: 'Highway Engineering',
      complianceScore: 92,
      analysisResult: `SUBTASK 1: CONTRACTUAL DATA EXTRACTION
===================================================
**Schedule B - Highway Engineering Document Analysis**

**Section 1: Cross-Section Elements**
- Carriageway width: 7.0m per lane
- Median type: Raised concrete median
- Embankment slopes: 1:2 (left), 1:1.5 (right)
- All required cross-section elements properly documented

**Section 2: Technical Specifications** 
- Pavement thickness: 250mm bituminous
- Sub-base course: 300mm granular material
- Formation level: As per IRC standards
- All technical specifications verified

SUBTASK 2: HIGHWAY CROSS-SECTION ANALYSIS
=========================================
**Cross-Section 1 (Chainage 0+000 to 2+500):**
- Carriageway width: 14.0m | height: not present | slope: 2.5%
- Shoulder width: 2.5m LHS, 2.5m RHS | height: not present | slope: 3%
- Median type: Raised Concrete | width: 1.2m | height: 150mm
- Embankment slope: 1:2 LHS, 1:1.5 RHS

SUBTASK 3: IRC CODE COMPLIANCE CHECK
===================================
**IRC Code Compliance Review:**

| Element | Dimension | Relevant IRC Code | Compliance Status |
|---------|-----------|-------------------|-------------------|
| Carriageway Width | 7.0m per lane | IRC 86-1983 Section 3.2 | ✅ Compliant |
| Median Width | 1.2m | IRC 86-1983 Section 4.1 | ✅ Compliant |
| Shoulder Width | 2.5m | IRC 37-2018 Section 5.3 | ✅ Compliant |
| Embankment Slopes | 1:2, 1:1.5 | IRC 36-2010 Section 8.2 | ⚠️ Minor deviation |
| Pavement Thickness | 250mm | IRC 37-2018 Appendix A | ✅ Compliant |

SUBTASK 4: CROSS-VERIFICATION & DIFFERENCES
==========================================
**Verification Results:**
- All cross-section dimensions match contractual specifications
- Technical standards properly referenced
- **Issue Identified**: Minor slope variation in embankment RHS - specified 1:1.5 vs standard 1:2
- **Compliance Score**: 92/100 - Excellent compliance with minor slope standardization needed`,
      issues: ['Minor slope variation in embankment RHS section'],
      recommendations: ['Standardize embankment slopes as per IRC 36-2010', 'Review cross-section consistency across project length']
    },
    {
      id: '2',
      fileName: 'Highway_Cross_Sections_Rural_Project.pdf',
      fileSize: '1.8 MB',
      uploadDate: '2024-02-10',
      status: 'completed',
      scheduleType: 'Highway Engineering',
      complianceScore: 78,
      analysisResult: `SUBTASK 1: CONTRACTUAL DATA EXTRACTION
===================================================
**Highway Engineering Document Analysis**

**Project Information:**
- Project Type: Rural Highway Development
- Road Class: National Highway (NH)
- Design Speed: 80 kmph
- Terrain: Rolling terrain with moderate curves

**Technical Specifications:**
- Formation width: 12.0m
- Carriageway: 7.0m (single carriageway)
- Shoulders: 1.5m each side
- Cross-fall: 2.5%

SUBTASK 2: HIGHWAY CROSS-SECTION ANALYSIS
=========================================
**Cross-Section Analysis Results:**
- Formation width: 12.0m | height: not present | slope: not present
- Carriageway width: 7.0m | height: not present | slope: 2.5%
- Shoulder width: 1.5m LHS, 1.5m RHS | height: not present | slope: 3%
- Side slopes: not present | Median type: None (single carriageway)
- Drainage elements: not present

SUBTASK 3: IRC CODE COMPLIANCE CHECK
===================================
**IRC Code Compliance Review:**

| Element | Dimension | Relevant IRC Code | Compliance Status |
|---------|-----------|-------------------|-------------------|
| Formation Width | 12.0m | IRC 73-1980 Section 4.2 | ❌ Non-compliant - Inadequate |
| Carriageway Width | 7.0m | IRC 86-1983 Section 3.1 | ⚠️ Minimum standard |
| Shoulder Width | 1.5m | IRC 37-2018 Section 5.3 | ❌ Non-compliant - Below 2.5m |
| Cross-fall | 2.5% | IRC 38-1988 Section 6.1 | ✅ Compliant |
| Side Drainage | Not present | IRC 34-2011 | ❌ Missing requirement |

SUBTASK 4: CROSS-VERIFICATION & DIFFERENCES
==========================================
**Critical Issues Found:**
1. **Formation Width**: Specified 12.0m insufficient for NH standards (should be 24m minimum)
2. **Shoulder Width**: 1.5m shoulders inadequate for National Highway (IRC requires 2.5m minimum)
3. **Drainage System**: No side drains specified despite IRC 34-2011 requirements
4. **Cross-Section Consistency**: Multiple elements not present in technical drawings

**Compliance Score**: 78/100 - Requires immediate attention for IRC compliance`,
      issues: ['Formation width below IRC standards', 'Inadequate shoulder width for NH class', 'Missing drainage system specifications'],
      recommendations: ['Revise formation width to 24m as per IRC 73-1980', 'Increase shoulder width to 2.5m minimum', 'Include comprehensive drainage system design']
    },
    {
      id: '3',
      fileName: 'Modified_Highway_Specs_2024.pdf',
      fileSize: '3.1 MB',
      uploadDate: '2024-03-05',
      status: 'processing',
      scheduleType: 'Highway Engineering',
      analysisResult: 'Analysis in progress. AI is reviewing highway engineering specifications and IRC compliance requirements.'
    }
  ])

  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<ScheduleDocument | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Convert ScheduleDocument to UploadedDocument format for AnalysisViewer
  const convertToUploadedDocument = (scheduleDoc: ScheduleDocument): UploadedDocument => {
    // Map status values to match UploadedDocument interface
    const mapStatus = (status: ScheduleDocument['status']): UploadedDocument['status'] => {
      switch (status) {
        case 'completed': return 'ready'
        case 'uploading': return 'processing'
        case 'processing': return 'processing'
        case 'error': return 'error'
        default: return 'processing'
      }
    }

    return {
      id: scheduleDoc.id,
      name: scheduleDoc.fileName,
      type: 'application/pdf',
      size: parseFloat(scheduleDoc.fileSize) * 1024 * 1024, // Convert MB to bytes
      content: scheduleDoc.analysisResult || '',
      uploadDate: new Date(scheduleDoc.uploadDate),
      status: mapStatus(scheduleDoc.status),
      documentType: 'highway-engineering', // All documents are highway engineering
      complianceScore: scheduleDoc.complianceScore,
      issues: scheduleDoc.issues,
      recommendations: scheduleDoc.recommendations,
      aiSummary: scheduleDoc.analysisResult ? 
        `Highway engineering document analysis completed. Compliance score: ${scheduleDoc.complianceScore || 'N/A'}%.` : 
        undefined,
      geminiAnalysis: scheduleDoc.analysisResult ? {
        success: true,
        analysis: scheduleDoc.analysisResult,
        complianceScore: scheduleDoc.complianceScore,
        issues: scheduleDoc.issues,
        recommendations: scheduleDoc.recommendations,
        summary: `Highway engineering document analysis completed. Compliance score: ${scheduleDoc.complianceScore || 'N/A'}%.`
      } : undefined
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setIsUploading(true)
      
      // Simulate file upload and processing
      const newDocument: ScheduleDocument = {
        id: Date.now().toString(),
        fileName: file.name,
        fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        uploadDate: new Date().toISOString().split('T')[0],
        status: 'uploading',
        scheduleType: 'Highway Engineering' // All documents are highway engineering
      }
      
      setDocuments(prev => [newDocument, ...prev])
      setShowUploadModal(false)
      
      // Simulate upload progress
      setTimeout(() => {
        setDocuments(prev => prev.map(doc => 
          doc.id === newDocument.id ? { ...doc, status: 'processing' } : doc
        ))
        setIsUploading(false)
      }, 2000)
      
      // Simulate analysis completion
      setTimeout(() => {
        setDocuments(prev => prev.map(doc => 
          doc.id === newDocument.id ? { 
            ...doc, 
            status: 'completed',
            complianceScore: Math.floor(Math.random() * 30) + 70, // Random score 70-100
            analysisResult: 'Analysis completed. Document has been reviewed for compliance and accuracy.',
            issues: ['Sample issue identified during analysis'],
            recommendations: ['Review highlighted sections', 'Consider consulting with tax professional']
          } : doc
        ))
      }, 8000)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'processing': return 'text-yellow-600 bg-yellow-100'
      case 'uploading': return 'text-blue-600 bg-blue-100'
      case 'error': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'processing': return <Loader2 className="h-4 w-4 animate-spin" />
      case 'uploading': return <Upload className="h-4 w-4" />
      case 'error': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  const totalDocuments = documents.length
  const completedDocuments = documents.filter(doc => doc.status === 'completed').length
  const processingDocuments = documents.filter(doc => doc.status === 'processing' || doc.status === 'uploading').length
  const avgComplianceScore = documents
    .filter(doc => doc.complianceScore)
    .reduce((acc, doc) => acc + (doc.complianceScore || 0), 0) / completedDocuments || 0

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
                <FileCheck className="h-8 w-8 text-white" />
              </div>
              Highway Engineering Document Checker
            </h1>
            <p className="text-muted-foreground mt-2">
              Upload Schedule B & C highway engineering documents for AI-powered compliance analysis and IRC code verification
            </p>
          </div>
          <Button onClick={() => setShowUploadModal(true)} size="lg">
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDocuments}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedDocuments}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
              <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{processingDocuments}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Compliance</CardTitle>
              <FileCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getComplianceColor(avgComplianceScore)}`}>
                {avgComplianceScore.toFixed(0)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Document History</h2>
          
          {documents.map((document) => (
            <Card key={document.id} className="group hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/10 to-red-500/10">
                      <FileCheck className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{document.fileName}</CardTitle>
                      <CardDescription>
                        {document.scheduleType} • {document.fileSize} • Uploaded {new Date(document.uploadDate).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {document.complianceScore && (
                      <div className={`text-sm font-medium ${getComplianceColor(document.complianceScore)}`}>
                        {document.complianceScore}% Compliant
                      </div>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(document.status)}`}>
                      {getStatusIcon(document.status)}
                      {document.status}
                    </span>
                  </div>
                </div>
              </CardHeader>
              
              {document.analysisResult && (
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Analysis Result</h4>
                    <p className="text-sm text-muted-foreground">{document.analysisResult.split('\n')[0]}</p>
                  </div>
                  
                  {document.issues && document.issues.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 text-red-600">Issues Identified</h4>
                      <ul className="text-sm text-red-600 space-y-1">
                        {document.issues.map((issue, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {document.recommendations && document.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 text-blue-600">Recommendations</h4>
                      <ul className="text-sm text-blue-600 space-y-1">
                        {document.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <AnalysisViewer 
                      document={convertToUploadedDocument(document)} 
                    />
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowUploadModal(false)
              }
            }}
          >
            <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Highway Engineering Document
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowUploadModal(false)}
                    className="h-6 w-6 p-0"
                  >
                    ✕
                  </Button>
                </CardTitle>
                <CardDescription>
                  Upload your Schedule B & C highway engineering document for 4-subtask AI compliance analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="schedule-upload"
                    disabled={isUploading}
                  />
                  <label htmlFor="schedule-upload" className={`cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {isUploading ? (
                      <Loader2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground animate-spin" />
                    ) : (
                      <FileCheck className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    )}
                    <p className="text-sm font-medium">
                      {isUploading ? 'Uploading...' : 'Click to upload PDF'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF files only, up to 10MB
                    </p>
                  </label>
                </div>

                <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded">
                  <p className="font-medium mb-1">Highway Engineering Documents:</p>
                  <ul className="space-y-1">
                    <li>• <strong>Schedule B & C Sections</strong>: Engineering documents containing both contractual clauses and cross-section specifications</li>
                    <li>• <strong>IRC Compliance</strong>: Automated verification against Indian Roads Congress standards</li>
                  </ul>
                  <p className="text-xs mt-2 text-muted-foreground">
                    All documents undergo 4-subtask AI analysis including IRC code verification and compliance scoring.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowUploadModal(false)} 
                    className="flex-1"
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  )
} 