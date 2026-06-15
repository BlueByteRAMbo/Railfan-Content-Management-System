import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Train, Shield, Database, BarChart3, CloudLightning, ArrowRight } from 'lucide-react'

// Realistic Track & Signal background (similar to LoginPage but more expansive)
const LandingBackground = () => (
  <div className="absolute inset-0 z-0 overflow-hidden bg-[#16161a]">
    <svg className="absolute inset-0 w-full h-full object-cover opacity-30" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1000 600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id='gridGlow' cx='50%' cy='50%' r='50%'>
          <stop offset='0%' stopColor='#d98e04' stopOpacity='0.2'/>
          <stop offset='100%' stopColor='#16161a' stopOpacity='0'/>
        </radialGradient>
      </defs>
      {/* Horizon glow */}
      <rect x='0' y='0' width='1000' height='600' fill='url(#gridGlow)' />
      {/* Grid */}
      <path d="M 0 300 L 1000 300" stroke="#333" strokeWidth="1" />
      <path d="M 0 400 L 1000 400" stroke="#333" strokeWidth="1" />
      <path d="M 0 500 L 1000 500" stroke="#333" strokeWidth="1" />
      <path d="M 500 0 L 500 600" stroke="#333" strokeWidth="1" />
      <path d="M 300 0 L 300 600" stroke="#333" strokeWidth="1" />
      <path d="M 700 0 L 700 600" stroke="#333" strokeWidth="1" />
      
      {/* Central perspective tracks */}
      <path d='M 100 600 L 480 200' stroke='#d98e04' strokeWidth='2' strokeOpacity='0.5' />
      <path d='M 900 600 L 520 200' stroke='#d98e04' strokeWidth='2' strokeOpacity='0.5' />
    </svg>
    <div className="absolute inset-0 bg-gradient-to-t from-[#16161a] via-transparent to-[#16161a]" />
  </div>
)

const FeatureCard = ({ icon: Icon, title, desc, delay }: { icon: any, title: string, desc: string, delay: number }) => (
  <motion.div 
    initial={{ y: 50, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    whileHover={{ y: -5 }}
    className="glass p-6 rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent hover:border-amber-500/30 transition-colors group"
  >
    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
      <Icon className="text-amber-500" size={24} />
    </div>
    <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
    <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
  </motion.div>
)

export default function LandingPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [signalState, setSignalState] = useState<'red' | 'green'>('red')
  
  const handleGetStarted = () => {
    setSignalState('green')
    setTimeout(() => {
      navigate(isAuthenticated ? '/dashboard' : '/login')
    }, 800) // wait for animation before navigating
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#16161a] text-slate-300">
      <LandingBackground />

      {/* Nav / Header */}
      <header className="relative z-10 p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-brand-400 flex items-center justify-center shadow-glow">
            <Train size={20} className="text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">Railfan Archive</span>
        </div>
        <button 
          onClick={() => navigate('/login')}
          className="text-sm font-semibold text-white hover:text-amber-400 transition-colors"
        >
          {isAuthenticated ? 'Go to Dashboard' : 'Sign In'}
        </button>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold tracking-wider mb-8 uppercase"
          >
            <CloudLightning size={14} /> Production Ready CMS
          </motion.div>
          
          <motion.h1 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight mb-6"
          >
            Manage Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-amber-500">Railway Content</span> Like a Pro
          </motion.h1>
          
          <motion.p 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl"
          >
            A high-performance archival platform built specifically for trainspotters. Auto-sync YouTube metadata, track loco types, and visualize your spotting velocity.
          </motion.p>

          {/* Interactive Animated Button */}
          <motion.button
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={handleGetStarted}
            onHoverStart={() => setSignalState('green')}
            onHoverEnd={() => setSignalState('red')}
            className="relative group flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-4 rounded-full transition-all duration-300 backdrop-blur-md cursor-pointer"
          >
            {/* The Signal Light inside the button */}
            <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center relative shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]">
              <AnimatePresence>
                {signalState === 'red' ? (
                  <motion.div
                    key="red"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 rounded-full bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.8)]"
                  />
                ) : (
                  <motion.div
                    key="green"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 rounded-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.9)]"
                  />
                )}
              </AnimatePresence>
            </div>
            
            <span className="text-lg font-bold text-white tracking-wide">
              {signalState === 'red' ? 'Awaiting Clearance...' : 'Clear to Proceed'}
            </span>
            
            <ArrowRight size={20} className={`text-white transition-transform duration-300 ${signalState === 'green' ? 'translate-x-2 text-emerald-400' : ''}`} />
          </motion.button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard 
            delay={0.4}
            icon={Database} 
            title="Intelligent Archiving" 
            desc="Ditch the spreadsheets. Log trains, locos, and sheds with relational autocomplete."
          />
          <FeatureCard 
            delay={0.5}
            icon={BarChart3} 
            title="Deep Analytics" 
            desc="Visualize upload velocity, top spotted trains, and location hotspots instantly."
          />
          <FeatureCard 
            delay={0.6}
            icon={Shield} 
            title="Duplicate Detection" 
            desc="Automated daemon alerts you if you attempt to upload the same recording twice."
          />
        </div>
      </main>
      
      {/* Basic Footer for Landing */}
      <footer className="relative z-10 border-t border-white/5 bg-[#16161a]/80 py-8 text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} Railfan Archive. Built for the community.</p>
      </footer>
    </div>
  )
}
