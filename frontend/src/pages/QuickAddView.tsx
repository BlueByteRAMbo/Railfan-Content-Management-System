import { useState, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { videosApi } from '../api/services'
import type { VideoCreateRequest, UploadStatus, Priority } from '../types'
import { Zap, CheckCircle, Loader2 } from 'lucide-react'

export default function QuickAddView() {
  const qc = useQueryClient()
  const firstInputRef = useRef<HTMLInputElement>(null)
  
  const [successMsg, setSuccessMsg] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    recordingDate: new Date().toISOString().split('T')[0],
    trainNumber: '',
    locoNumber: '',
    stationName: '' // Using station mapping will require search in normal form, but here we keep it raw or omit stationId for now to make it fast.
  })

  const mutation = useMutation({
    mutationFn: (data: VideoCreateRequest) => videosApi.create(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['videos'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      setSuccessMsg(`Added: ${res.data.title}`)
      
      // Reset core fields, keep date
      setFormData(prev => ({
        ...prev,
        title: '',
        trainNumber: '',
        locoNumber: '',
        stationName: ''
      }))
      
      // Focus back on title
      firstInputRef.current?.focus()
      
      setTimeout(() => setSuccessMsg(''), 3000)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.recordingDate) return

    const req: VideoCreateRequest = {
      title: formData.title,
      recordingDate: formData.recordingDate,
      uploadStatus: 'PENDING_UPLOAD' as UploadStatus,
      priority: 'MEDIUM' as Priority,
      trainNumber: formData.trainNumber || undefined,
      locoNumber: formData.locoNumber || undefined,
      // To keep it simple for Quick Add without looking up station IDs, we put stationName in notes or skip it.
      // Or if you want you can store it in observationNotes
      observationNotes: formData.stationName ? `Station: ${formData.stationName}` : undefined
    }

    mutation.mutate(req)
  }

  return (
    <div className="max-w-2xl mx-auto p-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-xl bg-brand-500/20">
          <Zap size={20} className="text-brand-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Quick Add Mode</h1>
          <p className="text-slate-500 text-sm mt-1">Rapid sequential data entry. Press Enter to submit.</p>
        </div>
      </div>

      <div className="glass-card p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="form-label">Video Title <span className="text-red-400">*</span></label>
            <input
              ref={firstInputRef}
              type="text"
              required
              className="form-input"
              placeholder="e.g. 12951 Rajdhani skipping Surat"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="form-label">Recording Date <span className="text-red-400">*</span></label>
              <input
                type="date"
                required
                className="form-input"
                value={formData.recordingDate}
                onChange={e => setFormData({ ...formData, recordingDate: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">Station / Location</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Surat (ST)"
                value={formData.stationName}
                onChange={e => setFormData({ ...formData, stationName: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="form-label">Train Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 12951"
                value={formData.trainNumber}
                onChange={e => setFormData({ ...formData, trainNumber: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">Loco Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 30123"
                value={formData.locoNumber}
                onChange={e => setFormData({ ...formData, locoNumber: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <div className="h-6">
              {successMsg && (
                <span className="text-sm text-emerald-400 flex items-center gap-2 animate-fade-in">
                  <CheckCircle size={14} /> {successMsg}
                </span>
              )}
            </div>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn-primary flex items-center gap-2 px-8"
            >
              {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
              Save & Next
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
