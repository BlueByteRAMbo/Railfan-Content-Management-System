import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { videosApi } from '../api/services'
import type { VideoFilterParams, VideoCreateRequest } from '../types'

export const videoKeys = {
  all:    ['videos'] as const,
  lists:  (params: VideoFilterParams) => ['videos', 'list', params] as const,
  detail: (id: number)  => ['videos', 'detail', id] as const,
  dupes:  (trainNumber?: string, locoNumber?: string, recordingDate?: string, excludeId?: number) =>
    ['videos', 'duplicates', trainNumber, locoNumber, recordingDate, excludeId] as const,
}

/** Paginated video list with filters */
export function useVideos(params: VideoFilterParams) {
  return useQuery({
    queryKey: videoKeys.lists(params),
    queryFn:  () => videosApi.getAll(params).then(r => r.data),
    placeholderData: (prev) => prev,
  })
}

/** Single video detail */
export function useVideo(id: number) {
  return useQuery({
    queryKey: videoKeys.detail(id),
    queryFn:  () => videosApi.getById(id).then(r => r.data),
    enabled: !!id,
  })
}

/** Create video mutation */
export function useCreateVideo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: VideoCreateRequest) => videosApi.create(data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: videoKeys.all })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

/** Update video mutation */
export function useUpdateVideo(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: VideoCreateRequest) => videosApi.update(id, data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: videoKeys.all })
      qc.invalidateQueries({ queryKey: videoKeys.detail(id) })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

/** Soft delete mutation */
export function useDeleteVideo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => videosApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: videoKeys.all })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

/** Status change mutation */
export function useUpdateVideoStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, extra }: { id: number; status: string; extra?: object }) =>
      videosApi.updateStatus(id, status, extra).then(r => r.data),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: videoKeys.all })
      qc.invalidateQueries({ queryKey: videoKeys.detail(id) })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

/** Duplicate check query */
export function useDuplicateCheck(
  trainNumber?: string,
  locoNumber?: string,
  recordingDate?: string,
  excludeId?: number
) {
  return useQuery({
    queryKey: videoKeys.dupes(trainNumber, locoNumber, recordingDate, excludeId),
    queryFn: () => videosApi.checkDuplicate(trainNumber, locoNumber, recordingDate, excludeId)
                             .then(r => r.data),
    enabled: !!(recordingDate && (trainNumber || locoNumber)),
    staleTime: 0,
  })
}
