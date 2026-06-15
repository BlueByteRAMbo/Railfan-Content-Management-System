import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import {
  LayoutDashboard, Video, Clock, CalendarRange, Calendar,
  ListTodo, BookMarked, BarChart3, FileInput,
  Zap, LogOut, Train, ChevronRight, AlertTriangle
} from 'lucide-react'

const navSections = [
  {
    label: 'Overview',
    items: [
      { to: '/',           icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/videos',     icon: Video,           label: 'All Videos' },
    ]
  },
  {
    label: 'Upload',
    items: [
      { to: '/queue',      icon: ListTodo,        label: 'Pending Queue' },
      { to: '/planner',    icon: CalendarRange,   label: 'Upload Planner' },
      { to: '/quick-add',  icon: Zap,             label: 'Quick Add' },
    ]
  },
  {
    label: 'Browse',
    items: [
      { to: '/timeline',   icon: Clock,           label: 'Timeline' },
      { to: '/calendar',   icon: Calendar,        label: 'Calendar' },
      { to: '/collections',icon: BookMarked,      label: 'Collections' },
    ]
  },
  {
    label: 'Insights',
    items: [
      { to: '/statistics', icon: BarChart3,       label: 'Statistics' },
      { to: '/duplicates', icon: AlertTriangle,   label: 'Duplicate Alerts' },
    ]
  },
  {
    label: 'Data',
    items: [
      { to: '/import-export', icon: FileInput,    label: 'Import / Export' },
    ]
  },
]

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="sidebar flex flex-col">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-600 to-brand-400 flex items-center justify-center shadow-glow">
            <Train size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">Railfan Archive</h1>
            <p className="text-xs text-slate-500">Manager</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                >
                  <Icon size={16} />
                  <span className="flex-1">{label}</span>
                  <ChevronRight size={12} className="opacity-0 group-hover:opacity-50 transition-opacity" />
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg glass mb-2">
          <div className="w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center text-xs font-bold text-brand-200">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{user?.username}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
