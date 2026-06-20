import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { locosApi } from '../api/services'
import { ArrowLeft, Film, Clock, Navigation, Zap, Calendar as CalendarIcon, Hash } from 'lucide-react'
import SignalLoader from '../components/ui/SignalLoader'

export default function LocoDetail() {
  const { number } = useParams<{ number: string }>()
  const navigate = useNavigate()

  const { data: history, isLoading } = useQuery({
    queryKey: ['locos', number, 'history'],
    queryFn: () => locosApi.getHistory(number!).then(r => r.data),
    enabled: !!number
  })

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 h-64 flex justify-center items-center">
        <SignalLoader message={`LOADING LOCOMOTIVE ${number}...`} />
      </div>
    )
  }

  if (!history || history.length === 0) {
    return <div className="p-8 text-slate-500">No logbook data found for Loco {number}.</div>
  }

  // Aggregate stats
  const totalEncounters = history.reduce((sum, h) => sum + h.appearances.length, 0)
  const currentShed = history[0]?.currentShed || 'Unknown Shed'
  const currentLivery = history[0]?.currentLivery || 'Standard'

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in pb-32">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/locos')} className="btn-secondary p-2">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            Loco <span className="text-brand-400">{number}</span>
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-5">
          <Hash size={18} className="text-brand-400 mb-2" />
          <p className="text-xs text-slate-500 uppercase tracking-wide">Total Encounters</p>
          <p className="text-xl font-bold text-white mt-1">{totalEncounters}</p>
        </div>
        <div className="glass-card p-5">
          <Navigation size={18} className="text-pink-400 mb-2" />
          <p className="text-xs text-slate-500 uppercase tracking-wide">Current Shed</p>
          <p className="text-xl font-bold text-white mt-1 truncate">{currentShed}</p>
        </div>
        <div className="glass-card p-5">
          <Zap size={18} className="text-emerald-400 mb-2" />
          <p className="text-xs text-slate-500 uppercase tracking-wide">Last Known Livery</p>
          <p className="text-xl font-bold text-white mt-1 truncate">{currentLivery}</p>
        </div>
      </div>

      <div className="glass-card p-8">
        <h2 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
          <Clock className="text-brand-400" /> Encounter Timeline
        </h2>
        
        <div className="relative border-l-2 border-white/10 ml-4 md:ml-6 space-y-12">
          {history.map((day, i) => (
            <div key={day.date} className="relative">
              {/* Node */}
              <div className="absolute -left-[31px] md:-left-[35px] bg-slate-900 border-2 border-brand-500 p-1.5 rounded-full z-10">
                <CalendarIcon size={16} className="text-brand-400" />
              </div>
              
              <div className="pl-6 md:pl-10">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-lg font-bold text-slate-200">{day.date}</h3>
                  {day.shedOrLiveryChanged && (
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                      Details Changed
                    </span>
                  )}
                  {i === history.length - 1 && (
                    <span className="bg-brand-500/10 text-brand-400 border border-brand-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                      First Capture
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {day.appearances.map(app => (
                    <div 
                      key={app.videoId} 
                      onClick={() => navigate(`/videos/${app.videoId}`)}
                      className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-brand-500/50 cursor-pointer transition-colors group flex items-start gap-4"
                    >
                      <div className="bg-brand-500/10 p-3 rounded-lg text-brand-400 group-hover:scale-110 transition-transform">
                        <Film size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-slate-200 truncate group-hover:text-brand-400 transition-colors">
                            {app.videoTitle}
                          </h4>
                          <span className="text-xs font-medium text-slate-500 whitespace-nowrap ml-4">
                            {app.recordingTime || '--:--'}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                          {app.trainNumber && (
                            <p className="text-xs text-slate-400 font-medium">Train: <span className="text-slate-300">{app.trainNumber} {app.trainName || ''}</span></p>
                          )}
                          {app.stationName && (
                            <p className="text-xs text-slate-400 font-medium">Station: <span className="text-slate-300">{app.stationName}</span></p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
