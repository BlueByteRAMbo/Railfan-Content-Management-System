import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { locosApi } from '../api/services'
import { ArrowLeft, Film, Clock, Navigation, Zap, Calendar as CalendarIcon, Hash, MapPin, Train, Award } from 'lucide-react'
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

  const uniqueTrains = new Set(history.flatMap(h => h.appearances.map((a: any) => a.trainNumber).filter(Boolean))).size
  const uniqueStations = new Set(history.flatMap(h => h.appearances.map((a: any) => a.stationName).filter(Boolean))).size
  
  const dates = history.map(h => new Date(h.date)).sort((a, b) => a.getTime() - b.getTime())
  const firstDateStr = dates[0] ? dates[0].toISOString().split('T')[0] : 'N/A'
  const lastDateStr = dates[dates.length - 1] ? dates[dates.length - 1].toISOString().split('T')[0] : 'N/A'
  const dateSpan = firstDateStr === lastDateStr ? firstDateStr : `${firstDateStr} to ${lastDateStr}`

  let topMilestone = null
  if (totalEncounters >= 100) topMilestone = "Centurion"
  else if (totalEncounters >= 50) topMilestone = "50+ Club"
  else if (totalEncounters >= 25) topMilestone = "25+ Encounters"
  else if (totalEncounters >= 10) topMilestone = "Frequent (10+)"

  let runningCount = totalEncounters;
  const historyWithMilestones = history.map(day => {
    const appearancesWithMilestones = day.appearances.map((app: any) => {
      const currentCount = runningCount--;
      let milestone = null;
      if (currentCount === 1) milestone = "First Capture"
      else if (currentCount === 10) milestone = "10th Encounter"
      else if (currentCount === 25) milestone = "25th Encounter"
      else if (currentCount === 50) milestone = "50th Encounter"
      else if (currentCount === 100) milestone = "100th Encounter"
      return { ...app, currentCount, milestone };
    });
    return { ...day, appearances: appearancesWithMilestones };
  });

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in pb-32">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/locos')} className="btn-secondary p-2">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            Loco <span className="text-brand-400">{number}</span>
            {topMilestone && (
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1.5 ml-2">
                <Award size={14} /> {topMilestone}
              </span>
            )}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-5">
          <Train size={18} className="text-blue-400 mb-2" />
          <p className="text-xs text-slate-500 uppercase tracking-wide">Unique Trains</p>
          <p className="text-xl font-bold text-white mt-1">{uniqueTrains}</p>
        </div>
        <div className="glass-card p-5">
          <MapPin size={18} className="text-amber-400 mb-2" />
          <p className="text-xs text-slate-500 uppercase tracking-wide">Unique Stations</p>
          <p className="text-xl font-bold text-white mt-1">{uniqueStations}</p>
        </div>
        <div className="glass-card p-5">
          <CalendarIcon size={18} className="text-purple-400 mb-2" />
          <p className="text-xs text-slate-500 uppercase tracking-wide">Date Span</p>
          <p className="text-[13px] font-bold text-white mt-2 leading-tight">{dateSpan}</p>
        </div>
      </div>

      <div className="glass-card p-8">
        <h2 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
          <Clock className="text-brand-400" /> Encounter Timeline
        </h2>
        
        <div className="relative border-l-2 border-white/10 ml-4 md:ml-6 space-y-12">
          {historyWithMilestones.map((day) => (
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
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {day.appearances.map((app: any) => (
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
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-200 truncate group-hover:text-brand-400 transition-colors">
                              {app.videoTitle}
                            </h4>
                            {app.milestone && (
                              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                                🌟 {app.milestone}
                              </span>
                            )}
                          </div>
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
