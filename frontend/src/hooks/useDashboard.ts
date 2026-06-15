import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../api/services'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardApi.getStats().then(r => r.data),
    staleTime: 1000 * 60 * 2,
  })
}

export function useDashboardCharts() {
  return useQuery({
    queryKey: ['dashboard', 'charts'],
    queryFn: () => dashboardApi.getCharts().then(r => r.data),
    staleTime: 1000 * 60 * 5,
  })
}

export function useRecentVideos() {
  return useQuery({
    queryKey: ['dashboard', 'recent'],
    queryFn: () => dashboardApi.getRecent().then(r => r.data),
    staleTime: 1000 * 60,
  })
}
