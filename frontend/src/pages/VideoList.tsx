import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { videosApi } from '../api/services'
import type { VideoFilterParams, UploadStatus } from '../types'
import { Filter, Plus, Clock, HardDrive, Search, Zap, AlertTriangle } from 'lucide-react'
import SignalLoader from '../components/ui/SignalLoader'
import { motion, AnimatePresence } from 'framer-motion'

const STATUS_LABELS: Record<UploadStatus, string> = {
  PENDING_UPLOAD: 'Pending',
  SCHEDULED_UPLOAD: 'Scheduled',
  UPLOADED: 'Uploaded',
  ARCHIVED: 'Archived',
}

const STATUS_CLASSES: Record<UploadStatus, string> = {
  PENDING_UPLOAD: 'status-pending',
  SCHEDULED_UPLOAD: 'status-scheduled',
  UPLOADED: 'status-uploaded',
  ARCHIVED: 'status-archived',
}

function formatDuration(seconds?: number): string {
  if (!seconds) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function formatBytes(bytes?: number): string {
  if (!bytes) return '—'
  const gb = bytes / (1024 ** 3)
  if (gb >= 1) return `${gb.toFixed(1)} GB`
  return `${(bytes / (1024 ** 2)).toFixed(0)} MB`
}

export default function VideoList() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [searchParams] = useSearchParams()
  const [filters, setFilters] = useState<VideoFilterParams>({
    page: 0,
    size: 20,
    sort: 'recordingDate',
    direction: 'DESC',
    q: searchParams.get('q') || undefined,
    recordingDateFrom: searchParams.get('recordingDateFrom') || undefined,
    recordingDateTo: searchParams.get('recordingDateTo') || undefined,
  })

  useEffect(() => {
    setFilters(f => ({
      ...f,
      q: searchParams.get('q') || undefined,
      recordingDateFrom: searchParams.get('recordingDateFrom') || undefined,
      recordingDateTo: searchParams.get('recordingDateTo') || undefined,
      page: 0
    }))
    if (searchParams.get('recordingDateFrom') || searchParams.get('recordingDateTo')) {
      setShowFilters(true)
    }
  }, [searchParams])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [schedulePromptOpen, setSchedulePromptOpen] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const { data: page, isLoading } = useQuery({
    queryKey: ['videos', filters],
    queryFn: () => videosApi.getAll(filters).then(r => r.data),
  })

  const bulkMutation = useMutation({
    mutationFn: (data: any) => videosApi.bulkAction(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['videos'] })
      setSelectedIds([])
    }
  })

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked && page) {
      setSelectedIds(page.content.map(v => v.id))
    } else {
      setSelectedIds([])
    }
  }

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleBulkAction = (action: string) => {
    if (!selectedIds.length) return
    if (action === 'SCHEDULE_UPLOAD') {
      setSchedulePromptOpen(true)
      return
    }

    let extra = {}
    if (action === 'MARK_UPLOADED') {
      const now = new Date()
      extra = { uploadDate: now.toISOString().split('T')[0], uploadTime: now.toTimeString().split(' ')[0].substring(0, 5) }
    }
    bulkMutation.mutate({ videoIds: selectedIds, action, ...extra })
  }

  const confirmSchedule = () => {
    if (!scheduleDate) return
    bulkMutation.mutate({ videoIds: selectedIds, action: 'SCHEDULE_UPLOAD', scheduledDate: scheduleDate })
    setSchedulePromptOpen(false)
    setScheduleDate('')
  }

  return (
    <div className="p-4 md:p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">All Videos</h1>
          <p className="text-slate-500 text-sm mt-1">
            {page ? `${page.totalElements.toLocaleString()} total videos` : 'Loading…'}
          </p>
        </div>
        <button onClick={() => navigate('/videos/add')} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Add Video
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by title, train, loco…"
            className="form-input pl-9"
            value={filters.q || ''}
            onChange={(e) => setFilters(f => ({ ...f, q: e.target.value || undefined, page: 0 }))}
          />
        </div>
        <select
          className="form-input w-44"
          onChange={(e) => setFilters(f => ({
            ...f,
            uploadStatus: e.target.value as UploadStatus || undefined,
            page: 0
          }))}
        >
          <option value="">All Statuses</option>
          <option value="PENDING_UPLOAD">Pending</option>
          <option value="SCHEDULED_UPLOAD">Scheduled</option>
          <option value="UPLOADED">Uploaded</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary flex items-center gap-2 transition-all ${showFilters ? 'bg-brand-500/10 border-brand-500 text-brand-400' : ''}`}
        >
          <Filter size={15} />
          Filters
        </button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="mb-6"
          >
            <div className="glass-card p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Recorded From</label>
                <input
                  type="date"
                  className="form-input text-xs"
                  value={filters.recordingDateFrom || ''}
                  onChange={(e) => setFilters(f => ({ ...f, recordingDateFrom: e.target.value || undefined, page: 0 }))}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Recorded To</label>
                <input
                  type="date"
                  className="form-input text-xs"
                  value={filters.recordingDateTo || ''}
                  onChange={(e) => setFilters(f => ({ ...f, recordingDateTo: e.target.value || undefined, page: 0 }))}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Priority</label>
                <select
                  className="form-input text-xs"
                  value={filters.priority || ''}
                  onChange={(e) => setFilters(f => ({ ...f, priority: e.target.value as any || undefined, page: 0 }))}
                >
                  <option value="">All Priorities</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Kavach Status</label>
                <select
                  className="form-input text-xs"
                  value={filters.kavachFitted === undefined ? '' : String(filters.kavachFitted)}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFilters(f => ({
                      ...f,
                      kavachFitted: val === '' ? undefined : val === 'true',
                      page: 0
                    }));
                  }}
                >
                  <option value="">All Statuses</option>
                  <option value="true">Kavach Fitted</option>
                  <option value="false">Not Fitted</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Sort By</label>
                <select
                  className="form-input text-xs"
                  value={filters.sort || 'recordingDate'}
                  onChange={(e) => setFilters(f => ({ ...f, sort: e.target.value, page: 0 }))}
                >
                  <option value="recordingDate">Recording Date</option>
                  <option value="title">Title</option>
                  <option value="durationSeconds">Duration</option>
                  <option value="fileSizeBytes">File Size</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Direction</label>
                <select
                  className="form-input text-xs"
                  value={filters.direction || 'DESC'}
                  onChange={(e) => setFilters(f => ({ ...f, direction: e.target.value as 'ASC' | 'DESC', page: 0 }))}
                >
                  <option value="DESC">Descending</option>
                  <option value="ASC">Ascending</option>
                </select>
              </div>
              <div className="sm:col-span-2 md:col-span-2 flex items-end justify-end">
                <button
                  onClick={() => {
                    setFilters({ page: 0, size: 20, sort: 'recordingDate', direction: 'DESC' });
                  }}
                  className="btn-secondary py-1.5 px-4 text-xs w-full sm:w-auto bg-white/5 hover:bg-white/10 border-white/10"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table & Cards */}
      <div className="glass-card overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-10">
                  <input type="checkbox" className="form-checkbox"
                    checked={page && page.content.length > 0 && selectedIds.length === page.content.length}
                    onChange={handleSelectAll} />
                </th>
                <th>Title</th>
                <th>Recorded</th>
                <th>Status</th>
                <th>Train</th>
                <th>Loco</th>
                <th>Station</th>
                <th><Clock size={13} /></th>
                <th><HardDrive size={13} /></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12">
                    <SignalLoader message="FETCHING VIDEOS..." />
                  </td>
                </tr>
              ) : page?.content.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-slate-600">
                    No videos found. Add your first video to get started!
                  </td>
                </tr>
              ) : page?.content.map((v) => (
                <tr
                  key={v.id}
                  className={`cursor-pointer ${selectedIds.includes(v.id) ? 'bg-brand-500/10' : ''}`}
                >
                  <td onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" className="form-checkbox"
                      checked={selectedIds.includes(v.id)}
                      onChange={() => toggleSelect(v.id)} />
                  </td>
                  <td onClick={() => navigate(`/videos/${v.id}`)}>
                    <div className="flex items-center gap-3">
                      {v.thumbnail ? (
                        <img
                          src={v.thumbnail.startsWith('http') ? v.thumbnail : `data:image/jpeg;base64,${v.thumbnail}`}
                          alt={v.title}
                          className="w-12 h-8 rounded object-cover bg-slate-800 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-8 rounded bg-slate-800 flex-shrink-0" />
                      )}
                      <div className="flex flex-col">
                        <span className="font-medium text-white truncate max-w-xs">{v.title}</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          {v.kavachFitted && (
                            <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1 rounded font-bold uppercase flex items-center gap-0.5">
                              <Zap size={8} /> Kavach
                            </span>
                          )}
                          {v.isOfflink && (
                            <span className="text-[9px] bg-rose-500/15 text-rose-400 border border-rose-500/30 px-1 rounded font-bold uppercase flex items-center gap-0.5">
                              <AlertTriangle size={8} /> Offlink
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td onClick={() => navigate(`/videos/${v.id}`)} className="text-slate-400 text-sm whitespace-nowrap">{v.recordingDate}</td>
                  <td onClick={() => navigate(`/videos/${v.id}`)}>
                    <span className={`status-badge ${STATUS_CLASSES[v.uploadStatus]}`}>
                      {STATUS_LABELS[v.uploadStatus]}
                    </span>
                  </td>
                  <td onClick={() => navigate(`/videos/${v.id}`)} className="text-slate-400 text-sm">
                    {v.trainNumber && <span className="font-mono text-xs bg-white/5 px-1.5 py-0.5 rounded mr-1">{v.trainNumber}</span>}
                    {v.trainName}
                  </td>
                  <td onClick={() => navigate(`/videos/${v.id}`)} className="font-mono text-xs text-slate-400">{v.locoNumber || '—'}</td>
                  <td onClick={() => navigate(`/videos/${v.id}`)} className="text-slate-400 text-sm">{v.stationName || '—'}</td>
                  <td onClick={() => navigate(`/videos/${v.id}`)} className="text-slate-500 text-sm font-mono">{formatDuration(v.durationSeconds)}</td>
                  <td onClick={() => navigate(`/videos/${v.id}`)} className="text-slate-500 text-sm">{formatBytes(v.fileSizeBytes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List */}
        <div className="md:hidden flex flex-col divide-y divide-white/5">
          {isLoading ? (
            <div className="py-12">
              <SignalLoader message="FETCHING VIDEOS..." />
            </div>
          ) : page?.content.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No videos found. Add your first video to get started!
            </div>
          ) : page?.content.map((v) => (
            <div
              key={v.id}
              className={`p-4 flex items-start gap-4 transition-colors ${selectedIds.includes(v.id) ? 'bg-brand-500/10' : ''}`}
              onClick={() => navigate(`/videos/${v.id}`)}
            >
              <div onClick={(e) => e.stopPropagation()} className="pt-1">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={selectedIds.includes(v.id)}
                  onChange={() => toggleSelect(v.id)}
                />
              </div>
              {v.thumbnail ? (
                <img
                  src={v.thumbnail.startsWith('http') ? v.thumbnail : `data:image/jpeg;base64,${v.thumbnail}`}
                  alt={v.title}
                  className="w-20 h-14 rounded object-cover bg-slate-800 flex-shrink-0"
                />
              ) : (
                <div className="w-20 h-14 rounded bg-slate-800 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate text-sm mb-1">{v.title}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-2">
                  <span>{v.recordingDate}</span>
                  <span>•</span>
                  <span>{formatDuration(v.durationSeconds)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`status-badge text-[10px] px-2 py-0.5 ${STATUS_CLASSES[v.uploadStatus]}`}>
                    {STATUS_LABELS[v.uploadStatus]}
                  </span>
                  {(v.trainNumber || v.locoNumber) && (
                    <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-slate-300">
                      {v.trainNumber || v.locoNumber}
                    </span>
                  )}
                  {v.isOfflink && (
                    <span className="text-[10px] bg-rose-500/15 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1">
                      <AlertTriangle size={10} /> Offlink
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>



        {/* Pagination */}
        {page && page.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
            <p className="text-sm text-slate-500">
              Page {(filters.page ?? 0) + 1} of {page.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                className="btn-secondary py-1.5 px-3 text-xs"
                disabled={filters.page === 0}
                onClick={() => setFilters(f => ({ ...f, page: (f.page ?? 0) - 1 }))}
              >
                Previous
              </button>
              <button
                className="btn-secondary py-1.5 px-3 text-xs"
                disabled={page.last}
                onClick={() => setFilters(f => ({ ...f, page: (f.page ?? 0) + 1 }))}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions Floating Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0, x: '-50%' }}
            animate={{ y: 0, opacity: 1, x: '-50%' }}
            exit={{ y: 100, opacity: 0, x: '-50%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="fixed bottom-8 md:bottom-12 left-1/2 bg-[#16161a] border border-white/10 shadow-glow rounded-2xl md:rounded-full px-6 py-3 flex flex-col md:flex-row items-center gap-4 z-50"
          >
            {schedulePromptOpen ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-white whitespace-nowrap">Schedule Date:</span>
                <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className="form-input text-xs py-1.5 bg-slate-800 text-white" />
                <button onClick={confirmSchedule} className="btn-primary py-1.5 px-3 text-xs whitespace-nowrap" disabled={!scheduleDate || bulkMutation.isPending}>Confirm</button>
                <button onClick={() => { setSchedulePromptOpen(false); setScheduleDate(''); }} className="btn-secondary py-1.5 px-3 text-xs whitespace-nowrap">Cancel</button>
              </div>
            ) : (
              <>
                <span className="text-sm font-bold text-white bg-brand-500 px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(217,142,4,0.5)]">
                  {selectedIds.length}
                </span>
                <span className="text-sm text-slate-300 mr-2 font-medium">selected</span>
                <button onClick={() => handleBulkAction('MARK_UPLOADED')} disabled={bulkMutation.isPending} className="btn-secondary py-1.5 px-3 text-xs bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20">Mark Uploaded</button>
                <button onClick={() => handleBulkAction('SCHEDULE_UPLOAD')} disabled={bulkMutation.isPending} className="btn-secondary py-1.5 px-3 text-xs bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 border-brand-500/20">Schedule</button>
                <button onClick={() => handleBulkAction('ARCHIVE')} disabled={bulkMutation.isPending} className="btn-secondary py-1.5 px-3 text-xs bg-white/5 hover:bg-white/10 border-white/10">Archive</button>
                <button onClick={() => handleBulkAction('DELETE')} disabled={bulkMutation.isPending} className="btn-secondary py-1.5 px-3 text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 border-red-500/20">Delete</button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
