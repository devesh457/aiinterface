// MPR API Response Types
export interface MPRReport {
  id: number
  upc_code: string
  project_name: string
  reporting_period: string
  project_type: 'OM' | 'UC'
  member: string
  ro: string
  piu: string
  summary_preview: string
  created_at: string
  updated_at: string
}

export interface MPRReportsResponse {
  reports: MPRReport[]
  total: number
  count: number
}

export interface MPRHealthResponse {
  status: 'healthy' | 'unhealthy'
  database: 'connected' | 'disconnected'
}

// Critical Issues Types
export interface MPRCriticalIssue {
  id: number;
  issue_id: string;
  title: string;
  description: string;
  category: string;
  preliminary_root_cause: string;
  persona: string;
  recommended_action: string;
  impact_details: string;
  age_days: number;
  target_date: string | null;
  escalation_level: string;
  cvs_score: number | null;
  cost_score: number | null;
  visibility_score: number | null;
  severity_score: number | null;
  created_at: string | null;
  // Report details
  upc_code: string;
  project_name: string;
  reporting_period: string | null;
  project_type: string;
  member: string;
  ro: string;
  piu: string;
}

export interface MPRCriticalIssuesResponse {
  critical_issues: MPRCriticalIssue[]
  total: number
  count: number
}

// Frontend MPR Insight Types (for UI)
export interface MPRInsight {
  id: string
  title: string
  content: string
  category: string // Allow any string category from database
  priority: 'high' | 'medium' | 'low'
  month: string
  year: string
  department: string
  author: string
  persona?: string // Added persona field for filtering
  generatedDate: string
  viewableBy: string[]
  sourceReport?: MPRReport // Link to original report (for reports-based insights)
  projectInfo?: {          // Project info for critical issues
    name: string
    upc: string
    member: string
    ro: string
    piu: string
  }
}
