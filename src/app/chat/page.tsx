'use client'

import { useState, useEffect, useRef } from 'react'
import { Bot, Send, Settings, Loader2, Plus, AlertCircle, RefreshCw, Wifi, WifiOff, TestTube, Upload, X, FileText, Paperclip, Brain, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ollama, type OllamaModel, formatModelName, getModelDescription } from '@/lib/ollama'
import { documentProcessor, type UploadedDocument, formatFileSize, getFileIcon, type ProcessingProgress } from '@/lib/document-processor'
import { geminiService } from '@/lib/gemini'
import { AnalysisViewer } from '@/components/analysis-viewer'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ModelOption {
  id: string
  name: string
  description: string
  isWorking?: boolean
  testingStatus?: 'idle' | 'testing' | 'success' | 'error'
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello! I'm your AI assistant powered by Ollama. I specialize in analyzing **highway engineering documents** with advanced AI-powered compliance checking.

📄 **Highway Engineering Analysis**: Upload your Schedule B & C documents (PDF format) and I'll analyze them ${geminiService.isAvailable() ? 'with detailed 4-subtask analysis including IRC code verification, cross-section analysis, and compliance scoring' : 'and extract their content'}.

What would you like to chat about today?`,
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState('')
  const [availableModels, setAvailableModels] = useState<ModelOption[]>([])
  const [isLoadingModels, setIsLoadingModels] = useState(true)
  const [isOllamaConnected, setIsOllamaConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(2048)
  const [debugMode, setDebugMode] = useState(false)
  const [enableAIAnalysis, setEnableAIAnalysis] = useState(true)
  
  // Document upload state
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load available models on component mount
  useEffect(() => {
    loadAvailableModels()
  }, [])

  const loadAvailableModels = async () => {
    setIsLoadingModels(true)
    setError(null)
    
    try {
      // First check if Ollama is running
      const isHealthy = await ollama.checkHealth()
      setIsOllamaConnected(isHealthy)
      
      if (!isHealthy) {
        setError('Cannot connect to Ollama. Make sure Ollama is running on http://localhost:11434')
        setIsLoadingModels(false)
        return
      }

      const models = await ollama.getAvailableModels()
      const modelOptions: ModelOption[] = models.map((model: OllamaModel) => ({
        id: model.name,
        name: formatModelName(model.name),
        description: getModelDescription(model.name),
        testingStatus: 'idle'
      }))
      
      setAvailableModels(modelOptions)
      
      // Select first model if none selected
      if (!selectedModel && modelOptions.length > 0) {
        setSelectedModel(modelOptions[0].id)
      }
    } catch (error) {
      console.error('Error loading models:', error)
      setIsOllamaConnected(false)
      setError('Failed to load models from Ollama. Please check if Ollama is running.')
    } finally {
      setIsLoadingModels(false)
    }
  }

  const testModel = async (modelId: string) => {
    setAvailableModels(prev => 
      prev.map(model => 
        model.id === modelId 
          ? { ...model, testingStatus: 'testing' as const }
          : model
      )
    )

    try {
      const isWorking = await ollama.testModel(modelId)
      setAvailableModels(prev => 
        prev.map(model => 
          model.id === modelId 
            ? { 
                ...model, 
                isWorking, 
                testingStatus: isWorking ? 'success' as const : 'error' as const 
              }
            : model
        )
      )
    } catch (error) {
      console.error(`Failed to test model ${modelId}:`, error)
      setAvailableModels(prev => 
        prev.map(model => 
          model.id === modelId 
            ? { ...model, isWorking: false, testingStatus: 'error' as const }
            : model
        )
      )
    }
  }

  const testAllModels = async () => {
    for (const model of availableModels) {
      await testModel(model.id)
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  // Document upload functions
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Validate file
      const validation = documentProcessor.validateFile(file)
      if (!validation.valid) {
        setError(validation.error || 'Invalid file')
        continue
      }

      // Create document entry
      const documentId = Date.now().toString() + '_' + i
      const newDocument: UploadedDocument = {
        id: documentId,
        name: file.name,
        type: file.type,
        size: file.size,
        content: '',
        uploadDate: new Date(),
        status: 'processing',
        processingProgress: 0
      }

      setUploadedDocuments(prev => [...prev, newDocument])

      // Set up progress callback
      documentProcessor.setProgressCallback(documentId, (progress: ProcessingProgress) => {
        setUploadedDocuments(prev => 
          prev.map(doc => 
            doc.id === documentId 
              ? { 
                  ...doc, 
                  processingProgress: progress.progress,
                  status: progress.progress === 100 ? 'ready' : 
                         progress.progress >= 70 && progress.status.includes('AI') ? 'analyzing' : 'processing'
                }
              : doc
          )
        )
      })

      // Process file with AI analysis
      try {
        const { processingResult, analysisResult } = await documentProcessor.processFileWithAnalysis(
          file, 
          documentId, 
          enableAIAnalysis
        )
        
        const finalStatus = processingResult.success ? 'ready' : 'error'
        
        setUploadedDocuments(prev => 
          prev.map(doc => 
            doc.id === documentId 
              ? {
                  ...doc,
                  status: finalStatus,
                  content: processingResult.content || '',
                  errorMessage: processingResult.error,
                  processingProgress: processingResult.success ? 100 : undefined,
                  documentType: processingResult.documentType,
                  geminiAnalysis: analysisResult,
                  complianceScore: analysisResult?.complianceScore,
                  issues: analysisResult?.issues,
                  recommendations: analysisResult?.recommendations,
                  aiSummary: analysisResult?.summary
                }
              : doc
          )
        )

        if (processingResult.success) {
          // Determine document type for the message
          const documentTypeName = processingResult.documentType === 'highway-engineering' ? 
                                   'Highway engineering document' : 
                                   'Engineering document'

          // Create system message with analysis results
          let messageContent = `📄 ${documentTypeName} "${file.name}" has been uploaded and processed.`
          
          if (analysisResult?.success) {
            messageContent += `\n\n🤖 **AI Analysis Complete:**`
            
            if (analysisResult.complianceScore) {
              const scoreColor = analysisResult.complianceScore >= 80 ? '🟢' : analysisResult.complianceScore >= 60 ? '🟡' : '🔴'
              messageContent += `\n${scoreColor} Compliance Score: ${analysisResult.complianceScore}/100`
            }
            
            if (analysisResult.summary) {
              messageContent += `\n📋 Summary: ${analysisResult.summary}`
            }
            
            if (analysisResult.issues && analysisResult.issues.length > 0) {
              messageContent += `\n⚠️ Issues Found: ${analysisResult.issues.length}`
            }
            
            if (analysisResult.recommendations && analysisResult.recommendations.length > 0) {
              messageContent += `\n💡 Recommendations Available: ${analysisResult.recommendations.length}`
            }
            
            messageContent += `\n\nYou can now ask questions about the highway engineering analysis and compliance!`
          } else {
            messageContent += `\n\nYou can now ask questions about its content.`
          }

          const systemMessage: ChatMessage = {
            id: Date.now().toString() + '_system',
            role: 'assistant',
            content: messageContent,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, systemMessage])
        }
      } catch (error) {
        console.error('Error processing file:', error)
        setUploadedDocuments(prev => 
          prev.map(doc => 
            doc.id === documentId 
              ? {
                  ...doc,
                  status: 'error',
                  errorMessage: 'Failed to process file'
                }
              : doc
          )
        )
      } finally {
        // Clean up progress callback
        documentProcessor.removeProgressCallback(documentId)
      }
    }
  }

  const removeDocument = (documentId: string) => {
    setUploadedDocuments(prev => prev.filter(doc => doc.id !== documentId))
    documentProcessor.removeProgressCallback(documentId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFileUpload(e.dataTransfer.files)
  }

  const buildContextWithDocuments = (conversationHistory: { role: 'user' | 'assistant'; content: string }[]) => {
    const readyDocuments = uploadedDocuments.filter(doc => doc.status === 'ready')
    
    if (readyDocuments.length === 0) {
      return conversationHistory
    }

    // Create a system message with document content and AI analysis
    const documentContext = readyDocuments.map(doc => {
      let context = `Document: ${doc.name}\nContent:\n${doc.content}`
      
      // Add AI analysis if available
      if (doc.geminiAnalysis?.success) {
        context += `\n\nAI Analysis:\n${doc.geminiAnalysis.analysis}`
        
        if (doc.complianceScore) {
          context += `\nCompliance Score: ${doc.complianceScore}/100`
        }
        
        if (doc.issues && doc.issues.length > 0) {
          context += `\nIssues: ${doc.issues.join(', ')}`
        }
        
        if (doc.recommendations && doc.recommendations.length > 0) {
          context += `\nRecommendations: ${doc.recommendations.join(' | ')}`
        }
      }
      
      return context
    }).join('\n\n---\n\n')

    const systemMessage: { role: 'system'; content: string } = {
      role: 'system',
      content: `You have access to the following highway engineering documents with AI analysis. Please reference them when answering questions:\n\n${documentContext}`
    }

    return [systemMessage, ...conversationHistory]
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !selectedModel) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)
    setError(null)

    // Create an assistant message that we'll update with streaming content
    const assistantMessageId = (Date.now() + 1).toString()
      const assistantMessage: ChatMessage = {
      id: assistantMessageId,
        role: 'assistant',
      content: '',
        timestamp: new Date()
    }
    
    setMessages(prev => [...prev, assistantMessage])

    // Prepare conversation history for Ollama
    const conversationHistory: { role: 'user' | 'assistant'; content: string }[] = messages
      .filter(msg => msg.role === 'user' || msg.role === 'assistant')
      .map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))
    
    // Add the current user message
    conversationHistory.push({
      role: 'user',
      content: userMessage.content
    })

    // Include document context if available
    const contextWithDocuments = buildContextWithDocuments(conversationHistory)

    try {
      // Create abort controller for this request
      abortControllerRef.current = new AbortController()
      
      let fullResponse = ''
      
      if (debugMode) {
        // Try non-streaming first for debugging
        console.log('🐛 Debug mode: Trying non-streaming request first...')
        try {
          const nonStreamingResponse = await ollama.sendMessage(
            selectedModel,
            contextWithDocuments,
            { temperature, max_tokens: maxTokens }
          )
          console.log('✅ Non-streaming worked! Response:', nonStreamingResponse)
          
          // Update the message with the non-streaming response
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessageId 
                ? { ...msg, content: nonStreamingResponse }
                : msg
            )
          )
        } catch (debugError) {
          console.error('❌ Non-streaming also failed:', debugError)
          throw debugError
        }
      } else {
        // Stream the response from Ollama
        for await (const chunk of ollama.streamChat(
          selectedModel,
          contextWithDocuments,
          {
            temperature,
            max_tokens: maxTokens
          }
        )) {
          fullResponse += chunk
          
          // Update the assistant message with the accumulated response
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessageId 
                ? { ...msg, content: fullResponse }
                : msg
            )
          )
        }
      }
    } catch (error: any) {
      console.error('Error sending message:', error)
      setError(error.message || 'Failed to get response from Ollama')
      
      // Remove the empty assistant message and show error
      setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId))
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleNewChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: `Hello! I'm your AI assistant powered by Ollama. I specialize in analyzing **highway engineering documents** with advanced AI-powered compliance checking.

📄 **Highway Engineering Analysis**: Upload your Schedule B & C documents (PDF format) and I'll analyze them ${geminiService.isAvailable() ? 'with detailed 4-subtask analysis including IRC code verification, cross-section analysis, and compliance scoring' : 'and extract their content'}.

What would you like to chat about today?`,
        timestamp: new Date()
      }
    ])
    // Clear documents and their progress callbacks
    uploadedDocuments.forEach(doc => documentProcessor.removeProgressCallback(doc.id))
    setUploadedDocuments([])
  }

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsLoading(false)
    }
  }

  const getTestStatusIcon = (status: ModelOption['testingStatus']) => {
    switch (status) {
      case 'testing':
        return <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
      case 'success':
        return <div className="h-3 w-3 rounded-full bg-green-500" />
      case 'error':
        return <div className="h-3 w-3 rounded-full bg-red-500" />
      default:
        return null
    }
  }

  const getDocumentStatusColor = (status: UploadedDocument['status']) => {
    switch (status) {
      case 'processing':
        return 'text-blue-600'
      case 'analyzing':
        return 'text-purple-600'
      case 'ready':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const renderDocumentAnalysis = (doc: UploadedDocument) => {
    if (!doc.geminiAnalysis?.success) return null

    return (
      <div className="mt-2 p-2 bg-gray-50 rounded border text-xs">
        {doc.complianceScore && (
          <div className="flex items-center gap-1 mb-1">
            <CheckCircle2 className="h-3 w-3" />
            <span className={`font-medium ${doc.complianceScore >= 80 ? 'text-green-600' : doc.complianceScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
              Score: {doc.complianceScore}/100
            </span>
          </div>
        )}
        
        {doc.issues && doc.issues.length > 0 && (
          <div className="flex items-center gap-1 mb-1">
            <AlertTriangle className="h-3 w-3 text-orange-500" />
            <span className="text-orange-600">{doc.issues.length} issues</span>
          </div>
        )}
        
        {doc.recommendations && doc.recommendations.length > 0 && (
          <div className="flex items-center gap-1">
            <Lightbulb className="h-3 w-3 text-blue-500" />
            <span className="text-blue-600">{doc.recommendations.length} recommendations</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-8rem)] gap-6">
        {/* Model Selection Sidebar */}
        <div className="w-80 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Ollama Models
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={loadAvailableModels}
                  disabled={isLoadingModels}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoadingModels ? 'animate-spin' : ''}`} />
                </Button>
              </CardTitle>
              <div className="flex items-center gap-2 text-sm">
                {isOllamaConnected ? (
                  <>
                    <Wifi className="h-4 w-4 text-green-500" />
                    <span className="text-green-600">Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-red-500" />
                    <span className="text-red-600">Disconnected</span>
                  </>
                )}
              </div>
              {availableModels.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={testAllModels}
                  className="mt-2"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  Test All Models
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoadingModels ? (
                <div className="flex items-center gap-2 p-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Loading models...</span>
                </div>
              ) : availableModels.length > 0 ? (
                availableModels.map((model) => (
                <div
                  key={model.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                    selectedModel === model.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedModel(model.id)}
                >
                  <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{model.name}</p>
                          {getTestStatusIcon(model.testingStatus)}
                        </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {model.description}
                      </p>
                        <p className="text-xs text-muted-foreground mt-1 font-mono">
                          {model.id}
                        </p>
                    </div>
                      <div className="flex flex-col items-center gap-1">
                    {selectedModel === model.id && (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            testModel(model.id)
                          }}
                          disabled={model.testingStatus === 'testing'}
                          className="h-6 px-2"
                        >
                          <TestTube className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-4 text-sm text-muted-foreground">
                  No models available. Run `ollama pull {"<model>"}` to download models.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Document Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Highway Engineering Documents ({uploadedDocuments.length})
                {geminiService.isAvailable() && (
                  <Brain className="h-4 w-4 text-purple-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                  isDragOver ? 'border-primary bg-primary/5' : 'border-border'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex justify-center items-center gap-2 mb-2">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Drag & drop Schedule B/C engineering PDFs here or
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Browse Files
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Supports: {documentProcessor.getSupportedFormatsText()} (max 50MB)
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />

              {/* AI Analysis Toggle */}
              {geminiService.isAvailable() && (
                <div className="flex items-center gap-2 p-2 bg-purple-50 rounded">
                  <input
                    type="checkbox"
                    id="enableAIAnalysis"
                    checked={enableAIAnalysis}
                    onChange={(e) => setEnableAIAnalysis(e.target.checked)}
                  />
                  <label htmlFor="enableAIAnalysis" className="text-sm font-medium flex items-center gap-1">
                    <Brain className="h-3 w-3" />
                    4-Subtask AI Analysis
                  </label>
                </div>
              )}

              {/* Uploaded Documents */}
              {uploadedDocuments.length > 0 && (
                <div className="space-y-2">
                  {uploadedDocuments.map((doc) => (
                    <div key={doc.id} className="p-2 border rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getFileIcon(doc.name, doc.type)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{doc.name}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(doc.size)}
                            </p>
                            <p className={`text-xs ${getDocumentStatusColor(doc.status)}`}>
                              {doc.status === 'processing' && <Loader2 className="h-3 w-3 animate-spin inline mr-1" />}
                              {doc.status === 'analyzing' && <Brain className="h-3 w-3 animate-pulse inline mr-1" />}
                              {doc.status}
                            </p>
                          </div>
                          {(doc.status === 'processing' || doc.status === 'analyzing') && doc.processingProgress !== undefined && (
                            <div className="mt-1">
                              <div className="w-full bg-gray-200 rounded-full h-1">
                                <div 
                                  className="bg-blue-600 h-1 rounded-full transition-all duration-300" 
                                  style={{ width: `${doc.processingProgress}%` }}
                                />
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {doc.processingProgress}% complete
                              </p>
                            </div>
                          )}
                          {doc.errorMessage && (
                            <p className="text-xs text-red-600">{doc.errorMessage}</p>
                          )}
                          {renderDocumentAnalysis(doc)}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDocument(doc.id)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      {/* Action Buttons Row */}
                      {doc.status === 'ready' && (
                        <div className="flex gap-2 pt-2 border-t">
                          <AnalysisViewer document={doc} />
                        </div>
                      )}
                </div>
              ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Chat Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Temperature: {temperature}</label>
                <Input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="mt-2" 
                />
              </div>
              <div>
                <label className="text-sm font-medium">Max Tokens</label>
                <Input 
                  type="number" 
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value) || 2048)}
                  className="mt-2" 
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="debugMode"
                  checked={debugMode}
                  onChange={(e) => setDebugMode(e.target.checked)}
                />
                <label htmlFor="debugMode" className="text-sm font-medium">
                  Debug Mode (Non-streaming)
                </label>
              </div>
              <Button variant="outline" className="w-full" size="sm" onClick={handleNewChat}>
                <Plus className="h-4 w-4 mr-2" />
                New Chat Session
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Highway Engineering Analysis with {availableModels.find(m => m.id === selectedModel)?.name || 'AI Model'}
                  {debugMode && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">DEBUG</span>}
                  {uploadedDocuments.filter(d => d.status === 'ready').length > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center gap-1">
                      <Paperclip className="h-3 w-3" />
                      {uploadedDocuments.filter(d => d.status === 'ready').length} docs
                    </span>
                  )}
                  {geminiService.isAvailable() && enableAIAnalysis && (
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded flex items-center gap-1">
                      <Brain className="h-3 w-3" />
                      4-Subtask Analysis
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${isOllamaConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm text-muted-foreground">
                    {isOllamaConnected ? 'Online' : 'Offline'}
                  </span>
                </div>
              </CardTitle>
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-0">
              <div className="p-6 space-y-4 custom-scrollbar max-h-full">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-2 opacity-70`}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">AI is thinking...</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleStopGeneration}
                          className="ml-2 h-6 px-2"
                        >
                          Stop
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex gap-3">
                <Textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    !isOllamaConnected 
                      ? "Ollama is not connected..." 
                      : !selectedModel 
                      ? "Please select a model..."
                      : uploadedDocuments.filter(d => d.status === 'ready').length > 0
                      ? "Ask questions about your highway engineering documents or chat normally..."
                      : "Type your message here... (Press Enter to send, Shift+Enter for new line)"
                  }
                  className="flex-1 min-h-[60px] max-h-32 resize-none"
                  disabled={isLoading || !isOllamaConnected || !selectedModel}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading || !isOllamaConnected || !selectedModel}
                  size="icon"
                  className="self-end h-[60px] w-[60px]"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
} 