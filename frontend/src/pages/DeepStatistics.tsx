import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { statsApi } from '../api/services'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Train, MapPin, Building, Activity, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import { staggerContainer, fadeUp } from '../lib/motion'
import SignalLoader from '../components/ui/SignalLoader'

// ── Custom Tooltip ────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass px-3 py-2 rounded-lg text-xs">
      <p className="text-slate-300 font-semibold mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color || p.fill }}>{p.name || 'Count'}: <strong>{p.value}</strong></p>
      ))}
    </div>
  )
}

export default function DeepStatistics() {
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [limit, setLimit] = useState<number>(5)
  
  const { data: trainsData = [], isLoading: trainsLoading } = useQuery({
    queryKey: ['stats', 'trains', limit, startDate, endDate],
    queryFn: () => statsApi.getMostRecordedTrains(limit, startDate || undefined, endDate || undefined).then(r => r.data)
  })
  const { data: locosData = [], isLoading: locosLoading } = useQuery({
    queryKey: ['stats', 'locos', limit, startDate, endDate],
    queryFn: () => statsApi.getMostRecordedLocos(limit, startDate || undefined, endDate || undefined).then(r => r.data)
  })
  const { data: shedsData = [], isLoading: shedsLoading } = useQuery({
    queryKey: ['stats', 'sheds', limit, startDate, endDate],
    queryFn: () => statsApi.getMostRecordedSheds(limit, startDate || undefined, endDate || undefined).then(r => r.data)
  })
  const { data: stationsData = [], isLoading: stationsLoading } = useQuery({
    queryKey: ['stats', 'stations', limit, startDate, endDate],
    queryFn: () => statsApi.getMostRecordedStations(limit, startDate || undefined, endDate || undefined).then(r => r.data)
  })
  const { data: zonesData = [], isLoading: zonesLoading } = useQuery({
    queryKey: ['stats', 'zones', limit, startDate, endDate],
    queryFn: () => statsApi.getMostRecordedZones(limit, startDate || undefined, endDate || undefined).then(r => r.data)
  })

  const trains = trainsData.filter((d: any) => d.name && d.name.trim() !== '')
  const locos = locosData.filter((d: any) => d.name && d.name.trim() !== '')
  const sheds = shedsData.filter((d: any) => d.name && d.name.trim() !== '')
  const stations = stationsData.filter((d: any) => d.name && d.name.trim() !== '')
  const zones = zonesData.filter((d: any) => d.name && d.name.trim() !== '')

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Deep Statistics</h1>
        <p className="text-slate-500 text-sm mt-1">Advanced analytics on your railfan activity</p>
      </div>

      {/* Date Range Picker */}
      <div className="flex flex-wrap items-center gap-4 bg-white/5 border border-white/5 rounded-xl p-4 mb-8">
        <div className="flex items-center gap-2 text-slate-400">
          <Calendar size={15} />
          <span className="text-xs font-semibold uppercase tracking-wide">Filter by recording date:</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500">From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="form-input text-xs py-1.5 w-36"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500">To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="form-input text-xs py-1.5 w-36"
          />
        </div>
        <div className="flex items-center gap-2 border-l border-white/10 pl-4 ml-2">
          <label className="text-xs text-slate-500">Show Top</label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="form-input text-xs py-1.5 w-16 px-2 bg-transparent"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
          </select>
        </div>
        {(startDate || endDate || limit !== 5) && (
          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
              setLimit(5);
            }}
            className="text-xs text-brand-400 hover:text-brand-300 transition-colors font-medium ml-auto"
          >
            Clear Filters
          </button>
        )}
      </div>

      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        
        {/* Trains */}
        <motion.div variants={fadeUp} className="glass-card p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
            <Train size={18} className="text-brand-400" />
            Top {limit} Most Recorded Trains
          </h2>
          <div className="h-64 relative">
            {trainsLoading ? (
              <div className="absolute inset-0 flex items-center justify-center scale-75">
                <SignalLoader message="LOADING TRAINS..." />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trains} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradTrains" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#c27303" stopOpacity={0.6}/>
                      <stop offset="100%" stopColor="#d98e04" stopOpacity={1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={120} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Bar dataKey="count" fill="url(#gradTrains)" radius={[0, 4, 4, 0]} barSize={24} isAnimationActive={true} animationDuration={1000} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Locos */}
        <motion.div variants={fadeUp} className="glass-card p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
            <Activity size={18} className="text-amber-400" />
            Top {limit} Most Recorded Loco Types
          </h2>
          <div className="h-64 relative">
            {locosLoading ? (
              <div className="absolute inset-0 flex items-center justify-center scale-75">
                <SignalLoader message="LOADING LOCOS..." />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locos} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradLocos" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#8A7E72" stopOpacity={0.6}/>
                      <stop offset="100%" stopColor="#C98A2C" stopOpacity={1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={120} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Bar dataKey="count" fill="url(#gradLocos)" radius={[0, 4, 4, 0]} barSize={24} isAnimationActive={true} animationDuration={1000} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Sheds */}
        <motion.div variants={fadeUp} className="glass-card p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
            <Building size={18} className="text-[#3E7C8C]" />
            Top {limit} Most Recorded Sheds
          </h2>
          <div className="h-64 relative">
            {shedsLoading ? (
              <div className="absolute inset-0 flex items-center justify-center scale-75">
                <SignalLoader message="LOADING SHEDS..." />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sheds} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradSheds" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#2c5f6e" stopOpacity={0.6}/>
                      <stop offset="100%" stopColor="#3E7C8C" stopOpacity={1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={120} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Bar dataKey="count" fill="url(#gradSheds)" radius={[0, 4, 4, 0]} barSize={24} isAnimationActive={true} animationDuration={1000} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Stations */}
        <motion.div variants={fadeUp} className="glass-card p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
            <MapPin size={18} className="text-[#5C8A4A]" />
            Top {limit} Most Recorded Stations
          </h2>
          <div className="h-64 relative">
            {stationsLoading ? (
              <div className="absolute inset-0 flex items-center justify-center scale-75">
                <SignalLoader message="LOADING STATIONS..." />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stations} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradStations" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#476e38" stopOpacity={0.6}/>
                      <stop offset="100%" stopColor="#5C8A4A" stopOpacity={1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={120} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Bar dataKey="count" fill="url(#gradStations)" radius={[0, 4, 4, 0]} barSize={24} isAnimationActive={true} animationDuration={1000} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Zones */}
        <motion.div variants={fadeUp} className="glass-card p-6 md:col-span-2 lg:col-span-1">
          <h2 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
            <Building size={18} className="text-brand-400" />
            Top {limit} Most Visited Zones
          </h2>
          <div className="h-64 relative">
            {zonesLoading ? (
              <div className="absolute inset-0 flex items-center justify-center scale-75">
                <SignalLoader message="LOADING ZONES..." />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={zones} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradZones" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.6}/>
                      <stop offset="100%" stopColor="#0d9488" stopOpacity={1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={120} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Bar dataKey="count" fill="url(#gradZones)" radius={[0, 4, 4, 0]} barSize={24} isAnimationActive={true} animationDuration={1000} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

      </motion.div>
    </div>
  )
}
