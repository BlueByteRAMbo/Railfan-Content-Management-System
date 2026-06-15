import { useQuery } from '@tanstack/react-query'
import { referenceApi, tagsApi, collectionsApi } from '../api/services'

export function useTrainCategories() {
  return useQuery({
    queryKey: ['ref', 'train-categories'],
    queryFn: () => referenceApi.getTrainCategories().then(r => r.data),
    staleTime: Infinity,
  })
}

export function useLocoTypes() {
  return useQuery({
    queryKey: ['ref', 'loco-types'],
    queryFn: () => referenceApi.getLocoTypes().then(r => r.data),
    staleTime: Infinity,
  })
}

export function useLocoSheds(q?: string) {
  return useQuery({
    queryKey: ['ref', 'loco-sheds', q],
    queryFn: () => referenceApi.getLocoSheds(q).then(r => r.data),
    staleTime: 1000 * 60 * 10,
  })
}

export function useStations(q?: string) {
  return useQuery({
    queryKey: ['ref', 'stations', q],
    queryFn: () => referenceApi.getStations(q).then(r => r.data),
    staleTime: 1000 * 60 * 10,
  })
}

export function useTags() {
  return useQuery({
    queryKey: ['ref', 'tags'],
    queryFn: () => tagsApi.getAll().then(r => r.data),
    staleTime: 1000 * 60 * 5,
  })
}

export function useCollections() {
  return useQuery({
    queryKey: ['ref', 'collections'],
    queryFn: () => collectionsApi.getAll().then(r => r.data),
    staleTime: 1000 * 60 * 5,
  })
}
