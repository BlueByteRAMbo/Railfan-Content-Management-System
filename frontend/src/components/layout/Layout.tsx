import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Menu, Plus } from 'lucide-react'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import Footer from '../ui/Footer'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false)
  }, [location.pathname])

  return (
    <div className="flex min-h-screen bg-transparent relative">
      
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-[#16161a]/95 backdrop-blur-md border-b border-white/5 z-30 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setIsMobileOpen(true)} className="text-slate-400 hover:text-white p-1">
            <Menu size={20} />
          </button>
          <img src="/RF_Logo.png" alt="" className="w-6 h-6 object-contain rounded"/>
          <span className="font-bold text-white text-sm">Railfan Archive</span>
        </div>
        <button onClick={() => navigate('/videos/add')} className="text-brand-400 p-1">
          <Plus size={20} />
        </button>
      </div>

      {/* Sidebar with Desktop & Mobile props */}
      <Sidebar 
        isCollapsed={isCollapsed} 
        toggleCollapse={() => setIsCollapsed(!isCollapsed)} 
        isMobileOpen={isMobileOpen}
        closeMobile={() => setIsMobileOpen(false)}
      />

      {/* Mobile Sidebar Backdrop */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main 
        className={`flex-1 flex flex-col overflow-auto transition-all duration-300 pt-14 lg:pt-0 pb-16 md:pb-0 ${isCollapsed ? 'lg:ml-[80px]' : 'lg:ml-[var(--sidebar-width)]'} ml-0`}
      >
        <div className="flex-1">
          {children}
        </div>
        <Footer />
      </main>

      <BottomNav />
    </div>
  )
}
