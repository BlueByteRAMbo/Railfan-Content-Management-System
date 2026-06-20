import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import {
  LayoutDashboard, Video, Clock, CalendarRange, Calendar,
  ListTodo, BookMarked, BarChart3, FileInput,
  Zap, LogOut, ChevronRight, AlertTriangle, Menu, Sparkles, Train, Map
} from 'lucide-react'

const navSections = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/videos',     icon: Video,           label: 'All Videos' },
      { to: '/map',        icon: Map,             label: 'Spotter Map' },
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
      { to: '/train-tracker', icon: Sparkles,     label: 'Train Tracker' },
      { to: '/locos',      icon: Train,           label: 'Loco Logbook' },
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

export default function Sidebar({ 
  isCollapsed, 
  toggleCollapse, 
  isMobileOpen, 
  closeMobile 
}: { 
  isCollapsed: boolean; 
  toggleCollapse: () => void;
  isMobileOpen: boolean;
  closeMobile: () => void;
}) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside 
      className={`sidebar flex flex-col transition-all duration-300 z-50 fixed top-0 bottom-0 left-0 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
      style={{ width: isCollapsed ? '80px' : 'var(--sidebar-width)' }}
    >
      {/* Logo & Toggle */}
      <div className="px-5 py-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="min-w-[36px] min-h-[36px] flex items-center justify-center">
            <img src="/RF_Logo.png" alt="Railfan Archive" className="w-9 h-9 object-contain rounded-lg"/>
          </div>
          {!isCollapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">
              <h1 className="text-sm font-bold text-white leading-tight">Railfan Archive</h1>
              <p className="text-xs text-slate-500">Manager</p>
            </motion.div>
          )}
        </div>
        {!isCollapsed && (
          <button onClick={toggleCollapse} className="text-slate-400 hover:text-white transition-colors">
            <Menu size={18} />
          </button>
        )}
      </div>

      {/* Collapse button when collapsed */}
      {isCollapsed && (
        <div className="flex justify-center py-4 border-b border-white/5">
          <button onClick={toggleCollapse} className="text-slate-400 hover:text-white transition-colors">
            <Menu size={18} />
          </button>
        </div>
      )}

      {/* Global Search */}
      {!isCollapsed && (
        <div className="px-4 py-2 mt-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const q = (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value;
              if (q.trim()) {
                navigate(`/videos?q=${encodeURIComponent(q.trim())}`);
              }
            }}
            className="relative"
          >
            <input
              type="text"
              name="q"
              placeholder="Search archive..."
              className="w-full bg-white/5 border border-white/10 rounded-lg py-1.5 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500/50 transition-colors"
            />
            <span className="absolute left-3 top-2.5 text-slate-500 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
          </form>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
        {navSections.map((section) => (
          <div key={section.label}>
            {!isCollapsed && (
              <p className="px-3 mb-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5 relative">
              {section.items.map(({ to, icon: Icon, label }) => {
                const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
                return (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={closeMobile}
                    className={`sidebar-link relative overflow-hidden group ${isActive ? 'text-brand-300' : ''}`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNavPill"
                      className="absolute inset-0 bg-[#C98A2C]/15 border border-[#C98A2C]/25 rounded-lg z-0"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <div className={`relative z-10 flex items-center gap-3 w-full ${isCollapsed ? 'justify-center' : ''}`}>
                      <Icon size={16} className={isCollapsed ? 'min-w-[16px]' : ''} />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 whitespace-nowrap">{label}</span>
                          <ChevronRight size={12} className="opacity-0 group-hover:opacity-50 transition-opacity" />
                        </>
                      )}
                    </div>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className={`px-3 py-4 border-t border-white/5 ${isCollapsed ? 'flex justify-center' : 'flex items-center justify-between'}`}>
        {!isCollapsed && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full flex items-center justify-center border"
                 style={{ background: 'rgba(58,46,26,0.5)', borderColor: 'rgba(201,138,44,0.25)' }}>
              <span className="text-xs font-bold" style={{ color: '#C98A2C' }}>
                {user?.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-200 truncate max-w-[120px]">
                {user?.username}
              </span>
              <span className="text-xs text-slate-500">Admin</span>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
          title="Logout"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  )
}
