// User types
export interface User {
  id: string
  email: string
  name: string
  role: string
  created_at: string
  updated_at: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

// Chat types
export interface ChatMessage {
  id: string
  session_id: string
  role: 'user' | 'assistant'
  content: string
  metadata?: Record<string, any>
  created_at: string
}

export interface ChatSession {
  id: string
  user_id: string
  model_name: string
  title?: string
  created_at: string
  updated_at: string
  messages?: ChatMessage[]
}

export interface ModelInfo {
  name: string
  displayName: string
  description: string
  parameters?: number
  size?: string
  family?: string
}

// Document types
export interface Document {
  id: string
  user_id: string
  title: string
  source_url?: string
  file_path?: string
  file_type: string
  file_size: number
  status: 'pending' | 'processed' | 'error'
  created_at: string
  updated_at: string
}

export interface DocumentInsight {
  id: string
  document_id: string
  insight_type: string
  content: string
  confidence_score?: number
  metadata?: Record<string, any>
  created_at: string
}

// Knowledge Base types
export interface KnowledgeBase {
  id: string
  user_id: string
  name: string
  description?: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
  documents?: Document[]
}

export interface AnalysisResult {
  id: string
  user_id: string
  kb_id: string
  input_document_id: string
  analysis_type: string
  result: string
  metadata?: Record<string, any>
  created_at: string
}

// API Response types
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasNext: boolean
  hasPrev: boolean
}

// Form types
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface ChatMessageForm {
  content: string
}

export interface DocumentUploadForm {
  title: string
  file?: File
  url?: string
}

export interface KnowledgeBaseForm {
  name: string
  description?: string
}

// UI State types
export interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  loading: boolean
  error: string | null
}

// WebSocket types
export interface WebSocketMessage {
  type: 'message' | 'error' | 'status' | 'typing'
  data: any
  timestamp: string
}

export interface ChatStreamData {
  content: string
  finished: boolean
  error?: string
} 