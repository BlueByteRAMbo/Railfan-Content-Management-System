import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts'
import { motion, useSpring, useTransform } from 'framer-motion'
import { useEffect } from 'react'
import { staggerContainer, fadeUp } from '../lib/motion'
import { useDashboardStats, useDashboardCharts, useRecentVideos } from '../hooks/useDashboard'
import { useNavigate } from 'react-router-dom'
import {
  Video, CheckCircle, Upload, Calendar, Archive,
  HardDrive, Clock, TrendingUp, Timer, AlertTriangle, Plus, ExternalLink
} from 'lucide-react'
import SignalLoader from '../components/ui/SignalLoader'

// ── Helpers ───────────────────────────────────────────────────
function formatBytes(b: number): string {
  if (!b) return '0 B'
  const u = ['B', 'KB', 'MB', 'GB', 'TB'], i = Math.floor(Math.log(b) / Math.log(1024))
  return `${(b / Math.pow(1024, i)).toFixed(1)} ${u[i]}`
}
function formatDuration(s: number): string {
  if (!s) return '0m'
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

const CHART_COLORS = [
  '#C98A2C',  // signal amber   — brand primary
  '#5C8A4A',  // moss green     — uploaded/safe
  '#3E7C8C',  // slate teal     — scheduled/planned
  '#B23A2E',  // signal red     — danger/alert
  '#8A7E72',  // warm grey      — archived/neutral
  '#7A6E5A',  // dark khaki     — secondary neutral
]
import type { UploadStatus } from '../types';

const STATUS_CONFIG: Record<UploadStatus, { label: string; className: string }> = {
  PENDING_UPLOAD: { label: 'Pending', className: 'status-pending' },
  SCHEDULED_UPLOAD: { label: 'Scheduled', className: 'status-scheduled' },
  UPLOADED: { label: 'Uploaded', className: 'status-uploaded' },
  ARCHIVED: { label: 'Archived', className: 'status-archived' },
}

// ── Animated Counter ──────────────────────────────────────────
function AnimatedCounter({ value }: { value: number }) {
  const spring = useSpring(0, { bounce: 0, duration: 1500 });
  const display = useTransform(spring, (current) => Math.floor(current));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
}

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({
  label, value, sub, icon: Icon, accent
}: { label: string; value: string | number; sub?: string; icon: React.ElementType; accent: string }) {
  return (
    <motion.div variants={fadeUp} whileHover={{ y: -4 }} className="glass-card group relative overflow-hidden p-4 sm:p-6">
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${accent}/5 to-transparent`} />
      <div className="relative">
        <div className={`inline-flex p-2 rounded-xl bg-gradient-to-br ${accent}/20 mb-3 sm:mb-4`}>
          <Icon size={18} className={`text-${accent.split('-')[0]}-400 sm:w-5 sm:h-5`} />
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-0.5">
          {typeof value === 'number' ? <AnimatedCounter value={value} /> : value}
        </p>
        <p className="text-xs sm:text-sm text-slate-400">{label}</p>
        {sub && <p className="text-[10px] sm:text-xs text-slate-600 mt-1">{sub}</p>}
      </div>
    </motion.div>
  )
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
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: charts, isLoading: chartsLoading } = useDashboardCharts()
  const { data: recent = [] } = useRecentVideos()

  return (
    <div className="p-4 md:p-8 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Your railfanning archive at a glance</p>
        </div>
        <button onClick={() => navigate('/videos/add')} className="btn-primary flex items-center gap-2">
          <Plus size={15} /> Add Video
        </button>
      </div>

      {/* ── Primary stat cards ── */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4 mb-6"
      >
        {statsLoading ? (
          <div className="col-span-full flex justify-center py-12 scale-75">
            <SignalLoader message="LOADING STATS..." />
          </div>
        ) : (
          <>
            <StatCard label="Total Videos" value={stats?.totalVideos ?? 0} icon={Video} accent="from-brand-600" />
            <StatCard label="Uploaded" value={stats?.uploadedVideos ?? 0} icon={CheckCircle} accent="from-emerald-500" />
            <StatCard label="Pending Upload" value={stats?.pendingVideos ?? 0} icon={Upload} accent="from-amber-500" />
            <StatCard label="Scheduled" value={stats?.scheduledVideos ?? 0} icon={Calendar} accent="from-blue-500" />
            <StatCard label="Archived" value={stats?.archivedVideos ?? 0} icon={Archive} accent="from-slate-500" />
          </>
        )}
      </motion.div>

      {/* ── Secondary stat cards ── */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8"
      >
        {statsLoading ? (
          <div className="col-span-full flex justify-center py-12 scale-75">
            <SignalLoader message="LOADING MORE STATS..." />
          </div>
        ) : (
          <>
            <StatCard label="Total Storage" value={formatBytes(stats?.totalStorageBytes ?? 0)} icon={HardDrive} accent="from-purple-500" />
            <StatCard label="Total Recorded" value={formatDuration(stats?.totalDurationSeconds ?? 0)} icon={Clock} accent="from-pink-500" />
            <StatCard label="Recorded This Month" value={stats?.videosRecordedThisMonth ?? 0} icon={TrendingUp} accent="from-cyan-500" sub="new recordings" />
            <StatCard label="Pending Action" value={(stats?.pendingVideos ?? 0) + (stats?.scheduledVideos ?? 0)} icon={Timer} accent="from-rose-500" sub="uploads left" />
          </>
        )
        }
      </motion.div>

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
                    <stop offset="5%" stopColor="#d98e04" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#d98e04" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" name="Recordings" stroke="#d98e04" fill="url(#recGrad)" strokeWidth={2} />
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
                    <stop offset="5%" stopColor="#3E7C8C" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3E7C8C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" name="Uploads" stroke="#3E7C8C" fill="url(#uplGrad)" strokeWidth={2} />
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
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
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
                <defs>
                  <linearGradient id="gradCat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e29737" stopOpacity={1} />
                    <stop offset="100%" stopColor="#a15606" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="count" name="Videos" fill="url(#gradCat)" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={1000} />
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
