import { useQuery } from '@tanstack/react-query'
import { statsApi } from '../api/services'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Train, MapPin, Building, Activity } from 'lucide-react'
import { motion } from 'framer-motion'
import { staggerContainer, fadeUp } from '../lib/motion'

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
  
  const { data: trains = [] } = useQuery({ queryKey: ['stats', 'trains'], queryFn: () => statsApi.getMostRecordedTrains(5).then(r => r.data) })
  const { data: locos = [] } = useQuery({ queryKey: ['stats', 'locos'], queryFn: () => statsApi.getMostRecordedLocos(5).then(r => r.data) })
  const { data: sheds = [] } = useQuery({ queryKey: ['stats', 'sheds'], queryFn: () => statsApi.getMostRecordedSheds(5).then(r => r.data) })
  const { data: stations = [] } = useQuery({ queryKey: ['stats', 'stations'], queryFn: () => statsApi.getMostRecordedStations(5).then(r => r.data) })

  return (
    <div className="max-w-6xl mx-auto p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Deep Statistics</h1>
        <p className="text-slate-500 text-sm mt-1">Advanced analytics on your railfan activity</p>
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
            Top 5 Most Recorded Trains
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trains} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradTrains" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.6}/>
                    <stop offset="100%" stopColor="#60a5fa" stopOpacity={1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={120} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="count" fill="url(#gradTrains)" radius={[0, 4, 4, 0]} barSize={24} isAnimationActive={true} animationDuration={1000} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Locos */}
        <motion.div variants={fadeUp} className="glass-card p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
            <Activity size={18} className="text-amber-400" />
            Top 5 Most Recorded Locomotives
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locos} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradLocos" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.6}/>
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity={1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={120} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="count" fill="url(#gradLocos)" radius={[0, 4, 4, 0]} barSize={24} isAnimationActive={true} animationDuration={1000} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Sheds */}
        <motion.div variants={fadeUp} className="glass-card p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
            <Building size={18} className="text-emerald-400" />
            Top 5 Most Recorded Sheds
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sheds} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradSheds" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.6}/>
                    <stop offset="100%" stopColor="#34d399" stopOpacity={1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={120} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="count" fill="url(#gradSheds)" radius={[0, 4, 4, 0]} barSize={24} isAnimationActive={true} animationDuration={1000} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Stations */}
        <motion.div variants={fadeUp} className="glass-card p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
            <MapPin size={18} className="text-purple-400" />
            Top 5 Most Recorded Stations
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stations} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradStations" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity={0.6}/>
                    <stop offset="100%" stopColor="#c084fc" stopOpacity={1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={120} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="count" fill="url(#gradStations)" radius={[0, 4, 4, 0]} barSize={24} isAnimationActive={true} animationDuration={1000} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </motion.div>
    </div>
  )
}
