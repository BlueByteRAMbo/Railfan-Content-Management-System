import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { videosApi } from '../api/services'
import { useVideo, useUpdateVideo, useDeleteVideo, useUpdateVideoStatus } from '../hooks/useVideos'
import VideoForm from '../components/video/VideoForm'
import type { VideoCreateRequest, UploadStatus } from '../types'
import {
  ArrowLeft, Edit2, Trash2, PlayCircle, CheckCircle,
  Calendar, Clock, HardDrive, Film, MapPin, Train, Zap, Tag, Copy, Check, ChevronLeft, ChevronRight, AlertTriangle
} from 'lucide-react'
import SignalLoader from '../components/ui/SignalLoader'

const STATUS_COLORS: Record<UploadStatus, string> = {
  PENDING_UPLOAD:   'status-pending',
  SCHEDULED_UPLOAD: 'status-scheduled',
  UPLOADED:         'status-uploaded',
  ARCHIVED:         'status-archived',
}

const STATUS_LABELS: Record<UploadStatus, string> = {
  PENDING_UPLOAD:   'Pending Upload',
  SCHEDULED_UPLOAD: 'Scheduled',
  UPLOADED:         'Uploaded',
  ARCHIVED:         'Archived',
}

function formatBytes(bytes?: number | null): string {
  if (!bytes) return '—'
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`
  return `${(bytes / 1e6).toFixed(0)} MB`
}

function formatDuration(secs?: number | null): string {
  if (!secs) return '—'
  const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  return `${m}:${String(s).padStart(2,'0')}`
}

function DetailItem({ label, value, copyable }: { label: string; value?: string | number | null | boolean; copyable?: boolean }) {
  const [copied, setCopied] = useState(false)
  if (value === undefined || value === null || value === '') return null

  const handleCopy = () => {
    navigator.clipboard.writeText(String(value))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <p className="text-xs text-slate-600 uppercase tracking-wide mb-0.5">{label}</p>
      <div className="flex items-center gap-2">
        <p className="text-sm text-slate-200 font-medium">{String(value)}</p>
        {copyable && (
          <button onClick={handleCopy} title="Copy to clipboard" className="text-slate-500 hover:text-brand-400 transition-colors">
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          </button>
        )}
      </div>
    </div>
  )
}

export default function VideoDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const { data: video, isLoading } = useVideo(Number(id))
  const updateMutation      = useUpdateVideo(Number(id))
  const deleteMutation      = useDeleteVideo()
  const statusMutation      = useUpdateVideoStatus()

  // Routing list state for Prev/Next
  const filteredIds = location.state?.videoIds as number[] | undefined
  let prevId = null
  let nextId = null
  if (filteredIds) {
    const currentIndex = filteredIds.indexOf(Number(id))
    if (currentIndex > 0) prevId = filteredIds[currentIndex - 1]
    if (currentIndex !== -1 && currentIndex < filteredIds.length - 1) nextId = filteredIds[currentIndex + 1]
  }

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 h-[calc(100vh-100px)] flex justify-center items-center">
        <SignalLoader message="LOADING VIDEO DETAILS..." />
      </div>
    )
  }

  if (!video) return <div className="p-4 md:p-8 text-slate-500">Video not found.</div>

  const handleUpdate = async (data: VideoCreateRequest) => {
    await updateMutation.mutateAsync(data)
    setEditing(false)
  }

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(Number(id))
    navigate('/videos')
  }

  const handleMarkUploaded = () => {
    const now = new Date()
    statusMutation.mutate({
      id: Number(id),
      status: 'UPLOADED',
      extra: {
        uploadDate: now.toISOString().split('T')[0],
        uploadTime: now.toTimeString().slice(0, 5),
      }
    })
  }

  // ── Edit mode ─────────────────────────────────────────────
  if (editing) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setEditing(false)} className="btn-secondary p-2">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-2xl font-bold text-white">Edit Video</h1>
        </div>
        <div className="glass-card p-4 md:p-8">
          <VideoForm
            defaultValues={video}
            onSubmit={handleUpdate}
            isSubmitting={updateMutation.isPending}
            submitLabel="Save Changes"
          />
        </div>
      </div>
    )
  }

  // ── View mode ─────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="btn-secondary p-2">
            <ArrowLeft size={18} />
          </button>

          {filteredIds && (
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
              <button 
                onClick={() => prevId && navigate(`/videos/${prevId}`, { state: { videoIds: filteredIds } })} 
                disabled={!prevId}
                className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                title="Previous Video"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={() => nextId && navigate(`/videos/${nextId}`, { state: { videoIds: filteredIds } })} 
                disabled={!nextId}
                className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                title="Next Video"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          <div>
            <h1 className="text-2xl font-bold text-white">{video.title}</h1>
            <div className="flex items-center gap-3 mt-1.5">
              <span className={`status-badge ${STATUS_COLORS[video.uploadStatus]}`}>
                {STATUS_LABELS[video.uploadStatus]}
              </span>
              {video.kavachFitted && (
                <span className="status-badge bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                  <Zap size={10} /> KAVACH
                </span>
              )}
              {video.isOfflink && (
                <span className="status-badge bg-rose-500/15 text-rose-400 border-rose-500/30">
                  <AlertTriangle size={10} /> OFFLINK
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {video.uploadStatus !== 'UPLOADED' && (
            <button
              onClick={handleMarkUploaded}
              disabled={statusMutation.isPending}
              className="btn-secondary flex items-center gap-2 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
            >
              <CheckCircle size={15} />
              Mark Uploaded
            </button>
          )}
          {video.youtubeUrl && (
            <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer"
               className="btn-secondary flex items-center gap-2 text-red-400">
              <PlayCircle size={15} />
              YouTube
            </a>
          )}
          <button onClick={() => setEditing(true)} className="btn-secondary flex items-center gap-2">
            <Edit2 size={15} />
            Edit
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="btn-secondary flex items-center gap-2 text-red-400 hover:bg-red-500/10"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-between">
          <p className="text-sm text-red-300">Are you sure you want to delete this video?</p>
          <div className="flex gap-2">
            <button onClick={() => setConfirmDelete(false)} className="btn-secondary py-1.5 px-3 text-xs">Cancel</button>
            <button onClick={handleDelete} className="bg-red-600 text-white py-1.5 px-3 rounded-lg text-xs font-semibold hover:bg-red-500">Delete</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">

          {/* Thumbnail / YouTube embed */}
          {video.youtubeVideoId ? (
            <div className="glass-card overflow-hidden rounded-xl aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${video.youtubeVideoId}`}
                className="w-full h-full"
                allowFullScreen
                title={video.title}
              />
            </div>
          ) : video.thumbnail ? (
            <img
              src={video.thumbnail.startsWith('http') ? video.thumbnail : `data:image/jpeg;base64,${video.thumbnail}`}
              alt={video.title}
              className="w-full rounded-xl object-cover max-h-80"
            />
          ) : null}

          {/* Recording & Upload info */}
          <div className="glass-card p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-white/3">
              <Calendar size={16} className="text-brand-400 mx-auto mb-1" />
              <p className="text-xs text-slate-500 mb-0.5">Recorded</p>
              <p className="text-sm font-semibold text-slate-200">{video.recordingDate}</p>
              {video.recordingTime && <p className="text-xs text-slate-500">{video.recordingTime}</p>}
            </div>
            {video.uploadDate && (
              <div className="text-center p-3 rounded-lg bg-emerald-500/5">
                <CheckCircle size={16} className="text-emerald-400 mx-auto mb-1" />
                <p className="text-xs text-slate-500 mb-0.5">Uploaded</p>
                <p className="text-sm font-semibold text-slate-200">{video.uploadDate}</p>
                {video.uploadTime && <p className="text-xs text-slate-500">{video.uploadTime}</p>}
              </div>
            )}
            <div className="text-center p-3 rounded-lg bg-white/3">
              <Clock size={16} className="text-amber-400 mx-auto mb-1" />
              <p className="text-xs text-slate-500 mb-0.5">Duration</p>
              <p className="text-sm font-semibold text-slate-200">{formatDuration(video.durationSeconds)}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/3">
              <HardDrive size={16} className="text-purple-400 mx-auto mb-1" />
              <p className="text-xs text-slate-500 mb-0.5">File Size</p>
              <p className="text-sm font-semibold text-slate-200">{formatBytes(video.fileSizeBytes)}</p>
            </div>
            {video.daysBetweenRecordingAndUpload != null && (
              <div className="col-span-2 md:col-span-4 text-center py-2 bg-brand-700/20 rounded-lg">
                <p className="text-xs text-brand-400">
                  ⏱ {video.daysBetweenRecordingAndUpload} days between recording and upload
                </p>
              </div>
            )}
          </div>

          {/* Notes */}
          {(video.description || video.notes || video.interestingEvents || video.observationNotes) && (
            <div className="glass-card p-5 space-y-4">
              {video.description && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Description</p>
                  <p className="text-sm text-slate-300 leading-relaxed">{video.description}</p>
                </div>
              )}
              {video.notes && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Notes</p>
                  <p className="text-sm text-slate-300 leading-relaxed">{video.notes}</p>
                </div>
              )}
              {video.interestingEvents && (
                <div>
                  <p className="text-xs text-amber-500 uppercase tracking-wide mb-1">⭐ Interesting Events</p>
                  <p className="text-sm text-slate-300 leading-relaxed">{video.interestingEvents}</p>
                </div>
              )}
              {video.observationNotes && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Observation Notes</p>
                  <p className="text-sm text-slate-300 leading-relaxed">{video.observationNotes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column — metadata */}
        <div className="space-y-4">

          {/* Train */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Train size={14} className="text-brand-400" />
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Train</h3>
            </div>
            <div className="space-y-2.5">
              <DetailItem label="Number" value={video.trainNumber} copyable />
              <DetailItem label="Name"   value={video.trainName} />
              <DetailItem label="Category" value={video.trainCategoryName} />
            </div>
          </div>

          {/* Locomotive */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Film size={14} className="text-amber-400" />
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Locomotive</h3>
            </div>
            <div className="space-y-2.5">
              <DetailItem label="Number"  value={video.locoNumber} copyable />
              <DetailItem label="Type"    value={video.locoTypeName} />
              <DetailItem label="Shed"    value={video.locoShedName} />
              <DetailItem label="Livery"  value={video.locoLivery} />
              {video.kavachFitted && (
                <div className="flex items-center gap-2 pt-1">
                  <Zap size={12} className="text-emerald-400" />
                  <span className="text-xs text-emerald-400 font-semibold">KAVACH Fitted</span>
                </div>
              )}
              {video.isOfflink && (
                <div className="flex items-center gap-2 pt-1">
                  <AlertTriangle size={12} className="text-rose-400" />
                  <span className="text-xs text-rose-400 font-semibold">Offlink Encounter</span>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={14} className="text-pink-400" />
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Location</h3>
            </div>
            <div className="space-y-2.5">
              <DetailItem label="Station" value={video.stationName} />
              <DetailItem label="Section" value={video.section} />
              <DetailItem label="State"   value={video.state} />
              <DetailItem label="Zone"    value={video.railwayZone} />
              {video.gpsLat && video.gpsLng ? (
                <>
                  <DetailItem label="GPS" value={`${video.gpsLat}, ${video.gpsLng}`} />
                  <div className="mt-3 overflow-hidden rounded-lg aspect-video border border-white/5 relative">
                    <iframe
                      src={`https://maps.google.com/maps?q=${video.gpsLat},${video.gpsLng}&z=13&output=embed`}
                      className="w-full h-full border-0 invert-[0.9] hue-rotate-[180deg]"
                      loading="lazy"
                      title="Location Map"
                    />
                  </div>
                </>
              ) : (
                <div className="mt-3 flex flex-col items-center justify-center p-6 bg-white/5 border border-white/10 border-dashed rounded-lg text-center">
                  <MapPin size={24} className="text-slate-600 mb-2" />
                  <p className="text-xs font-semibold text-slate-400">No GPS Coordinates</p>
                  <p className="text-[10px] text-slate-500 mt-1 max-w-[200px]">Edit this video to add Latitude and Longitude to view the interactive map.</p>
                </div>
              )}
            </div>
          </div>

          {/* Media */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Film size={14} className="text-purple-400" />
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Media</h3>
            </div>
            <div className="space-y-2.5">
              <DetailItem label="File"       value={video.fileName} />
              <DetailItem label="Resolution" value={video.resolution} />
              <DetailItem label="FPS"        value={video.fps ? `${video.fps} fps` : null} />
            </div>
          </div>

          {/* Tags */}
          {video.tags.length > 0 && (
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Tag size={14} className="text-brand-400" />
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Tags</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {video.tags.map(t => (
                  <span key={t.id} className="text-xs bg-brand-700/30 text-brand-300 px-2 py-0.5 rounded-full border border-brand-600/20">
                    #{t.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Collections */}
          {video.collections.length > 0 && (
            <div className="glass-card p-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Collections</h3>
              <div className="space-y-1">
                {video.collections.map(c => (
                  <p key={c.id} className="text-sm text-slate-300">📁 {c.name}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Videos Section */}
      <div className="mt-8">
        {video.trainNumber && <RelatedVideosPanel type="train" value={video.trainNumber} currentVideoId={video.id} />}
        {video.locoNumber && <RelatedVideosPanel type="loco" value={video.locoNumber} currentVideoId={video.id} />}
      </div>
    </div>
  )
}

function RelatedVideosPanel({ type, value, currentVideoId }: { type: 'train' | 'loco', value?: string, currentVideoId: number }) {
  const navigate = useNavigate()
  
  const { data } = useQuery({
    queryKey: ['videos', 'related', type, value, currentVideoId],
    queryFn: () => videosApi.getAll({ 
      trainNumber: type === 'train' ? value : undefined, 
      locoNumber: type === 'loco' ? value : undefined, 
      size: 6, 
      sort: 'recordingDate', 
      direction: 'DESC' 
    }).then(r => r.data),
    enabled: !!value
  })

  if (!data?.content) return null
  const related = data.content.filter(v => v.id !== currentVideoId).slice(0, 5)
  if (related.length === 0) return null

  // Pass the context of the related videos when clicking through to keep Next/Prev buttons alive
  const relatedIds = data.content.map(v => v.id)

  return (
    <div className="pt-8 border-t border-white/10 animate-fade-in first:mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          {type === 'train' ? <Train className="text-brand-400" size={18} /> : <Film className="text-brand-400" size={18} />}
          Same {type === 'train' ? 'Train' : 'Locomotive'}
        </h3>
        <span className="text-xs font-bold text-slate-400 bg-white/5 px-2 py-1 rounded">
          {value}
        </span>
      </div>
      
      <div className="flex overflow-x-auto gap-4 pb-6 snap-x hide-scrollbar">
        {related.map(v => (
          <div 
            key={v.id} 
            onClick={() => navigate(`/videos/${v.id}`, { state: { videoIds: relatedIds } })} 
            className="snap-start shrink-0 w-[240px] bg-white/5 border border-white/5 hover:border-brand-500/50 rounded-xl overflow-hidden cursor-pointer group transition-all"
          >
            <div className="h-32 bg-slate-800 relative">
              {v.thumbnail ? (
                <img src={v.thumbnail.startsWith('http') ? v.thumbnail : `data:image/jpeg;base64,${v.thumbnail}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Thumbnail" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600 group-hover:text-brand-400 transition-colors">
                  <PlayCircle size={32} />
                </div>
              )}
            </div>
            <div className="p-3">
              <h4 className="font-bold text-slate-200 text-sm line-clamp-2 leading-snug group-hover:text-brand-400 transition-colors mb-1">{v.title}</h4>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar size={12} /> {v.recordingDate || 'Unknown Date'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
