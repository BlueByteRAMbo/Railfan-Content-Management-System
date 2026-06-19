import { useQuery } from '@tanstack/react-query'
import { videosApi } from '../api/services'
import { useNavigate } from 'react-router-dom'
import { HardDrive, Edit2, PlayCircle } from 'lucide-react'
import SignalLoader from '../components/ui/SignalLoader'

export default function PendingQueue() {
  const navigate = useNavigate()
  
  const { data: page, isLoading } = useQuery({
    queryKey: ['videos', 'pending'],
    queryFn: () => videosApi.getAll({ uploadStatus: 'PENDING_UPLOAD', sort: 'priority', direction: 'DESC', size: 100 }).then(r => r.data)
  })

  return (
    <div className="max-w-6xl mx-auto p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Pending Queue</h1>
        <p className="text-slate-500 text-sm mt-1">Videos awaiting upload to YouTube</p>
      </div>

      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <SignalLoader message="LOADING PENDING VIDEOS..." />
        ) : page?.content.length === 0 ? (
          <div className="p-12 text-center">
            <h2 className="text-lg font-bold text-slate-300">All caught up!</h2>
            <p className="text-sm text-slate-500 mt-1">You have no pending videos to upload.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {page?.content.map(v => (
              <div key={v.id} className="p-4 flex flex-col md:flex-row gap-4 items-center hover:bg-white/5 transition-colors">
                
                {/* Thumbnail */}
                <div className="w-full md:w-40 h-24 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                  {v.thumbnail ? (
                    <img src={v.thumbnail.startsWith('http') ? v.thumbnail : `data:image/jpeg;base64,${v.thumbnail}`} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <PlayCircle size={24} />
                    </div>
                  )}
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${v.priority === 'HIGH' ? 'bg-red-500/20 text-red-400' : v.priority === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-400'}`}>
                      {v.priority} Priority
                    </span>
                    <span className="text-xs text-slate-500">Recorded {v.recordingDate}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-200 truncate">{v.title}</h3>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><HardDrive size={12} /> {(v.fileSizeBytes ? v.fileSizeBytes / (1024*1024*1024) : 0).toFixed(1)} GB</span>
                    {v.trainNumber && <span>Train: {v.trainNumber}</span>}
                    {v.locoNumber && <span>Loco: {v.locoNumber}</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="w-full md:w-auto flex gap-2">
                  <button onClick={() => navigate(`/videos/${v.id}`)} className="btn-secondary flex-1 md:flex-none flex items-center justify-center gap-2 py-2 px-4">
                    <Edit2 size={14} /> Review
                  </button>
                  <button onClick={() => navigate(`/videos/${v.id}`)} className="btn-primary flex-1 md:flex-none py-2 px-4 whitespace-nowrap">
                    Mark Uploaded
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
