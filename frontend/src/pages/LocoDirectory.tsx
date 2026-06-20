import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { locosApi } from '../api/services'
import { Search, Hash, Train, Calendar, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function LocoDirectory() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

  const { data: locos = [], isLoading } = useQuery({
    queryKey: ['locos', 'summary'],
    queryFn: () => locosApi.getAll().then(r => r.data)
  })

  const filtered = locos.filter(l => 
    l.locoNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto p-8 animate-fade-in pb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Train className="text-brand-400" />
            Locomotive Logbook
          </h1>
          <p className="text-slate-500 text-sm mt-1">Track every locomotive you've captured across the network</p>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search loco number..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-brand-500/50 transition-colors w-full md:w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(loco => (
          <div 
            key={loco.locoNumber} 
            onClick={() => navigate(`/locos/${loco.locoNumber}`)}
            className="p-5 rounded-xl bg-white/5 border border-white/5 hover:border-brand-500/50 cursor-pointer transition-colors group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 text-brand-400 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">
              <Train size={64} />
            </div>
            
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-2xl font-black text-slate-200 tracking-tight group-hover:text-brand-400 transition-colors">
                {loco.locoNumber}
              </h3>
              {loco.count >= 10 && (
                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                  <TrendingUp size={10} /> Frequent
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Hash size={14} className="text-slate-500" />
                <p className="text-sm font-medium text-slate-300">
                  Spotted <span className="text-brand-400 font-bold">{loco.count}</span> {loco.count === 1 ? 'time' : 'times'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-emerald-500" />
                <p className="text-xs text-slate-500">
                  First: <span className="text-slate-300">{loco.firstSeen || 'Unknown'}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-pink-500" />
                <p className="text-xs text-slate-500">
                  Latest: <span className="text-slate-300">{loco.lastSeen || 'Unknown'}</span>
                </p>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && !isLoading && (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white/5 rounded-xl border border-white/5">
            No locomotives found matching your search.
          </div>
        )}
      </div>
    </div>
  )
}
