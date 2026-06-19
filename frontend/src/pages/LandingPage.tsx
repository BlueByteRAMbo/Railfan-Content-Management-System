import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView, useScroll, useTransform } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Database, BarChart3, Shield, ArrowRight, PlayCircle, FileSpreadsheet, Zap } from 'lucide-react'

// ─────────────────────────────────────────────────────────────
// DEPARTURE BOARD — split-flap animation
// ─────────────────────────────────────────────────────────────
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ·-'

function FlipChar({ target, delay }: { target: string; delay: number }) {
  const [display, setDisplay] = useState(' ')
  const [isFlipping, setIsFlipping] = useState(false)
  const targetIdx = CHARS.indexOf(target.toUpperCase())

  useEffect(() => {
    const timeout = setTimeout(() => {
      let step = 0
      const totalSteps = (targetIdx < 0 ? 0 : targetIdx) + 4
      const interval = setInterval(() => {
        setIsFlipping(true)
        const charIdx = step % CHARS.length
        setDisplay(CHARS[charIdx])
        step++
        if (step >= totalSteps) {
          clearInterval(interval)
          setDisplay(target.toUpperCase())
          setIsFlipping(false)
        }
      }, 55)
      return () => clearInterval(interval)
    }, delay)
    return () => clearTimeout(timeout)
  }, [target, delay, targetIdx])

  return (
    <span
      className="inline-block font-mono text-center select-none"
      style={{
        minWidth: '1ch',
        color: isFlipping ? '#9A6820' : '#f0ece4',
        transition: 'color 0.05s',
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      {display}
    </span>
  )
}

function FlipWord({ text, baseDelay = 0 }: { text: string; baseDelay?: number }) {
  return (
    <span>
      {text.split('').map((char, i) => (
        <FlipChar key={i} target={char} delay={baseDelay + i * 60} />
      ))}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────
// DEPARTURE BOARD WIDGET
// ─────────────────────────────────────────────────────────────
const DEPARTURES = [
  { number: '12951', name: 'MUMBAI RAJDHANI', from: 'NDLS', status: 'DEPARTED', color: '#5C8A4A' },
  { number: '22691', name: 'RAJDHANI EXP',    from: 'SBC',  status: 'ON TIME',  color: '#3E7C8C' },
  { number: '12002', name: 'BHOPAL SHATABDI', from: 'NDLS', status: 'DELAYED',  color: '#B23A2E' },
  { number: '20501', name: 'VANDE BHARAT',    from: 'HWH',  status: 'ON TIME',  color: '#3E7C8C' },
  { number: '12627', name: 'KARNATAKA EXP',   from: 'MAS',  status: 'PLATFORM', color: '#C98A2C' },
]

function DepartureBoard() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })

  return (
    <div ref={ref}
      className="rounded-xl overflow-hidden border border-white/8"
      style={{ background: '#0d0b09', boxShadow: '0 0 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)' }}
    >
      {/* Board header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5"
        style={{ background: '#111009' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">Live Departures</span>
        </div>
        <span className="text-xs font-mono" style={{ color: '#C98A2C' }}>
          {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[80px_1fr_60px_90px] gap-3 px-4 py-2 border-b border-white/5">
        {['TRAIN NO', 'NAME', 'FROM', 'STATUS'].map(h => (
          <span key={h} className="text-[9px] font-bold tracking-widest text-slate-600 uppercase">{h}</span>
        ))}
      </div>

      {/* Rows */}
      {DEPARTURES.map((dep, i) => (
        <motion.div
          key={dep.number}
          initial={{ opacity: 0, x: -10 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.1 + i * 0.12, duration: 0.4 }}
          className="grid grid-cols-[80px_1fr_60px_90px] gap-3 px-4 py-2.5 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
        >
          <span className="font-mono text-xs font-bold" style={{ color: '#C98A2C' }}>
            {inView && <FlipWord text={dep.number} baseDelay={i * 120} />}
          </span>
          <span className="text-xs font-medium text-slate-300 truncate">{dep.name}</span>
          <span className="text-xs font-mono text-slate-500">{dep.from}</span>
          <span className="text-[10px] font-bold tracking-wide" style={{ color: dep.color }}>
            {dep.status}
          </span>
        </motion.div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// ANIMATED STAT COUNTER
// ─────────────────────────────────────────────────────────────
function CountUp({ to, duration = 1800, suffix = '' }: { to: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(to * eased))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, to, duration])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

// Train silhouette removed per user request
// ─────────────────────────────────────────────────────────────
// FEATURE CARD (improved)
// ─────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Database,
    title: 'Intelligent Archiving',
    desc: 'Ditch the spreadsheets. Log trains, locos, and sheds with searchable autocomplete from 7,000+ Indian stations.',
    tag: 'Core',
    tagColor: '#C98A2C',
  },
  {
    icon: PlayCircle,
    title: 'YouTube Auto-Sync',
    desc: 'Paste a video ID. Title, duration, thumbnail, and description are scraped instantly — no API key required.',
    tag: 'No API Key',
    tagColor: '#B23A2E',
  },
  {
    icon: BarChart3,
    title: 'Deep Analytics',
    desc: 'Spot trends in your footage — top locos, hotspot stations, upload velocity vs. recording cadence over time.',
    tag: 'Charts',
    tagColor: '#3E7C8C',
  },
  {
    icon: FileSpreadsheet,
    title: 'Mass Import · Export',
    desc: 'Import Google Takeout CSV, legacy Excel files. Export to PDF reports, Excel, or raw CSV backups.',
    tag: 'Data',
    tagColor: '#5C8A4A',
  },
  {
    icon: Shield,
    title: 'Duplicate Detection',
    desc: 'Automated daemon flags same-train same-day re-uploads before they pollute your archive.',
    tag: 'Auto',
    tagColor: '#8A7E72',
  },
  {
    icon: Zap,
    title: 'Quick Add Mode',
    desc: 'Sequential data entry optimised for logging entire backlogs without touching your mouse.',
    tag: 'Speed',
    tagColor: '#C98A2C',
  },
]

function FeatureCard({ feat, index }: { feat: typeof FEATURES[0]; index: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref}
      initial={{ y: 40, opacity: 0 }}
      animate={inView ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 0.55, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="relative group rounded-xl p-5 border border-white/5 cursor-default"
      style={{ background: 'rgba(255,255,255,0.03)' }}
    >
      {/* Hover border glow */}
      <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-[#C98A2C]/20 transition-colors duration-300 pointer-events-none"/>
      {/* Tag */}
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: `${feat.tagColor}15` }}>
          <feat.icon size={20} style={{ color: feat.tagColor }}/>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
          style={{ color: feat.tagColor, background: `${feat.tagColor}12` }}>
          {feat.tag}
        </span>
      </div>
      <h3 className="text-sm font-bold text-white mb-1.5">{feat.title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed">{feat.desc}</p>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────
// LANDING PAGE
// ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [signalState, setSignalState] = useState<'red' | 'amber' | 'green'>('red')

  const { scrollYProgress } = useScroll()
  const locoY = useTransform(scrollYProgress, [0, 1], ['0vh', '90vh'])

  const handleGetStarted = () => {
    setSignalState('amber')
    setTimeout(() => setSignalState('green'), 500)
    setTimeout(() => navigate(isAuthenticated ? '/dashboard' : '/login'), 1200)
  }

  return (
    <div className="min-h-screen relative text-slate-300 overflow-x-hidden" style={{ background: '#19181c' }}>

      {/* ── Scroll Progress Rail ── */}
      <div className="fixed top-0 right-4 bottom-0 w-[2px] bg-white/[0.03] z-50 pointer-events-none hidden lg:block">
        <motion.div 
          style={{ y: locoY }}
          className="absolute -left-[11px] top-0 w-6 h-6 flex items-center justify-center text-[#C98A2C] drop-shadow-[0_0_8px_rgba(201,138,44,0.6)]"
        >
          {/* Frontal Loco SVG */}
          <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M12 2C8 2 4 2.5 4 6v9.5C4 17.4 5.6 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.9 0 3.5-1.6 3.5-3.5V6c0-3.5-4-4-8-4zm0 2c3.5 0 6 .5 6 2v2H6V6c0-1.5 2.5-2 6-2zm-5 7c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm10 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
          </svg>
        </motion.div>
      </div>

      {/* ── Animated background styles ── */}
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>

      {/* Horizon glow */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute bottom-0 left-0 right-0 h-[40%]"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(201,138,44,0.05) 0%, transparent 70%)' }}/>
        <div className="absolute top-0 left-0 right-0 h-[30%]"
          style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(62,124,140,0.04) 0%, transparent 70%)' }}/>
      </div>

      {/* Track lines removed per user request */}

      {/* ── NAV ── */}
      <header className="relative z-20 border-b border-white/[0.04]"
        style={{ background: 'rgba(25,24,28,0.85)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/RF_Logo.png" alt="Railfan Archive" className="w-9 h-9 object-contain rounded-lg"/>
            <span className="text-base font-bold text-white">Railfan Archive</span>
          </div>
          {/* Desktop Self-Highlighting Button */}
          <button onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
            className="hidden md:flex items-center gap-2 text-sm font-bold px-6 py-2.5 rounded-full bg-[#C98A2C]/10 border border-[#C98A2C]/50 text-[#C98A2C] hover:bg-[#C98A2C] hover:text-white shadow-[0_0_20px_rgba(201,138,44,0.4)] transition-all duration-300 relative overflow-hidden group"
          >
            <span className="relative z-10">{isAuthenticated ? 'Go to Dashboard' : 'Launch App'}</span>
            <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
            {/* Shimmer animation element */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite] group-hover:hidden" />
          </button>
        </div>
      </header>

      {/* ── MOBILE FIXED CTA ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-[#19181c] via-[#19181c]/80 to-transparent pb-6 pt-12 pointer-events-none">
        <button onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
          className="pointer-events-auto w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-[#C98A2C] to-[#d99f46] shadow-[0_10px_30px_rgba(201,138,44,0.4)] border border-[#e0a64e]/50 flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          {isAuthenticated ? 'Go to Dashboard' : 'Launch App'} <ArrowRight size={18} />
        </button>
      </div>

      {/* ── HERO ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — copy */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold tracking-widest uppercase mb-8"
              style={{ borderColor:'rgba(201,138,44,0.3)', color:'#C98A2C', background:'rgba(201,138,44,0.08)' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"/>
              For the Indian Railfan Community
            </motion.div>

            {/* Headline — flip-board style */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="mb-6">
              <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-[1.08] tracking-tight mb-2">
                Archive Your
              </h1>
              <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.08] tracking-tight mb-2"
                style={{ color: '#C98A2C' }}>
                Railway Footage
              </h1>
              <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-[1.08] tracking-tight">
                Like a Pro.
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-base text-slate-400 leading-relaxed mb-10 max-w-lg">
              The production-grade CMS built exclusively for trainspotters. Auto-sync YouTube metadata, track 7,000+ Indian stations, and visualise your spotting velocity — all in one place.
            </motion.p>

            {/* Signal CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}>
              <button
                onClick={handleGetStarted}
                onMouseEnter={() => signalState === 'red' && setSignalState('amber')}
                onMouseLeave={() => signalState === 'amber' && setSignalState('red')}
                className="group relative inline-flex items-center gap-4 px-7 py-4 rounded-full border transition-all duration-400 cursor-pointer overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderColor: signalState === 'green' ? 'rgba(92,138,74,0.5)' :
                               signalState === 'amber' ? 'rgba(201,138,44,0.4)' : 'rgba(255,255,255,0.1)',
                  boxShadow: signalState === 'green' ? '0 0 30px rgba(92,138,74,0.2)' :
                             signalState === 'amber' ? '0 0 30px rgba(201,138,44,0.15)' : 'none',
                }}>
                {/* Signal lamp */}
                <div className="relative w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: '#0a0908', boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.9)' }}>
                  <AnimatePresence mode="wait">
                    <motion.div key={signalState}
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.6 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0.5 rounded-full"
                      style={{
                        background: signalState === 'green' ? '#5C8A4A' :
                                    signalState === 'amber' ? '#C98A2C' : '#B23A2E',
                        boxShadow: signalState === 'green' ? '0 0 14px rgba(92,138,74,0.9)' :
                                   signalState === 'amber' ? '0 0 14px rgba(201,138,44,0.9)' : '0 0 14px rgba(178,58,46,0.8)',
                      }}/>
                  </AnimatePresence>
                </div>

                <span className="text-base font-bold text-white tracking-wide">
                  {signalState === 'green' ? 'Line Clear — Proceeding' :
                   signalState === 'amber' ? 'Preparing Track…' : 'Awaiting Clearance'}
                </span>

                <motion.div
                  animate={{ x: signalState === 'green' ? 4 : 0 }}
                  transition={{ type: 'spring', stiffness: 400 }}>
                  <ArrowRight size={18} className="text-slate-400 group-hover:text-white transition-colors"/>
                </motion.div>
              </button>
            </motion.div>

            {/* Stats strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex items-center gap-8 mt-10 pt-8 border-t border-white/[0.06]">
              {[
                { label: 'Indian Stations', value: 7000, suffix: '+' },
                { label: 'Loco Types',      value: 50,   suffix: '+' },
                { label: 'Zones Covered',   value: 18,   suffix: '' },
              ].map(stat => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-white">
                    <CountUp to={stat.value} suffix={stat.suffix}/>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — departure board */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:block">
            <div className="flex items-center gap-2 mb-3">
              <img src="/RF_Logo.png" alt="" className="w-5 h-5 object-contain opacity-70"/>
              <span className="text-xs text-slate-600 uppercase tracking-widest font-semibold">Live Archive Board</span>
            </div>
            <DepartureBoard />
            <p className="text-[10px] text-slate-700 text-right mt-2 font-mono">
              Demo data · Real app connects to your archive
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── TICKER TAPE ── */}
      <div className="relative z-10 w-full overflow-hidden border-y border-white/[0.05] py-2 bg-[#12110f] flex mb-12">
        <motion.div 
          className="flex whitespace-nowrap gap-8 text-[11px] font-mono text-slate-500 uppercase tracking-widest"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-8 items-center">
              <span>• 12951 MUMBAI RAJDHANI</span>
              <span>• 22691 RAJDHANI EXP</span>
              <span>• 12002 BHOPAL SHATABDI</span>
              <span>• 20501 VANDE BHARAT</span>
              <span>• 12627 KARNATAKA EXP</span>
              <span>• 12810 HOWRAH MAIL</span>
              <span>• 12301 RAJDHANI EXP</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── TRACK CONNECTOR ── */}
      <div className="relative z-0 max-w-7xl mx-auto flex justify-center -mt-12 mb-8 h-24 overflow-hidden">
        <motion.div
          initial={{ y: '-100%' }}
          whileInView={{ y: 0 }}
          viewport={{ once: true, margin: '-20%' }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full border-l-2 border-dashed border-[#C98A2C]/30"
        />
      </div>

      {/* ── FEATURES ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-28">
        <div className="mb-10 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-white mb-3">
            Everything a Railfan Needs
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-sm text-slate-500 max-w-lg mx-auto">
            Built by a railfan, for railfans. Every feature exists because a spreadsheet couldn't handle it.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feat, i) => (
            <FeatureCard key={feat.title} feat={feat} index={i}/>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-white/[0.05] py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <img src="/RF_Logo.png" alt="" className="w-6 h-6 object-contain opacity-60"/>
            <span className="text-xs text-slate-600">© {new Date().getFullYear()} Railfan Archive — Built for the community.</span>
          </div>
          {/* Mobile Footer Spacing buffer so it doesn't overlap content */}
          <div className="h-16 md:hidden w-full"></div>
        </div>
      </footer>
    </div>
  )
}
