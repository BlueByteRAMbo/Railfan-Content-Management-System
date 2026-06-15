import { useState } from 'react'
import type { ReactNode } from 'react'
import Sidebar from './Sidebar'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-transparent">
      <Sidebar isCollapsed={isCollapsed} toggleCollapse={() => setIsCollapsed(!isCollapsed)} />
      <main 
        className="main-content flex-1 overflow-auto transition-all duration-300"
        style={{ marginLeft: isCollapsed ? '80px' : 'var(--sidebar-width)' }}
      >
        {children}
      </main>
    </div>
  )
}
