import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { trainsApi } from '../api/services'
import { Train, Calendar, MapPin, AlertCircle, Sparkles, Search, ArrowRight } from 'lucide-react'
import SignalLoader from '../components/ui/SignalLoader'
import { Link } from 'react-router-dom'

export default function TrainRunTracker() {
  const [searchInput, setSearchInput] = useState('')
  const [trainNumber, setTrainNumber] = useState('')

  const { data: history = [], isLoading, isError } = useQuery({
    queryKey: ['train-history', trainNumber],
    queryFn: () => trainsApi.getHistory(trainNumber).then(r => r.data),
    enabled: !!trainNumber
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      setTrainNumber(searchInput.trim())
    }
  }

  // Calculate some stats from the run history
  const totalRuns = history.length
  const totalSwapDays = history.filter(h => h.locoChanged).length

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Train className="text-brand-400" />
          Train Run Tracker
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Track and analyze the physical runs of specific trains across your archive.
        </p>
      </div>

      {/* Train Number Search Bar */}
      <div className="glass-card p-6 mb-8">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter Train Number (e.g. 12951, 12002...)"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500/50 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="btn-primary px-6 flex items-center gap-2 text-sm font-semibold"
          >
            Track Runs
          </button>
        </form>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="py-16">
          <SignalLoader message={`TRACKING TRAIN ${trainNumber}...`} />
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="glass-card p-6 border-red-500/20 text-center">
          <AlertCircle className="mx-auto text-red-400 mb-2" size={32} />
          <h3 className="text-lg font-bold text-white">Tracking Failed</h3>
          <p className="text-slate-400 text-sm mt-1">Could not load run history for train {trainNumber}. Please try again.</p>
        </div>
      )}

      {/* Empty / Initial State */}
      {!trainNumber && !isLoading && (
        <div className="glass-card p-12 text-center border-dashed border-white/10">
          <Train className="mx-auto text-slate-600 mb-4 animate-pulse" size={48} />
          <h3 className="text-lg font-semibold text-slate-400">No Train Selected</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
            Type in a train number above to track physical runs, stations filmed, and automatically detect rare locomotive swaps.
          </p>
        </div>
      )}

      {/* Results */}
      {trainNumber && !isLoading && !isError && (
        <div>
          {history.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <p className="text-slate-400">No recordings found for Train #{trainNumber}.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Quick stats panel */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Filming Dates</p>
                    <p className="text-lg font-bold text-white">{totalRuns}</p>
                  </div>
                </div>
                <div className="glass-card p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Loco Swaps Detected</p>
                    <p className="text-lg font-bold text-white">{totalSwapDays}</p>
                  </div>
                </div>
              </div>

              {/* History Timeline */}
              <div className="relative border-l border-white/5 ml-4 pl-6 space-y-8">
                {history.map((run, runIdx) => (
                  <div key={run.date} className="relative group">
                    {/* Timeline node icon */}
                    <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-brand-500 shadow-[0_0_8px_rgba(217,142,4,0.5)] transition-all group-hover:scale-125" />

                    {/* Date Card Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white bg-white/5 px-3 py-1 rounded-lg">
                          {run.date}
                        </span>
                        {run.locoChanged && (
                          <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
                            <Sparkles size={10} /> Notable Loco Swap
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Appearances list for the date */}
                    <div className="grid grid-cols-1 gap-3">
                      {run.appearances.map((app, appIdx) => (
                        <div key={appIdx} className="glass-card p-4 hover:border-white/10 transition-colors">
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                              <Link
                                to={`/videos/${app.videoId}`}
                                className="font-semibold text-slate-200 hover:text-brand-400 transition-colors flex items-center gap-1.5"
                              >
                                {app.videoTitle}
                                <ArrowRight size={12} className="inline opacity-55" />
                              </Link>
                              
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-xs text-slate-400">
                                {app.recordingTime && (
                                  <span className="text-slate-500">Filmed at {app.recordingTime}</span>
                                )}
                                {app.stationName && (
                                  <span className="flex items-center gap-1 text-pink-400/80">
                                    <MapPin size={11} /> {app.stationName}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Loco badge */}
                            {(app.locoNumber || app.locoTypeName) && (
                              <div className="text-right bg-white/3 rounded-lg px-3 py-1.5 border border-white/5">
                                <p className="text-[10px] text-slate-500 uppercase tracking-wide">Locomotive</p>
                                <p className="text-xs font-mono font-bold text-brand-300">
                                  {app.locoTypeName && `${app.locoTypeName} `}#{app.locoNumber || '—'}
                                </p>
                                {app.locoShedName && (
                                  <p className="text-[9px] text-slate-400 mt-0.5">{app.locoShedName} Shed</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
