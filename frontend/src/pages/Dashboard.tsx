import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts'
import { useDashboardStats, useDashboardCharts, useRecentVideos } from '../hooks/useDashboard'
import { useNavigate } from 'react-router-dom'
import {
  Video, CheckCircle, Upload, Calendar, Archive,
  HardDrive, Clock, TrendingUp, Timer, AlertTriangle, Plus, ExternalLink
} from 'lucide-react'
import type { UploadStatus } from '../types'

// ── Helpers ───────────────────────────────────────────────────
function formatBytes(b: number): string {
  if (!b) return '0 B'
  const u = ['B','KB','MB','GB','TB'], i = Math.floor(Math.log(b)/Math.log(1024))
  return `${(b/Math.pow(1024,i)).toFixed(1)} ${u[i]}`
}
function formatDuration(s: number): string {
  if (!s) return '0m'
  const h = Math.floor(s/3600), m = Math.floor((s%3600)/60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

const CHART_COLORS = ['#6272f1','#a78bfa','#34d399','#fbbf24','#f87171','#60a5fa','#e879f9','#2dd4bf']
const STATUS_CONFIG: Record<UploadStatus, { label:string; className:string }> = {
  PENDING_UPLOAD:   { label:'Pending',   className:'status-pending'   },
  SCHEDULED_UPLOAD: { label:'Scheduled', className:'status-scheduled' },
  UPLOADED:         { label:'Uploaded',  className:'status-uploaded'  },
  ARCHIVED:         { label:'Archived',  className:'status-archived'  },
}

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({
  label, value, sub, icon: Icon, accent
}: { label:string; value:string|number; sub?:string; icon:React.ElementType; accent:string }) {
  return (
    <div className="stat-card group relative overflow-hidden">
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${accent}/5 to-transparent`} />
      <div className="relative">
        <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${accent}/20 mb-4`}>
          <Icon size={20} className={`text-${accent.split('-')[0]}-400`} />
        </div>
        <p className="text-3xl font-bold text-white tracking-tight mb-0.5">{value}</p>
        <p className="text-sm text-slate-400">{label}</p>
        {sub && <p className="text-xs text-slate-600 mt-1">{sub}</p>}
      </div>
    </div>
  )
}

function StatSkeleton() {
  return <div className="stat-card animate-pulse"><div className="w-10 h-10 rounded-xl bg-white/5 mb-4"/><div className="h-8 bg-white/5 rounded w-20 mb-2"/><div className="h-4 bg-white/5 rounded w-32"/></div>
}

// ── Custom Tooltip ────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass px-3 py-2 rounded-lg text-xs">
      <p className="text-slate-300 font-semibold mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()
  const { data: stats,   isLoading: statsLoading  } = useDashboardStats()
  const { data: charts,  isLoading: chartsLoading } = useDashboardCharts()
  const { data: recent = []                       } = useRecentVideos()

  return (
    <div className="p-8 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Your railfanning archive at a glance</p>
        </div>
        <button onClick={() => navigate('/videos/add')} className="btn-primary flex items-center gap-2">
          <Plus size={15} /> Add Video
        </button>
      </div>

      {/* ── Primary stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        {statsLoading ? Array.from({length:5}).map((_,i)=><StatSkeleton key={i}/>) : (
          <>
            <StatCard label="Total Videos"    value={stats?.totalVideos ?? 0}    icon={Video}        accent="from-brand-600" />
            <StatCard label="Uploaded"        value={stats?.uploadedVideos ?? 0}  icon={CheckCircle}  accent="from-emerald-500" />
            <StatCard label="Pending Upload"  value={stats?.pendingVideos ?? 0}   icon={Upload}       accent="from-amber-500" />
            <StatCard label="Scheduled"       value={stats?.scheduledVideos ?? 0} icon={Calendar}     accent="from-blue-500" />
            <StatCard label="Archived"        value={stats?.archivedVideos ?? 0}  icon={Archive}      accent="from-slate-500" />
          </>
        )}
      </div>

      {/* ── Secondary stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsLoading ? Array.from({length:4}).map((_,i)=><StatSkeleton key={i}/>) : (
          <>
            <StatCard label="Total Storage"         value={formatBytes(stats?.totalStorageBytes ?? 0)}       icon={HardDrive}   accent="from-purple-500" />
            <StatCard label="Total Recorded"        value={formatDuration(stats?.totalDurationSeconds ?? 0)} icon={Clock}       accent="from-pink-500" />
            <StatCard label="Recorded This Month"   value={stats?.videosRecordedThisMonth ?? 0}              icon={TrendingUp}  accent="from-cyan-500" sub="new recordings" />
            <StatCard label="Uploaded This Month"   value={stats?.videosUploadedThisMonth ?? 0}              icon={Timer}       accent="from-orange-500" sub="new uploads" />
          </>
        )}
      </div>

      {/* ── Alert banner ── */}
      {stats && stats.unresolvedDuplicates > 0 && (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-8">
          <AlertTriangle size={20} className="text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-300 flex-1">
            <strong>{stats.unresolvedDuplicates}</strong> unresolved duplicate alert{stats.unresolvedDuplicates > 1 ? 's' : ''} need review
          </p>
        </div>
      )}

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Recordings per month */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-5">📹 Recordings Per Month</h3>
          {chartsLoading ? (
            <div className="h-48 bg-white/3 rounded-lg animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={charts?.recordingsPerMonth ?? []}>
                <defs>
                  <linearGradient id="recGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6272f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6272f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="label" tick={{ fill:'#64748b', fontSize:11 }} />
                <YAxis tick={{ fill:'#64748b', fontSize:11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" name="Recordings" stroke="#6272f1" fill="url(#recGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Uploads per month */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-5">🚀 Uploads Per Month</h3>
          {chartsLoading ? (
            <div className="h-48 bg-white/3 rounded-lg animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={charts?.uploadsPerMonth ?? []}>
                <defs>
                  <linearGradient id="uplGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#34d399" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="label" tick={{ fill:'#64748b', fontSize:11 }} />
                <YAxis tick={{ fill:'#64748b', fontSize:11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" name="Uploads" stroke="#34d399" fill="url(#uplGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Loco type distribution */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-5">🚂 Loco Type Distribution</h3>
          {chartsLoading ? (
            <div className="h-48 bg-white/3 rounded-lg animate-pulse" />
          ) : (charts?.locoTypeDistribution?.length ?? 0) === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-600 text-sm">
              No data yet — add some videos to see distribution
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={charts?.locoTypeDistribution ?? []}
                  dataKey="count"
                  nameKey="name"
                  cx="50%" cy="50%"
                  outerRadius={75}
                  label={({ name, percent }) => `${name} ${((percent ?? 0)*100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {(charts?.locoTypeDistribution ?? []).map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Train category distribution */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-5">🏷️ Train Category Distribution</h3>
          {chartsLoading ? (
            <div className="h-48 bg-white/3 rounded-lg animate-pulse" />
          ) : (charts?.trainCategoryDistribution?.length ?? 0) === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-600 text-sm">
              No data yet — add some videos to see distribution
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={charts?.trainCategoryDistribution ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fill:'#64748b', fontSize:10 }} />
                <YAxis tick={{ fill:'#64748b', fontSize:11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Videos" fill="#a78bfa" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Recent Videos ── */}
      {recent.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <h3 className="text-sm font-semibold text-slate-300">Recently Added</h3>
            <button onClick={() => navigate('/videos')} className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
              View all <ExternalLink size={11} />
            </button>
          </div>
          <div className="divide-y divide-white/4">
            {recent.slice(0, 5).map(v => (
              <div
                key={v.id}
                onClick={() => navigate(`/videos/${v.id}`)}
                className="flex items-center gap-4 px-6 py-3.5 hover:bg-white/2 cursor-pointer transition-colors"
              >
                {v.thumbnail ? (
                  <img src={v.thumbnail.startsWith('http') ? v.thumbnail : `data:image/jpeg;base64,${v.thumbnail}`} alt="" className="w-14 h-9 rounded object-cover bg-slate-800 flex-shrink-0" />
                ) : (
                  <div className="w-14 h-9 rounded bg-slate-800 flex-shrink-0 flex items-center justify-center">
                    <Video size={14} className="text-slate-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{v.title}</p>
                  <p className="text-xs text-slate-500">{v.recordingDate} · {v.trainName ?? v.trainNumber ?? '—'}</p>
                </div>
                <span className={`status-badge ${STATUS_CONFIG[v.uploadStatus]?.className}`}>
                  {STATUS_CONFIG[v.uploadStatus]?.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
