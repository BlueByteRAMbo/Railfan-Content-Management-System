import type { ReactNode } from 'react'
import Sidebar from './Sidebar'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-[#0f0f1a]">
      <Sidebar />
      <main className="main-content flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
