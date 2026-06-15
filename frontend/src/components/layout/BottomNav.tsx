import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Video, Zap, ListTodo, BarChart3 } from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dash' },
  { to: '/videos', icon: Video, label: 'Videos' },
  { to: '/quick-add', icon: Zap, label: 'Quick Add' },
  { to: '/queue', icon: ListTodo, label: 'Queue' },
  { to: '/statistics', icon: BarChart3, label: 'Stats' }
]

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#16161a]/95 backdrop-blur-lg border-t border-white/10 z-40 flex items-center justify-around px-2 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${
              isActive ? 'text-brand-400' : 'text-slate-500 hover:text-slate-300'
            }`
          }
        >
          <Icon size={20} />
          <span className="text-[10px] font-medium leading-none">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
