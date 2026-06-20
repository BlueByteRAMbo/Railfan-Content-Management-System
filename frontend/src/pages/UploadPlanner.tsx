import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { videosApi } from '../api/services'
import { useNavigate } from 'react-router-dom'
import { Calendar as CalendarIcon, Edit2, PlayCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import SignalLoader from '../components/ui/SignalLoader'

export default function UploadPlanner() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const { data: page, isLoading } = useQuery({
    queryKey: ['videos', 'scheduled'],
    queryFn: () => videosApi.getAll({ uploadStatus: 'SCHEDULED_UPLOAD', sort: 'scheduledUploadDate', direction: 'ASC', size: 100 }).then(r => r.data)
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status, extra }: { id: number; status: string; extra?: any }) => videosApi.updateStatus(id, status, extra),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['videos'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
    }
  })

  const bulkMutation = useMutation({
    mutationFn: (data: any) => videosApi.bulkAction(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['videos'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
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
    let extra = {}
    if (action === 'MARK_UPLOADED') {
      const now = new Date()
      extra = { uploadDate: now.toISOString().split('T')[0], uploadTime: now.toTimeString().split(' ')[0].substring(0, 5) }
    }
    bulkMutation.mutate({ videoIds: selectedIds, action, ...extra })
  }

  return (
    <div className="max-w-6xl mx-auto p-8 animate-fade-in relative pb-32">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Upload Planner</h1>
          <p className="text-slate-500 text-sm mt-1">Manage videos scheduled for release</p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <SignalLoader message="LOADING SCHEDULED VIDEOS..." />
        ) : page?.content.length === 0 ? (
          <div className="p-12 text-center">
            <h2 className="text-lg font-bold text-slate-300">Nothing scheduled!</h2>
            <p className="text-sm text-slate-500 mt-1">You have no videos scheduled for upload.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {/* Header / Select All */}
            <div className="p-4 bg-white/5 flex items-center gap-4">
              <input 
                type="checkbox" 
                className="form-checkbox bg-slate-800 border-slate-600 rounded text-brand-500 focus:ring-brand-500/50 cursor-pointer"
                checked={selectedIds.length === page?.content.length && page?.content.length > 0}
                onChange={handleSelectAll}
              />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select All</span>
            </div>

            {page?.content.map(v => (
              <div key={v.id} className={`p-4 flex flex-col md:flex-row gap-4 items-center hover:bg-white/5 transition-colors ${selectedIds.includes(v.id) ? 'bg-brand-500/5' : ''}`}>
                
                <input 
                  type="checkbox" 
                  className="form-checkbox bg-slate-800 border-slate-600 rounded text-brand-500 focus:ring-brand-500/50 cursor-pointer"
                  checked={selectedIds.includes(v.id)}
                  onChange={() => toggleSelect(v.id)}
                />

                {/* Thumbnail */}
                <div className="w-full md:w-32 h-20 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer" onClick={() => navigate(`/videos/${v.id}`)}>
                  {v.thumbnail ? (
                    <img src={v.thumbnail.startsWith('http') ? v.thumbnail : `data:image/jpeg;base64,${v.thumbnail}`} alt="" className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 hover:text-slate-400 transition-colors">
                      <PlayCircle size={24} />
                    </div>
                  )}
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0 w-full cursor-pointer" onClick={() => navigate(`/videos/${v.id}`)}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                      <CalendarIcon size={12} /> Releases: {v.scheduledUploadDate || 'Not scheduled'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-200 truncate group-hover:text-brand-400 transition-colors">{v.title}</h3>
                </div>

                {/* Actions */}
                <div className="w-full md:w-auto flex gap-2">
                  <button onClick={() => navigate(`/videos/${v.id}`)} className="btn-secondary flex-1 md:flex-none flex items-center justify-center gap-2 py-2 px-4">
                    <Edit2 size={14} /> Edit
                  </button>
                  <button 
                    onClick={() => {
                      const now = new Date()
                      updateStatus.mutate({ 
                        id: v.id, 
                        status: 'UPLOADED', 
                        extra: { uploadDate: now.toISOString().split('T')[0], uploadTime: now.toTimeString().split(' ')[0].substring(0, 5) } 
                      })
                    }}
                    disabled={updateStatus.isPending && updateStatus.variables?.id === v.id}
                    className="btn-primary flex-1 md:flex-none py-2 px-4 whitespace-nowrap bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center"
                  >
                    {updateStatus.isPending && updateStatus.variables?.id === v.id ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : 'Publish Now'}
                  </button>
                </div>

              </div>
            ))}
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
            className="fixed bottom-8 md:bottom-12 left-1/2 bg-white/5 backdrop-blur-xl border border-white/10 shadow-glow rounded-full px-6 py-3 flex items-center gap-4 z-50"
          >
            <span className="text-sm font-bold text-white bg-brand-500 px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(217,142,4,0.5)]">
              {selectedIds.length}
            </span>
            <span className="text-sm text-slate-300 mr-2 font-medium">selected</span>
            <button onClick={() => handleBulkAction('MARK_UPLOADED')} disabled={bulkMutation.isPending} className="btn-secondary py-1.5 px-3 text-xs bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20">Publish Selected</button>
            <button onClick={() => handleBulkAction('ARCHIVE')} disabled={bulkMutation.isPending} className="btn-secondary py-1.5 px-3 text-xs bg-white/5 hover:bg-white/10 border-white/10">Archive</button>
            <button onClick={() => handleBulkAction('DELETE')} disabled={bulkMutation.isPending} className="btn-secondary py-1.5 px-3 text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 border-red-500/20">Delete</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
