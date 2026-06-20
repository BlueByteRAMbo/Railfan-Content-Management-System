// ── Enums ─────────────────────────────────────────────────────
export type UploadStatus = 'PENDING_UPLOAD' | 'SCHEDULED_UPLOAD' | 'UPLOADED' | 'ARCHIVED';
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
export type SecondaryLocoRole = 'BANKER' | 'TWIN_LEAD' | 'TWIN_TRAIL' | 'DEAD_ATTACHED' | 'PUSH_PULL';
export type EncounterType = 'CROSSING' | 'PARALLEL_RUN' | 'SERIES_ENCOUNTER';

export const INDIAN_RAILWAY_ZONES = [
  'CR', 'ER', 'ECR', 'ECoR', 'NR', 'NCR', 'NER', 'NFR', 'NWR',
  'SR', 'SCR', 'SER', 'SECR', 'SWR', 'WR', 'WCR', 'SCoR', 'KR'
];

// ── Reference Types ───────────────────────────────────────────
export interface TrainCategory {
  id: number;
  name: string;
  description?: string;
}

export interface LocoType {
  id: number;
  name: string;
  traction: 'ELECTRIC' | 'DIESEL' | 'DUAL';
  description?: string;
}

export interface LocoShed {
  id: number;
  name: string;
  zone?: string;
  location?: string;
}

export interface Station {
  id: number;
  name: string;
  stationCode?: string;
  state?: string;
  railwayZone?: string;
}

export interface MapPointDto {
  id: number;
  gpsLat: number;
  gpsLng: number;
  locoTypeName?: string;
  locoNumber?: string;
  recordingDate: string;
  thumbnail?: string;
}

export interface Tag {
  id: number;
  name: string;
}

export interface RailCollection {
  id: number;
  name: string;
  description?: string;
  coverThumbnail?: string;
  videoCount?: number;
}

// ── Video (core type) ─────────────────────────────────────────
export interface Video {
  id: number;

  // Basic
  title: string;
  description?: string;
  recordingDate: string;   // ISO date string: "2025-07-09"
  recordingTime?: string;  // "HH:mm:ss"
  uploadStatus: UploadStatus;

  // Upload
  uploadDate?: string;
  uploadTime?: string;
  youtubeUrl?: string;
  youtubeVideoId?: string;
  scheduledUploadDate?: string;
  priority: Priority;

  // Media
  fileName?: string;
  durationSeconds?: number;
  fileSizeBytes?: number;
  resolution?: string;
  fps?: number;
  thumbnail?: string;  // Base64

  // Train
  trainNumber?: string;
  trainName?: string;
  trainCategoryId?: number;
  trainCategoryName?: string;

  // Locomotive
  locoNumber?: string;
  locoTypeId?: number;
  locoTypeName?: string;
  locoShedId?: number;
  locoShedName?: string;
  locoLivery?: string;
  kavachFitted: boolean;
  isOfflink: boolean;

  // Location
  stationId?: number;
  stationName?: string;
  section?: string;
  state?: string;
  railwayZone?: string;
  gpsLat?: number;
  gpsLng?: number;

  // Content
  notes?: string;
  interestingEvents?: string;
  observationNotes?: string;

  // Relations
  // Relations
  tags: Tag[];
  collections: RailCollection[];

  // Multi-Loco & Multi-Train
  secondaryLocos?: SecondaryLoco[];
  trainEncounters?: TrainEncounter[];

  // Audit
  createdAt: string;
  updatedAt: string;
  daysBetweenRecordingAndUpload?: number;
}

/** Lightweight video card (for lists, queues) */
export interface VideoSummary {
  id: number;
  title: string;
  recordingDate: string;
  uploadStatus: UploadStatus;
  uploadDate?: string;
  priority: Priority;
  trainNumber?: string;
  trainName?: string;
  locoNumber?: string;
  locoTypeName?: string;
  locoShedName?: string;
  stationName?: string;
  durationSeconds?: number;
  fileSizeBytes?: number;
  thumbnail?: string;
  youtubeVideoId?: string;
  scheduledUploadDate?: string;
  kavachFitted: boolean;
  isOfflink?: boolean;
  tagNames: string[];
}

// ── Paged Response ────────────────────────────────────────────
export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;  // current page (0-indexed)
  first: boolean;
  last: boolean;
}

// ── Dashboard ─────────────────────────────────────────────────
export interface DashboardStats {
  totalVideos: number;
  uploadedVideos: number;
  pendingVideos: number;
  scheduledVideos: number;
  archivedVideos: number;
  totalStorageBytes: number;
  totalDurationSeconds: number;
  averageDurationSeconds: number;
  videosRecordedThisMonth: number;
  videosUploadedThisMonth: number;
  unresolvedDuplicates: number;
}

export interface MonthlyChartPoint {
  year: number;
  month: number;        // 1–12
  label: string;        // "Jan 2025"
  count: number;
}

export interface CategoryDistribution {
  name: string;
  count: number;
}

export interface DashboardCharts {
  recordingsPerMonth: MonthlyChartPoint[];
  uploadsPerMonth: MonthlyChartPoint[];
  locoTypeDistribution: CategoryDistribution[];
  shedDistribution: CategoryDistribution[];
  trainCategoryDistribution: CategoryDistribution[];
}

// ── Auth ──────────────────────────────────────────────────────
export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  username: string;
  email: string;
  role: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface SecondaryLoco {
  id: number;
  locoNumber?: string;
  locoType?: { id: number; name: string };
  locoShed?: { id: number; name: string };
  role: SecondaryLocoRole;
}

export interface TrainEncounter {
  id: number;
  encounterType: EncounterType;
  trainNumber?: string;
  trainName?: string;
  trainCategory?: { id: number; name: string };
  locoNumber?: string;
  locoType?: { id: number; name: string };
  locoShed?: { id: number; name: string };
  recordingDate?: string;
  recordingTime?: string;
}

// ── Request types ─────────────────────────────────────────────
export interface VideoCreateRequest {
  title: string;
  description?: string;
  recordingDate: string;
  recordingTime?: string;
  uploadStatus: UploadStatus;
  uploadDate?: string;
  uploadTime?: string;
  youtubeUrl?: string;
  youtubeVideoId?: string;
  scheduledUploadDate?: string;
  priority: Priority;
  fileName?: string;
  durationSeconds?: number;
  fileSizeBytes?: number;
  resolution?: string;
  fps?: number;
  thumbnail?: string;
  trainNumber?: string;
  trainName?: string;
  trainCategoryId?: number;
  locoNumber?: string;
  locoTypeId?: number;
  locoShedId?: number;
  locoLivery?: string;
  kavachFitted?: boolean;
  stationId?: number;
  section?: string;
  state?: string;
  railwayZone?: string;
  gpsLat?: number;
  gpsLng?: number;
  notes?: string;
  interestingEvents?: string;
  observationNotes?: string;
  tagIds?: number[];
  collectionIds?: number[];
  secondaryLocos?: SecondaryLocoRequest[];
  trainEncounters?: TrainEncounterRequest[];
}

export interface SecondaryLocoRequest {
  locoNumber?: string;
  locoTypeId?: number;
  locoShedId?: number;
  role: SecondaryLocoRole;
}

export interface TrainEncounterRequest {
  encounterType: EncounterType;
  trainNumber?: string;
  trainName?: string;
  trainCategoryId?: number;
  locoNumber?: string;
  locoTypeId?: number;
  locoShedId?: number;
  recordingDate?: string;
  recordingTime?: string;
}

export type VideoUpdateRequest = Partial<VideoCreateRequest>;

export interface BulkActionRequest {
  videoIds: number[];
  action: 'MARK_UPLOADED' | 'SCHEDULE_UPLOAD' | 'ARCHIVE' | 'DELETE';
  uploadDate?: string;
  uploadTime?: string;
  scheduledDate?: string;
}

// ── Timeline ──────────────────────────────────────────────────
export interface TimelineDay {
  date: string;
  videos: VideoSummary[];
}

export interface TimelineMonth {
  year: number;
  month: number;
  label: string;
  count: number;
}

// ── Duplicate Alert ───────────────────────────────────────────
export interface DuplicateAlert {
  id: number;
  video: VideoSummary;
  conflictingVideo: VideoSummary;
  reason: string;
  isResolved: boolean;
  createdAt: string;
}

// ── API Filter Params ─────────────────────────────────────────
export interface VideoFilterParams {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
  q?: string;
  uploadStatus?: UploadStatus;
  priority?: Priority;
  trainNumber?: string;
  trainName?: string;
  locoNumber?: string;
  locoTypeId?: number;
  locoShedId?: number;
  trainCategoryId?: number;
  stationId?: number;
  recordingDateFrom?: string;
  recordingDateTo?: string;
  uploadDateFrom?: string;
  uploadDateTo?: string;
  kavachFitted?: boolean;
  isOfflink?: boolean;
  tagIds?: number[];
  collectionId?: number;
  year?: number;
  month?: number;
}

// ── Train Runs Tracker Types ──────────────────────────────────
export interface TrainAppearanceDto {
  videoId: number;
  videoTitle: string;
  recordingTime?: string;
  locoNumber?: string;
  locoTypeName?: string;
  locoShedName?: string;
  stationName?: string;
}

export interface TrainHistoryResponse {
  date: string;
  locoChanged: boolean;
  appearances: TrainAppearanceDto[];
}

// ── Loco Logbook ──────────────────────────────────────────────
export interface LocoSummaryDto {
  locoNumber: string;
  count: number;
  firstSeen: string;
  lastSeen: string;
}

export interface LocoAppearanceDto {
  videoId: number;
  videoTitle: string;
  recordingTime?: string;
  trainNumber?: string;
  trainName?: string;
  stationName?: string;
}

export interface LocoHistoryResponse {
  date: string;
  shedOrLiveryChanged: boolean;
  currentShed?: string;
  currentLivery?: string;
  appearances: LocoAppearanceDto[];
}
