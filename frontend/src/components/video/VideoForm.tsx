import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import {
  useTrainCategories, useLocoTypes, useLocoSheds,
  useTags, useCollections
} from '../../hooks/useReferenceData'
import { useDuplicateCheck } from '../../hooks/useVideos'
import { videosApi } from '../../api/services'
import type { Video, VideoCreateRequest } from '../../types'
import { AlertTriangle, Loader2, CheckCircle, Plus, X, PlayCircle } from 'lucide-react';
import StationSelect from '../../components/ui/StationSelect';
import SearchableSelect from '../../components/ui/SearchableSelect';

// ── Validation Schema ─────────────────────────────────────────
const schema = z.object({
  title:            z.string().min(1, 'Title is required'),
  recordingDate:    z.string().min(1, 'Recording date is required'),
  recordingTime:    z.string().optional(),
  uploadStatus:     z.enum(['PENDING_UPLOAD', 'SCHEDULED_UPLOAD', 'UPLOADED', 'ARCHIVED']),
  uploadDate:       z.string().optional(),
  uploadTime:       z.string().optional(),
  scheduledUploadDate: z.string().optional(),
  priority:         z.enum(['HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
  youtubeUrl:       z.string().optional(),
  youtubeVideoId:   z.string().optional(),
  description:      z.string().optional(),
  fileName:         z.string().optional(),
  durationSeconds:  z.coerce.number().optional(),
  fileSizeBytes:    z.coerce.number().optional(),
  resolution:       z.string().optional(),
  fps:              z.coerce.number().optional(),
  thumbnail:        z.string().optional(),
  trainNumber:      z.string().optional(),
  trainName:        z.string().optional(),
  trainCategoryId:  z.coerce.number().optional(),
  locoNumber:       z.string().optional(),
  locoTypeId:       z.coerce.number().optional(),
  locoShedId:       z.coerce.number().optional(),
  locoLivery:       z.string().optional(),
  kavachFitted:     z.boolean().default(false),
  stationId:        z.coerce.number().optional(),
  section:          z.string().optional(),
  state:            z.string().optional(),
  railwayZone:      z.string().optional(),
  gpsLat:           z.preprocess((val) => val === '' ? undefined : val, z.coerce.number().optional()),
  gpsLng:           z.preprocess((val) => val === '' ? undefined : val, z.coerce.number().optional()),
  notes:            z.string().optional(),
  interestingEvents: z.string().optional(),
  observationNotes: z.string().optional(),
  newTagNames:      z.array(z.string()).default([]),
  collectionIds:    z.array(z.number()).default([]),
  secondaryLocos:   z.array(z.object({
    locoNumber: z.string().optional(),
    locoTypeId: z.coerce.number().optional(),
    locoShedId: z.coerce.number().optional(),
    role: z.enum(['BANKER', 'TWIN_LEAD', 'TWIN_TRAIL', 'DEAD_ATTACHED', 'PUSH_PULL']),
  })).default([]),
  trainEncounters:  z.array(z.object({
    encounterType: z.enum(['CROSSING', 'PARALLEL_RUN', 'SERIES_ENCOUNTER']),
    trainNumber: z.string().optional(),
    trainName: z.string().optional(),
    trainCategoryId: z.coerce.number().optional(),
    locoNumber: z.string().optional(),
    locoTypeId: z.coerce.number().optional(),
    locoShedId: z.coerce.number().optional(),
    recordingDate: z.string().optional(),
    recordingTime: z.string().optional(),
  })).default([]),
}).refine(
  (d) => d.uploadStatus !== 'UPLOADED' || (!!d.uploadDate && !!d.uploadTime),
  { message: 'Upload date and time are required when status is Uploaded', path: ['uploadDate'] }
)

type FormValues = z.infer<typeof schema>

// ── Sub-components ────────────────────────────────────────────
function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
      {children} {required && <span className="text-red-400">*</span>}
    </label>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-red-400">{message}</p>
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">{children}</h3>
      <div className="flex-1 h-px bg-white/5" />
    </div>
  )
}

// ── Tag input ─────────────────────────────────────────────────
function TagInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState('')
  const { data: suggestions = [] } = useTags()

  const add = (name: string) => {
    const clean = name.trim().replace(/^#/, '').toLowerCase()
    if (clean && !value.includes(clean)) onChange([...value, clean])
    setInput('')
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {value.map(tag => (
          <span key={tag} className="flex items-center gap-1 bg-brand-700/40 text-brand-300 text-xs px-2 py-1 rounded-full border border-brand-600/30">
            #{tag}
            <button onClick={() => onChange(value.filter(t => t !== tag))} className="text-brand-400 hover:text-white">
              <X size={10} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(input) } }}
          className="form-input flex-1 text-sm"
          placeholder="#WAP7 — press Enter to add"
          list="tag-suggestions"
        />
        <datalist id="tag-suggestions">
          {suggestions.map(t => <option key={t.id} value={t.name} />)}
        </datalist>
        <button type="button" onClick={() => add(input)} className="btn-secondary px-3">
          <Plus size={14} />
        </button>
      </div>
    </div>
  )
}

// ── Main VideoForm ────────────────────────────────────────────
interface VideoFormProps {
  defaultValues?: Partial<Video>
  onSubmit: (data: VideoCreateRequest) => Promise<void>
  isSubmitting: boolean
  submitLabel?: string
}

export default function VideoForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel = 'Save Video'
}: VideoFormProps) {
  const { data: categories = [] }  = useTrainCategories()
  const { data: locoTypes = [] }   = useLocoTypes()
  const { data: locoSheds = [], isLoading: shedsLoading } = useLocoSheds()
  const { data: collections = [] } = useCollections()

  const [ytLoading, setYtLoading] = useState(false)
  const [ytSuccess, setYtSuccess] = useState(false)

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      uploadStatus: 'PENDING_UPLOAD',
      priority: 'MEDIUM',
      kavachFitted: false,
      newTagNames: [],
      collectionIds: [],
      ...defaultValues ? mapVideoToForm(defaultValues) : {},
    },
  })

  const uploadStatus  = watch('uploadStatus')
  const trainNumber   = watch('trainNumber')
  const locoNumber    = watch('locoNumber')
  const recordingDate = watch('recordingDate')
  const youtubeVideoId = watch('youtubeVideoId')

  const { fields: locoFields, append: appendLoco, remove: removeLoco } = useFieldArray({
    control,
    name: 'secondaryLocos'
  })

  const { fields: encounterFields, append: appendEncounter, remove: removeEncounter } = useFieldArray({
    control,
    name: 'trainEncounters'
  })

  // Duplicate check
  const { data: dupes = [] } = useDuplicateCheck(
    trainNumber, locoNumber, recordingDate, defaultValues?.id
  )

  // Fetch YouTube metadata when video ID is provided
  const fetchYouTubeMeta = async () => {
    const id = youtubeVideoId?.trim()
    if (!id) return
    setYtLoading(true)
    try {
      const res = await videosApi.fetchYouTubeMetadata(id)
      const meta = res.data as any
      const opts = { shouldValidate: true, shouldDirty: true }
      if (meta.title)           setValue('title', meta.title, opts)
      if (meta.description)     setValue('description', meta.description, opts)
      if (meta.durationSeconds) setValue('durationSeconds', meta.durationSeconds, opts)
      if (meta.thumbnailUrl)    setValue('thumbnail', meta.thumbnailUrl, opts)
      if (meta.thumbnailUrl)    setValue('youtubeUrl', `https://youtube.com/watch?v=${id}`, opts)
      setYtSuccess(true)
      setTimeout(() => setYtSuccess(false), 3000)
    } catch {
      // YouTube fetch failed - continue without metadata
    } finally {
      setYtLoading(false)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFormSubmit = async (values: any) => {
    const req: VideoCreateRequest = {
      ...values,
      recordingDate: values.recordingDate,
      recordingTime: values.recordingTime || undefined,
      uploadDate: values.uploadDate || undefined,
      uploadTime: values.uploadTime || undefined,
      scheduledUploadDate: values.scheduledUploadDate || undefined,
      fps: values.fps ? Number(values.fps) : undefined,
      durationSeconds: values.durationSeconds ? Number(values.durationSeconds) : undefined,
      fileSizeBytes: values.fileSizeBytes ? Number(values.fileSizeBytes) : undefined,
      trainCategoryId: values.trainCategoryId ? Number(values.trainCategoryId) : undefined,
      locoTypeId: values.locoTypeId ? Number(values.locoTypeId) : undefined,
      locoShedId: values.locoShedId ? Number(values.locoShedId) : undefined,
      stationId: values.stationId ? Number(values.stationId) : undefined,
    }
    await onSubmit(req)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-10">

      {/* ── Duplicate Warning ── */}
      {dupes.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-300">Potential Duplicate Detected</p>
            <ul className="text-xs text-amber-500 mt-1 space-y-0.5">
              {dupes.map(d => (
                <li key={d.id}>• {d.title} — {d.recordingDate}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── Basic Details ── */}
      <div>
        <SectionTitle>Basic Details</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <FieldLabel required>Title</FieldLabel>
            <input {...register('title')} className="form-input" placeholder="Pushpak Express at Palasdhari Gradient" />
            <FieldError message={errors.title?.message} />
          </div>

          <div>
            <FieldLabel required>Recording Date</FieldLabel>
            <input {...register('recordingDate')} type="date" className="form-input" />
            <FieldError message={errors.recordingDate?.message} />
          </div>

          <div>
            <FieldLabel>Recording Time</FieldLabel>
            <input {...register('recordingTime')} type="time" className="form-input" />
          </div>

          <div>
            <FieldLabel required>Upload Status</FieldLabel>
            <select {...register('uploadStatus')} className="form-input">
              <option value="PENDING_UPLOAD">Pending Upload</option>
              <option value="SCHEDULED_UPLOAD">Scheduled Upload</option>
              <option value="UPLOADED">Uploaded</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div>
            <FieldLabel>Priority</FieldLabel>
            <select {...register('priority')} className="form-input">
              <option value="HIGH">🔴 High</option>
              <option value="MEDIUM">🟡 Medium</option>
              <option value="LOW">🟢 Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Upload Details (conditional) ── */}
      {(uploadStatus === 'UPLOADED' || uploadStatus === 'SCHEDULED_UPLOAD') && (
        <div>
          <SectionTitle>Upload Details</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {uploadStatus === 'UPLOADED' && (
              <>
                <div>
                  <FieldLabel required>Upload Date</FieldLabel>
                  <input {...register('uploadDate')} type="date" className="form-input" />
                  <FieldError message={errors.uploadDate?.message} />
                </div>
                <div>
                  <FieldLabel required>Upload Time</FieldLabel>
                  <input {...register('uploadTime')} type="time" className="form-input" />
                </div>
              </>
            )}

            {uploadStatus === 'SCHEDULED_UPLOAD' && (
              <div>
                <FieldLabel>Scheduled Upload Date</FieldLabel>
                <input {...register('scheduledUploadDate')} type="date" className="form-input" />
              </div>
            )}

            <div>
              <FieldLabel>YouTube Video ID</FieldLabel>
              <div className="flex gap-2">
                <input {...register('youtubeVideoId')} className="form-input flex-1" placeholder="dQw4w9WgXcQ" />
                <button
                  type="button"
                  onClick={fetchYouTubeMeta}
                  disabled={ytLoading}
                  className="btn-secondary px-3 flex items-center gap-1.5 text-xs whitespace-nowrap"
                  title="Fetch metadata from YouTube"
                >
                  {ytLoading ? <Loader2 size={14} className="animate-spin" /> :
                   ytSuccess ? <CheckCircle size={14} className="text-emerald-400" /> :
                   <PlayCircle size={14} />}
                  {ytLoading ? 'Fetching…' : ytSuccess ? 'Done!' : 'Fetch'}
                </button>
              </div>
            </div>

            <div>
              <FieldLabel>YouTube URL</FieldLabel>
              <input {...register('youtubeUrl')} className="form-input" placeholder="https://youtube.com/watch?v=…" />
            </div>
          </div>
        </div>
      )}

      {/* ── Train Details ── */}
      <div>
        <SectionTitle>Train Details</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <FieldLabel>Train Number</FieldLabel>
            <input {...register('trainNumber')} className="form-input font-mono" placeholder="12101" />
          </div>
          <div className="md:col-span-2">
            <FieldLabel>Train Name</FieldLabel>
            <input {...register('trainName')} className="form-input" placeholder="Pushpak Express" />
          </div>
          <div className="md:col-span-3">
            <FieldLabel>Train Category</FieldLabel>
            <select {...register('trainCategoryId')} className="form-input">
              <option value="">— Select category —</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        {/* Train Encounters (Field Array) */}
        <div className="mt-6 space-y-4">
          {encounterFields.map((field, index) => (
            <div key={field.id} className="relative p-5 rounded-xl bg-white/5 border border-white/10 mt-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <button 
                type="button" 
                onClick={() => removeEncounter(index)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                title="Remove Encounter"
              >
                <X size={16} />
              </button>
              
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                Encounter {index + 1}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-3">
                  <FieldLabel required>Encounter Type</FieldLabel>
                  <div className="flex gap-4 mt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" value="CROSSING" {...register(`trainEncounters.${index}.encounterType`)} className="text-brand-500 bg-slate-800 border-slate-600 focus:ring-brand-500 focus:ring-offset-slate-900" />
                      <span className="text-sm text-slate-300">Crossing (XING)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" value="PARALLEL_RUN" {...register(`trainEncounters.${index}.encounterType`)} className="text-brand-500 bg-slate-800 border-slate-600 focus:ring-brand-500 focus:ring-offset-slate-900" />
                      <span className="text-sm text-slate-300">Parallel Run</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" value="SERIES_ENCOUNTER" {...register(`trainEncounters.${index}.encounterType`)} className="text-brand-500 bg-slate-800 border-slate-600 focus:ring-brand-500 focus:ring-offset-slate-900" />
                      <span className="text-sm text-slate-300">Series</span>
                    </label>
                  </div>
                </div>
                
                {watch(`trainEncounters.${index}.encounterType`) === 'SERIES_ENCOUNTER' && (
                  <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <div>
                      <FieldLabel required>Encounter Date</FieldLabel>
                      <input {...register(`trainEncounters.${index}.recordingDate`)} type="date" className="form-input" />
                    </div>
                    <div>
                      <FieldLabel>Encounter Time</FieldLabel>
                      <input {...register(`trainEncounters.${index}.recordingTime`)} type="time" className="form-input" />
                    </div>
                  </div>
                )}
                
                <div>
                  <FieldLabel>Train Number</FieldLabel>
                  <input {...register(`trainEncounters.${index}.trainNumber`)} className="form-input font-mono" placeholder="Number" />
                </div>
                <div className="md:col-span-2">
                  <FieldLabel>Train Name</FieldLabel>
                  <input {...register(`trainEncounters.${index}.trainName`)} className="form-input" placeholder="Name" />
                </div>
                <div className="md:col-span-3">
                  <FieldLabel>Train Category</FieldLabel>
                  <select {...register(`trainEncounters.${index}.trainCategoryId`)} className="form-input">
                    <option value="">— Select category —</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                
                <div className="md:col-span-3 mt-2 pt-4 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider font-semibold">Encounter Loco (Optional)</p>
                  </div>
                  <div>
                    <FieldLabel>Loco Number</FieldLabel>
                    <input {...register(`trainEncounters.${index}.locoNumber`)} className="form-input font-mono" placeholder="Number" />
                  </div>
                  <div>
                    <FieldLabel>Loco Type</FieldLabel>
                    <select {...register(`trainEncounters.${index}.locoTypeId`)} className="form-input">
                      <option value="">— Select type —</option>
                      {locoTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <FieldLabel>Loco Shed</FieldLabel>
                    <Controller
                      name={`trainEncounters.${index}.locoShedId`}
                      control={control}
                      render={({ field }) => (
                        <SearchableSelect
                          options={locoSheds.map(s => ({ value: s.id, label: s.name }))}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="— Search shed —"
                          isLoading={shedsLoading}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={() => appendEncounter({ encounterType: 'CROSSING' })}
            className="w-full py-4 rounded-xl border-2 border-dashed border-white/10 text-slate-400 font-semibold text-sm hover:border-brand-500/50 hover:text-brand-300 hover:bg-brand-500/5 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            Add Train Encounter (XING / Parallel)
          </button>
        </div>
      </div>

      {/* ── Locomotive Details ── */}
      <div>
        <SectionTitle>Locomotive Details</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <FieldLabel>Loco Number</FieldLabel>
            <input {...register('locoNumber')} className="form-input font-mono" placeholder="22906" />
          </div>
          <div>
            <FieldLabel>Loco Type</FieldLabel>
            <select {...register('locoTypeId')} className="form-input">
              <option value="">— Select type —</option>
              {locoTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <FieldLabel>Loco Shed</FieldLabel>
            <Controller
              name="locoShedId"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  options={locoSheds.map(s => ({ value: s.id, label: s.name }))}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="— Search shed —"
                  isLoading={shedsLoading}
                />
              )}
            />
          </div>
          <div>
            <FieldLabel>Loco Livery</FieldLabel>
            <input {...register('locoLivery')} className="form-input" placeholder="Blue, Orange, Freight Grey…" />
          </div>
          <div className="flex items-center gap-3">
            <Controller
              name="kavachFitted"
              control={control}
              render={({ field }) => (
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div
                    onClick={() => field.onChange(!field.value)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${field.value ? 'bg-emerald-500' : 'bg-slate-700'}`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${field.value ? 'translate-x-5' : ''}`} />
                  </div>
                  <span className="text-sm font-medium text-slate-300">KAVACH Fitted</span>
                </label>
              )}
            />
          </div>
        </div>

        {/* Secondary Locos (Field Array) */}
        <div className="mt-6 space-y-4">
          {locoFields.map((field, index) => (
            <div key={field.id} className="relative p-5 rounded-xl bg-white/5 border border-white/10 mt-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <button 
                type="button" 
                onClick={() => removeLoco(index)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                title="Remove Secondary Loco"
              >
                <X size={16} />
              </button>
              
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                Secondary Loco {index + 1}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <FieldLabel required>Role</FieldLabel>
                  <select {...register(`secondaryLocos.${index}.role`)} className="form-input">
                    <option value="BANKER">Banker (Pusher)</option>
                    <option value="TWIN_LEAD">Leading Twin</option>
                    <option value="TWIN_TRAIL">Trailing Twin</option>
                    <option value="DEAD_ATTACHED">Dead Attached</option>
                    <option value="PUSH_PULL">Push-Pull (Tail)</option>
                  </select>
                </div>
                <div>
                  <FieldLabel>Loco Number</FieldLabel>
                  <input {...register(`secondaryLocos.${index}.locoNumber`)} className="form-input font-mono" placeholder="Number" />
                </div>
                <div>
                  <FieldLabel>Loco Type</FieldLabel>
                  <select {...register(`secondaryLocos.${index}.locoTypeId`)} className="form-input">
                    <option value="">— Select type —</option>
                    {locoTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <FieldLabel>Loco Shed</FieldLabel>
                  <Controller
                    name={`secondaryLocos.${index}.locoShedId`}
                    control={control}
                    render={({ field }) => (
                      <SearchableSelect
                        options={locoSheds.map(s => ({ value: s.id, label: s.name }))}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="— Search shed —"
                        isLoading={shedsLoading}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={() => appendLoco({ role: 'BANKER' })}
            className="w-full py-4 rounded-xl border-2 border-dashed border-white/10 text-slate-400 font-semibold text-sm hover:border-brand-500/50 hover:text-brand-300 hover:bg-brand-500/5 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            Add Secondary Loco (Banker / Twin)
          </button>
        </div>
      </div>

      {/* ── Location Details ── */}
      <div>
        <SectionTitle>Location Details</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <FieldLabel>Station</FieldLabel>
            <StationSelect
              value={watch('stationId')}
              onChange={id => setValue('stationId', id)}
            />
          </div>
          <div>
            <FieldLabel>Section / Location</FieldLabel>
            <input {...register('section')} className="form-input" placeholder="Palasdhari Gradient, Khardi Curve…" />
          </div>
          <div>
            <FieldLabel>State</FieldLabel>
            <input {...register('state')} className="form-input" placeholder="Maharashtra" />
          </div>
          <div>
            <FieldLabel>Railway Zone</FieldLabel>
            <input {...register('railwayZone')} className="form-input" placeholder="CR, WR, NR…" />
          </div>
          <div>
            <FieldLabel>GPS Latitude</FieldLabel>
            <input {...register('gpsLat')} type="number" step="any" className="form-input" placeholder="18.9218" />
            <FieldError message={errors.gpsLat?.message} />
          </div>
          <div>
            <FieldLabel>GPS Longitude</FieldLabel>
            <input {...register('gpsLng')} type="number" step="any" className="form-input" placeholder="72.8347" />
            <FieldError message={errors.gpsLng?.message} />
          </div>
        </div>
      </div>

      {/* ── Media Details ── */}
      <div>
        <SectionTitle>Media Details</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-3">
            <FieldLabel>File Name</FieldLabel>
            <input {...register('fileName')} className="form-input font-mono text-sm" placeholder="VID_20250709_143022.mp4" />
          </div>
          <div>
            <FieldLabel>Duration (seconds)</FieldLabel>
            <input {...register('durationSeconds')} type="number" className="form-input" placeholder="300" />
          </div>
          <div>
            <FieldLabel>File Size (bytes)</FieldLabel>
            <input {...register('fileSizeBytes')} type="number" className="form-input" placeholder="1073741824" />
          </div>
          <div>
            <FieldLabel>Resolution</FieldLabel>
            <select {...register('resolution')} className="form-input">
              <option value="">— Select —</option>
              <option value="3840x2160">4K (3840×2160)</option>
              <option value="1920x1080">1080p (1920×1080)</option>
              <option value="1280x720">720p (1280×720)</option>
              <option value="640x480">480p (640×480)</option>
            </select>
          </div>
          <div>
            <FieldLabel>FPS</FieldLabel>
            <select {...register('fps')} className="form-input">
              <option value="">— Select —</option>
              <option value="24">24 fps</option>
              <option value="25">25 fps</option>
              <option value="30">30 fps</option>
              <option value="50">50 fps</option>
              <option value="60">60 fps</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Content Details ── */}
      <div>
        <SectionTitle>Content Notes</SectionTitle>
        <div className="space-y-4">
          <div>
            <FieldLabel>Description</FieldLabel>
            <textarea {...register('description')} rows={3} className="form-input resize-none" placeholder="Brief description of the video…" />
          </div>
          <div>
            <FieldLabel>Notes</FieldLabel>
            <textarea {...register('notes')} rows={2} className="form-input resize-none" placeholder="Rare WAP4 haul, Running late by 45 mins…" />
          </div>
          <div>
            <FieldLabel>Interesting Events</FieldLabel>
            <textarea {...register('interestingEvents')} rows={2} className="form-input resize-none" placeholder="Triple banker WAG7, Running train boarding incident…" />
          </div>
          <div>
            <FieldLabel>Observation Notes</FieldLabel>
            <textarea {...register('observationNotes')} rows={2} className="form-input resize-none" placeholder="Crossed with Rajdhani at Kasara…" />
          </div>
        </div>
      </div>

      {/* ── Tags ── */}
      <div>
        <SectionTitle>Tags</SectionTitle>
        <Controller
          name="newTagNames"
          control={control}
          render={({ field }) => (
            <TagInput value={field.value} onChange={field.onChange} />
          )}
        />
      </div>

      {/* ── Collections ── */}
      <div>
        <SectionTitle>Collections</SectionTitle>
        <Controller
          name="collectionIds"
          control={control}
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {collections.map(col => {
                const selected = field.value.includes(col.id)
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => {
                      if (selected) field.onChange(field.value.filter(id => id !== col.id))
                      else field.onChange([...field.value, col.id])
                    }}
                    className={`text-sm px-3 py-1.5 rounded-lg border transition-all ${
                      selected
                        ? 'bg-brand-600/30 border-brand-500/50 text-brand-300'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    {col.name}
                  </button>
                )
              })}
            </div>
          )}
        />
      </div>

      {/* ── Submit ── */}
      <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary px-8 py-2.5 flex items-center gap-2 disabled:opacity-60"
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

// ── Helper: map Video entity → form defaults ──────────────────
function mapVideoToForm(v: Partial<Video>): Partial<FormValues> {
  return {
    title:           v.title,
    description:     v.description,
    recordingDate:   v.recordingDate,
    recordingTime:   v.recordingTime,
    uploadStatus:    v.uploadStatus,
    uploadDate:      v.uploadDate,
    uploadTime:      v.uploadTime,
    scheduledUploadDate: v.scheduledUploadDate,
    priority:        v.priority,
    youtubeUrl:      v.youtubeUrl,
    youtubeVideoId:  v.youtubeVideoId,
    fileName:        v.fileName,
    durationSeconds: v.durationSeconds,
    fileSizeBytes:   v.fileSizeBytes,
    resolution:      v.resolution,
    fps:             v.fps,
    trainNumber:     v.trainNumber,
    trainName:       v.trainName,
    trainCategoryId: v.trainCategoryId,
    locoNumber:      v.locoNumber,
    locoTypeId:      v.locoTypeId,
    locoShedId:      v.locoShedId,
    locoLivery:      v.locoLivery,
    kavachFitted:    v.kavachFitted,
    stationId:       v.stationId,
    section:         v.section,
    state:           v.state,
    railwayZone:     v.railwayZone,
    gpsLat:          v.gpsLat,
    gpsLng:          v.gpsLng,
    notes:           v.notes,
    interestingEvents: v.interestingEvents,
    observationNotes: v.observationNotes,
    newTagNames:     v.tags?.map(t => t.name) ?? [],
    collectionIds:   v.collections?.map(c => c.id) ?? [],
    secondaryLocos:  v.secondaryLocos?.map(l => ({
      locoNumber: l.locoNumber,
      locoTypeId: l.locoType?.id,
      locoShedId: l.locoShed?.id,
      role: l.role
    })) ?? [],
    trainEncounters: v.trainEncounters?.map(e => ({
      encounterType: e.encounterType,
      trainNumber: e.trainNumber,
      trainName: e.trainName,
      trainCategoryId: e.trainCategory?.id,
      locoNumber: e.locoNumber,
      locoTypeId: e.locoType?.id,
      locoShedId: e.locoShed?.id,
      recordingDate: e.recordingDate,
      recordingTime: e.recordingTime
    })) ?? [],
  }
}
