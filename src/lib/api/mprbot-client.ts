import axios from 'axios'
import { MPRReportsResponse, MPRHealthResponse, MPRCriticalIssuesResponse } from '@/types/mpr'

const API_BASE_URL = process.env.NEXT_PUBLIC_MPR_API_BASE_URL

if (!API_BASE_URL) {
  console.warn('NEXT_PUBLIC_MPR_API_BASE_URL is not defined')
}

// Create axios instance with default config
const mprApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for logging
mprApi.interceptors.request.use(
  (config) => {
    console.log(`MPR API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('MPR API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
mprApi.interceptors.response.use(
  (response) => {
    console.log(`MPR API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('MPR API Response Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// API Functions
export const mprBotApi = {
  // Health check
  async getHealth(): Promise<MPRHealthResponse> {
    const response = await mprApi.get<MPRHealthResponse>('/health')
    return response.data
  },

  // Get all reports
  async getReports(): Promise<MPRReportsResponse> {
    const response = await mprApi.get<MPRReportsResponse>('/reports')
    return response.data
  },

  // Get reports with filters (future enhancement)
  async getReportsFiltered(params?: {
    project_type?: 'OM' | 'UC'
    limit?: number
    offset?: number
  }): Promise<MPRReportsResponse> {
    const response = await mprApi.get<MPRReportsResponse>('/reports', { params })
    return response.data
  },

  // Get critical issues
  async getCriticalIssues(params?: {
    skip?: number
    limit?: number
  }): Promise<MPRCriticalIssuesResponse> {
    const response = await mprApi.get<MPRCriticalIssuesResponse>('/critical-issues', { params })
    return response.data
  },
}

export default mprApi
