import { MPRReport, MPRInsight, MPRCriticalIssue } from '@/types/mpr'

// Transform MPR Report to MPR Insight for UI
export function transformReportToInsight(report: MPRReport): MPRInsight {
  // Extract month and year from reporting_period (assuming format like "2025-06-01")
  const reportingDate = new Date(report.reporting_period)
  const month = reportingDate.toLocaleString('default', { month: 'long' })
  const year = reportingDate.getFullYear().toString()

  // Generate insight based on report data
  const category = determineCategory(report)
  const priority = determinePriority(report)

  return {
    id: report.id.toString(),
    title: generateInsightTitle(report),
    content: report.summary_preview,
    category,
    priority,
    month,
    year,
    department: report.project_type === 'OM' ? 'Operations & Maintenance' : 'Under Construction',
    author: 'MPRBOT Analysis',
    generatedDate: new Date().toISOString(),
    viewableBy: ['manager', 'admin', report.project_type],
    sourceReport: report
  }
}

// Transform MPR Critical Issue to MPR Insight for UI
export function transformCriticalIssueToInsight(issue: MPRCriticalIssue): MPRInsight {
  // Extract month and year from reporting_period or created_at
  const dateStr = issue.reporting_period || issue.created_at
  const date = dateStr ? new Date(dateStr) : new Date()
  const month = date.toLocaleString('default', { month: 'long' })
  const year = date.getFullYear().toString()

  // Determine priority based on CVS score and escalation level
  const priority = determineCriticalIssuePriority(issue)
  
  // Category is always 'risk' for critical issues
  const category = 'risk' as const

  return {
    id: issue.id.toString(),
    title: issue.title,
    content: `${issue.description}\n\nRoot Cause: ${issue.preliminary_root_cause}\n\nRecommended Action: ${issue.recommended_action}`,
    category,
    priority,
    month,
    year,
    department: issue.project_type === 'OM' ? 'Operations & Maintenance' : 'Under Construction',
    author: issue.persona || 'MPRBOT Analysis',
    persona: issue.persona, // Add persona for filtering
    generatedDate: issue.created_at || new Date().toISOString(),
    viewableBy: ['manager', 'admin', issue.project_type],
    // Add project info from the joined data
    projectInfo: issue.project_name ? {
      name: issue.project_name,
      upc: issue.upc_code,
      member: issue.member,
      ro: issue.ro,
      piu: issue.piu
    } : undefined
  }
}

function determineCategory(report: MPRReport): MPRInsight['category'] {
  const summary = report.summary_preview.toLowerCase()
  
  if (summary.includes('risk') || summary.includes('issue') || summary.includes('problem')) {
    return 'risk'
  }
  if (summary.includes('opportunity') || summary.includes('improve')) {
    return 'opportunity'
  }
  if (summary.includes('achieve') || summary.includes('success') || summary.includes('complete')) {
    return 'achievement'
  }
  return 'performance'
}

function determinePriority(report: MPRReport): MPRInsight['priority'] {
  const summary = report.summary_preview.toLowerCase()
  
  if (summary.includes('critical') || summary.includes('urgent') || summary.includes('immediate')) {
    return 'high'
  }
  if (summary.includes('minor') || summary.includes('low')) {
    return 'low'
  }
  return 'medium'
}

function determineCriticalIssuePriority(issue: MPRCriticalIssue): MPRInsight['priority'] {
  // Use CVS score if available
  if (issue.cvs_score !== null) {
    if (issue.cvs_score >= 8) return 'high'
    if (issue.cvs_score >= 5) return 'medium'
    return 'low'
  }
  
  // Fall back to escalation level
  if (issue.escalation_level) {
    const level = issue.escalation_level.toLowerCase()
    if (level.includes('high') || level.includes('critical') || level.includes('urgent')) {
      return 'high'
    }
    if (level.includes('low') || level.includes('minor')) {
      return 'low'
    }
  }
  
  return 'high' // Default to high for critical issues
}

function generateInsightTitle(report: MPRReport): string {
  // Generate a meaningful title based on the report
  const projectType = report.project_type === 'OM' ? 'O&M' : 'Construction'
  return `${projectType} Progress: ${report.project_name.substring(0, 50)}${report.project_name.length > 50 ? '...' : ''}`
}

// Transform multiple reports to insights
export function transformReportsToInsights(reports: MPRReport[]): MPRInsight[] {
  return reports.map(transformReportToInsight)
}

// Transform multiple critical issues to insights
export function transformCriticalIssuesToInsights(issues: MPRCriticalIssue[]): MPRInsight[] {
  return issues.map(transformCriticalIssueToInsight)
}
