import { useQuery } from '@tanstack/react-query'
import { videosApi } from '../api/services'
import { useNavigate } from 'react-router-dom'
import { Calendar as CalendarIcon, Edit2, PlayCircle } from 'lucide-react'
import SignalLoader from '../components/ui/SignalLoader'

export default function UploadPlanner() {
  const navigate = useNavigate()
  
  const { data: page, isLoading } = useQuery({
    queryKey: ['videos', 'scheduled'],
    queryFn: () => videosApi.getAll({ uploadStatus: 'SCHEDULED_UPLOAD', sort: 'scheduledUploadDate', direction: 'ASC', size: 100 }).then(r => r.data)
  })

  return (
    <div className="max-w-6xl mx-auto p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Upload Planner</h1>
        <p className="text-slate-500 text-sm mt-1">Manage videos scheduled for release</p>
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
            {page?.content.map(v => (
              <div key={v.id} className="p-4 flex flex-col md:flex-row gap-4 items-center hover:bg-white/5 transition-colors">
                
                {/* Thumbnail */}
                <div className="w-full md:w-32 h-20 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                  {v.thumbnail ? (
                    <img src={v.thumbnail.startsWith('http') ? v.thumbnail : `data:image/jpeg;base64,${v.thumbnail}`} alt="" className="w-full h-full object-cover opacity-80" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <PlayCircle size={24} />
                    </div>
                  )}
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                      <CalendarIcon size={12} /> Releases: {v.scheduledUploadDate || 'Not scheduled'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-200 truncate">{v.title}</h3>
                </div>

                {/* Actions */}
                <div className="w-full md:w-auto flex gap-2">
                  <button onClick={() => navigate(`/videos/${v.id}`)} className="btn-secondary flex-1 md:flex-none flex items-center justify-center gap-2 py-2 px-4">
                    <Edit2 size={14} /> Edit
                  </button>
                  <button onClick={() => navigate(`/videos/${v.id}`)} className="btn-primary flex-1 md:flex-none py-2 px-4 whitespace-nowrap bg-emerald-600 hover:bg-emerald-500">
                    Publish Now
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
