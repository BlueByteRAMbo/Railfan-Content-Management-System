import { useQuery } from '@tanstack/react-query'
import { duplicatesApi } from '../api/services'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Check, ExternalLink } from 'lucide-react'
import SignalLoader from '../components/ui/SignalLoader'

export default function DuplicateResolver() {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['duplicates', 'unresolved'],
    queryFn: () => duplicatesApi.getUnresolved().then(r => r.data)
  })

  const resolveMutation = useMutation({
    mutationFn: (id: number) => duplicatesApi.resolve(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['duplicates', 'unresolved'] })
      qc.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
    }
  })

  if (isLoading) return <SignalLoader message="CHECKING DUPLICATES..." />

  return (
    <div className="max-w-4xl mx-auto p-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-xl bg-amber-500/20">
          <AlertTriangle size={20} className="text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Duplicate Resolver</h1>
          <p className="text-slate-500 text-sm mt-1">Review potentially duplicate video records</p>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="glass-card p-12 text-center flex flex-col items-center justify-center">
          <Check size={48} className="text-emerald-500/50 mb-4" />
          <h2 className="text-lg font-bold text-slate-300">All Clear!</h2>
          <p className="text-sm text-slate-500 mt-2">No duplicate alerts pending review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map(alert => (
            <div key={alert.id} className="glass-card p-5 border-l-4 border-l-amber-500 relative overflow-hidden">
              <div className="flex flex-col md:flex-row gap-6">
                
                {/* Info Column */}
                <div className="flex-1">
                  <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-3">
                    Reason: {alert.reason}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Source Video */}
                    <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                      <p className="text-xs text-slate-500 mb-1">Triggering Video</p>
                      <p className="text-sm font-semibold text-slate-200 mb-2 truncate" title={alert.video.title}>{alert.video.title}</p>
                      <button onClick={() => navigate(`/videos/${alert.video.id}`)} className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
                        View Details <ExternalLink size={10} />
                      </button>
                    </div>

                    {/* Target Video */}
                    <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                      <p className="text-xs text-slate-500 mb-1">Conflicting Video</p>
                      <p className="text-sm font-semibold text-slate-200 mb-2 truncate" title={alert.conflictingVideo.title}>{alert.conflictingVideo.title}</p>
                      <button onClick={() => navigate(`/videos/${alert.conflictingVideo.id}`)} className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
                        View Details <ExternalLink size={10} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="md:w-48 flex flex-col justify-center gap-2 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
                  <button
                    onClick={() => resolveMutation.mutate(alert.id)}
                    disabled={resolveMutation.isPending}
                    className="btn-primary py-2 text-sm w-full"
                  >
                    Mark as Resolved
                  </button>
                  <p className="text-xs text-slate-500 text-center mt-2 leading-relaxed">
                    If these are truly duplicates, view details to manually merge or delete one.
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
