import apiClient from './client';
import type {
  AuthResponse, LoginRequest, RegisterRequest,
  Video, VideoSummary, VideoCreateRequest, VideoUpdateRequest,
  PagedResponse, VideoFilterParams, DashboardStats, DashboardCharts,
  TrainCategory, LocoType, LocoShed, Station, Tag, RailCollection,
  BulkActionRequest, TimelineMonth, DuplicateAlert, TrainHistoryResponse,
  LocoSummaryDto, LocoHistoryResponse, MapPointDto
} from '../types';

// ── Auth ──────────────────────────────────────────────────────
export const authApi = {
  login:    (data: LoginRequest)    => apiClient.post<AuthResponse>('/api/auth/login', data),
  register: (data: RegisterRequest) => apiClient.post<AuthResponse>('/api/auth/register', data),
};

// ── Videos ────────────────────────────────────────────────────
export const videosApi = {
  getAll: (params: VideoFilterParams = {}) =>
    apiClient.get<PagedResponse<VideoSummary>>('/api/videos', { params }),

  getById: (id: number) =>
    apiClient.get<Video>(`/api/videos/${id}`),

  create: (data: VideoCreateRequest) =>
    apiClient.post<Video>('/api/videos', data),

  update: (id: number, data: VideoUpdateRequest) =>
    apiClient.put<Video>(`/api/videos/${id}`, data),

  updateStatus: (id: number, status: string, extra?: object) =>
    apiClient.patch<Video>(`/api/videos/${id}/status`, { uploadStatus: status, ...extra }),

  delete: (id: number) =>
    apiClient.delete(`/api/videos/${id}`),

  bulkAction: (data: BulkActionRequest) =>
    apiClient.post('/api/videos/bulk-action', data),

  checkDuplicate: (trainNumber?: string, locoNumber?: string, recordingDate?: string, excludeId?: number) =>
    apiClient.get<VideoSummary[]>('/api/videos/check-duplicate', {
      params: { trainNumber, locoNumber, recordingDate, excludeId }
    }),

  getMapPoints: () =>
    apiClient.get<MapPointDto[]>('/api/videos/map-points'),

  fetchYouTubeMetadata: (videoId: string) =>
    apiClient.get(`/api/videos/youtube-metadata/${videoId}`),
};

// ── Dashboard ─────────────────────────────────────────────────
export const dashboardApi = {
  getStats:  () => apiClient.get<DashboardStats>('/api/dashboard/stats'),
  getCharts: () => apiClient.get<DashboardCharts>('/api/dashboard/charts'),
  getRecent: () => apiClient.get<VideoSummary[]>('/api/dashboard/recent'),
};

// ── Timeline ──────────────────────────────────────────────────
export const timelineApi = {
  getRecordingTimeline: (year: number, month?: number) =>
    apiClient.get<TimelineMonth[]>('/api/timeline/recording', { params: { year, month } }),

  getUploadTimeline: (year: number, month?: number) =>
    apiClient.get<TimelineMonth[]>('/api/timeline/upload', { params: { year, month } }),

  getCombined: (videoId: number) =>
    apiClient.get(`/api/timeline/combined/${videoId}`),
};

// ── Calendar ──────────────────────────────────────────────────
export const calendarApi = {
  getRecordingEvents: (year: number, month: number) =>
    apiClient.get('/api/calendar/recording', { params: { year, month } }),

  getUploadEvents: (year: number, month: number) =>
    apiClient.get('/api/calendar/upload', { params: { year, month } }),
};

// ── Reference Data ────────────────────────────────────────────
export const referenceApi = {
  getTrainCategories: () => apiClient.get<TrainCategory[]>('/api/reference/train-categories'),
  getLocoTypes:       () => apiClient.get<LocoType[]>('/api/reference/loco-types'),
  getLocoSheds:       (q?: string) => apiClient.get<LocoShed[]>('/api/reference/loco-sheds', { params: { q } }),
  getStations:        (q?: string) => apiClient.get<Station[]>('/api/reference/stations', { params: { q } }),

  createLocoShed: (name: string, zone?: string) =>
    apiClient.post<LocoShed>('/api/reference/loco-sheds', { name, zone }),

  createStation: (name: string, stationCode?: string, state?: string, railwayZone?: string) =>
    apiClient.post<Station>('/api/reference/stations', { name, stationCode, state, railwayZone }),
};

// ── Tags ──────────────────────────────────────────────────────
export const tagsApi = {
  getAll:       () => apiClient.get<Tag[]>('/api/tags'),
  autocomplete: (query: string) => apiClient.get<Tag[]>('/api/tags/autocomplete', { params: { query } }),
  create:       (name: string)  => apiClient.post<Tag>('/api/tags', { name }),
  update:       (id: number, name: string) => apiClient.put<Tag>(`/api/tags/${id}`, { name }),
  delete:       (id: number) => apiClient.delete(`/api/tags/${id}`),
};

// ── Collections ───────────────────────────────────────────────
export const collectionsApi = {
  getAll:   ()                                  => apiClient.get<RailCollection[]>('/api/collections'),
  getById:  (id: number)                        => apiClient.get<RailCollection>(`/api/collections/${id}`),
  create:   (data: Partial<RailCollection>)     => apiClient.post<RailCollection>('/api/collections', data),
  update:   (id: number, data: Partial<RailCollection>) => apiClient.put<RailCollection>(`/api/collections/${id}`, data),
  delete:   (id: number)                        => apiClient.delete(`/api/collections/${id}`),
  getVideos:(id: number, params?: VideoFilterParams) =>
    apiClient.get<PagedResponse<VideoSummary>>(`/api/collections/${id}/videos`, { params }),
};

// ── Import / Export ───────────────────────────────────────────
export const importExportApi = {
  importCsv:   (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return apiClient.post('/api/import/csv', form, { headers: { 'Content-Type': 'multipart/form-data' }});
  },
  importExcel: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return apiClient.post('/api/import/excel', form, { headers: { 'Content-Type': 'multipart/form-data' }});
  },
  exportCsv:   (params?: VideoFilterParams) =>
    apiClient.get('/api/export/csv',   { params, responseType: 'blob' }),
  exportExcel: (params?: VideoFilterParams) =>
    apiClient.get('/api/export/excel', { params, responseType: 'blob' }),
  exportPdf:   (params?: VideoFilterParams) =>
    apiClient.get('/api/export/pdf',   { params, responseType: 'blob' }),
};

// ── Duplicate Alerts ──────────────────────────────────────────
export const duplicatesApi = {
  getUnresolved: () => apiClient.get<DuplicateAlert[]>('/api/duplicates'),
  resolve:       (id: number) => apiClient.patch(`/api/duplicates/${id}/resolve`),
};

// ── Statistics ────────────────────────────────────────────────
export const statsApi = {
  getMostRecordedTrains:  (limit?: number, startDate?: string, endDate?: string) => apiClient.get('/api/stats/most-recorded-trains', { params: { limit, startDate, endDate } }),
  getMostRecordedLocos:   (limit?: number, startDate?: string, endDate?: string) => apiClient.get('/api/stats/most-recorded-locos', { params: { limit, startDate, endDate } }),
  getMostRecordedSheds:   (limit?: number, startDate?: string, endDate?: string) => apiClient.get('/api/stats/most-recorded-sheds', { params: { limit, startDate, endDate } }),
  getMostRecordedStations:(limit?: number, startDate?: string, endDate?: string) => apiClient.get('/api/stats/most-recorded-stations', { params: { limit, startDate, endDate } }),
  getUploadFrequency:     ()               => apiClient.get('/api/stats/upload-frequency'),
  getAvgDaysBetween:      ()               => apiClient.get('/api/stats/avg-days-between'),
};

// ── Train History ─────────────────────────────────────────────
export const trainsApi = {
  getHistory: (trainNumber: string) => apiClient.get<TrainHistoryResponse[]>(`/api/trains/${trainNumber}/history`),
};

// ── Loco Logbook ──────────────────────────────────────────────
export const locosApi = {
  getAll:     () => apiClient.get<LocoSummaryDto[]>('/api/locos'),
  getHistory: (locoNumber: string) => apiClient.get<LocoHistoryResponse[]>(`/api/locos/${locoNumber}/history`),
};
