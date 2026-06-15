import { useQuery } from '@tanstack/react-query'
import { statsApi } from '../api/services'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Train, MapPin, Building, Activity } from 'lucide-react'

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Trains */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
            <Train size={18} className="text-brand-400" />
            Top 5 Most Recorded Trains
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trains} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={120} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#ffffff05' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Locos */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
            <Activity size={18} className="text-amber-400" />
            Top 5 Most Recorded Locomotives
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locos} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={120} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#ffffff05' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sheds */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
            <Building size={18} className="text-emerald-400" />
            Top 5 Most Recorded Sheds
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sheds} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={120} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#ffffff05' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stations */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
            <MapPin size={18} className="text-purple-400" />
            Top 5 Most Recorded Stations
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stations} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={120} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#ffffff05' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#a855f7" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  )
}
