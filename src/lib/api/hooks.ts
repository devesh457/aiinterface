import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { mprBotApi } from './mprbot-client'
import { MPRReportsResponse, MPRHealthResponse, MPRCriticalIssuesResponse } from '@/types/mpr'

// React Query hooks for MPR API

export function useMPRHealth(): UseQueryResult<MPRHealthResponse, Error> {
  return useQuery({
    queryKey: ['mpr-health'],
    queryFn: () => mprBotApi.getHealth(),
    refetchInterval: 30000, // Check health every 30 seconds
    retry: 3,
  })
}

export function useMPRReports(): UseQueryResult<MPRReportsResponse, Error> {
  return useQuery({
    queryKey: ['mpr-reports'],
    queryFn: () => mprBotApi.getReports(),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: 2,
  })
}

export function useMPRReportsFiltered(params?: {
  project_type?: 'OM' | 'UC'
  limit?: number
  offset?: number
}): UseQueryResult<MPRReportsResponse, Error> {
  return useQuery({
    queryKey: ['mpr-reports-filtered', params],
    queryFn: () => mprBotApi.getReportsFiltered(params),
    enabled: !!params, // Only run if params are provided
    staleTime: 5 * 60 * 1000,
    retry: 2,
  })
}

export function useMPRCriticalIssues(params?: {
  skip?: number
  limit?: number
}): UseQueryResult<MPRCriticalIssuesResponse, Error> {
  return useQuery({
    queryKey: ['mpr-critical-issues', params],
    queryFn: () => mprBotApi.getCriticalIssues(params),
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes (more critical data)
    retry: 2,
  })
}
