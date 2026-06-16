import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
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

// ─────────────────────────────────────────────────────────────
// TRAIN SILHOUETTE (landscape, smaller for landing bg)
// ─────────────────────────────────────────────────────────────
const LandingTrain = () => (
  <svg viewBox="0 0 280 60" xmlns="http://www.w3.org/2000/svg" className="w-[280px] h-[60px]"
    style={{ filter: 'drop-shadow(0 2px 12px rgba(201,138,44,0.25))' }}>
    <defs>
      <radialGradient id="landingBeam" cx="0%" cy="50%" r="100%">
        <stop offset="0%" stopColor="#C98A2C" stopOpacity="0.8"/>
        <stop offset="100%" stopColor="#C98A2C" stopOpacity="0"/>
      </radialGradient>
    </defs>
    <polygon points="14,20 -90,6 -90,40" fill="url(#landingBeam)" opacity="0.6"/>
    <rect x="18" y="16" width="150" height="26" rx="3" fill="#1a1714"/>
    <rect x="160" y="10" width="42" height="32" rx="2.5" fill="#1e1b18"/>
    <rect x="158" y="8" width="46" height="6" rx="1.5" fill="#252118"/>
    <rect x="173" y="14" width="18" height="11" rx="1.5" fill="#0d0c09"/>
    <rect x="8" y="19" width="13" height="19" rx="2.5" fill="#201d1a"/>
    <rect x="6" y="23" width="7" height="6" rx="0.8" fill="#C98A2C" opacity="0.9"/>
    <circle cx="6" cy="26" r="4" fill="#C98A2C" opacity="0.3"/>
    <rect x="18" y="29" width="150" height="2.5" rx="1" fill="#C98A2C" opacity="0.45"/>
    <rect x="160" y="29" width="42" height="2.5" rx="1" fill="#C98A2C" opacity="0.45"/>
    <circle cx="38" cy="48" r="7" fill="#111" stroke="#2a2520" strokeWidth="1.2"/>
    <circle cx="38" cy="48" r="3.5" fill="#1a1714"/>
    <circle cx="60" cy="48" r="7" fill="#111" stroke="#2a2520" strokeWidth="1.2"/>
    <circle cx="60" cy="48" r="3.5" fill="#1a1714"/>
    <circle cx="140" cy="48" r="7" fill="#111" stroke="#2a2520" strokeWidth="1.2"/>
    <circle cx="140" cy="48" r="3.5" fill="#1a1714"/>
    <circle cx="162" cy="48" r="7" fill="#111" stroke="#2a2520" strokeWidth="1.2"/>
    <circle cx="162" cy="48" r="3.5" fill="#1a1714"/>
    <rect x="2" y="28" width="8" height="4" rx="0.8" fill="#1e1b18"/>
  </svg>
)

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

  const handleGetStarted = () => {
    setSignalState('amber')
    setTimeout(() => setSignalState('green'), 500)
    setTimeout(() => navigate(isAuthenticated ? '/dashboard' : '/login'), 1200)
  }

  return (
    <div className="min-h-screen relative text-slate-300 overflow-x-hidden" style={{ background: '#19181c' }}>

      {/* ── Animated background train ── */}
      <style>{`
        @keyframes landingTrain {
          0%   { transform: translateX(105vw); }
          100% { transform: translateX(-320px); }
        }
        @keyframes trackPulse {
          0%, 100% { opacity: 0.3; }
          50%       { opacity: 0.6; }
        }
      `}</style>

      {/* Horizon glow */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute bottom-0 left-0 right-0 h-[40%]"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(201,138,44,0.05) 0%, transparent 70%)' }}/>
        <div className="absolute top-0 left-0 right-0 h-[30%]"
          style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(62,124,140,0.04) 0%, transparent 70%)' }}/>
      </div>

      {/* Track lines across full width */}
      <div className="fixed bottom-0 left-0 right-0 h-24 pointer-events-none" style={{ zIndex: 1 }}>
        <svg className="w-full h-full" viewBox="0 0 1440 96" preserveAspectRatio="none">
          <line x1="0" y1="40" x2="1440" y2="40" stroke="#2e2b26" strokeWidth="2"
            style={{ animation:'trackPulse 4s ease-in-out infinite' }}/>
          <line x1="0" y1="52" x2="1440" y2="52" stroke="#2e2b26" strokeWidth="2"
            style={{ animation:'trackPulse 4s 0.5s ease-in-out infinite' }}/>
          {Array.from({length:36},(_,i)=>(
            <line key={i} x1={i*40} y1={38} x2={i*40+24} y2={54} stroke="#201d18" strokeWidth="1.5"/>
          ))}
        </svg>
        {/* Animated train crossing the bottom */}
        <div className="absolute" style={{ bottom:'20px', left:0, animation:'landingTrain 22s linear infinite' }}>
          <LandingTrain />
        </div>
      </div>

      {/* ── NAV ── */}
      <header className="relative z-20 border-b border-white/[0.04]"
        style={{ background: 'rgba(25,24,28,0.85)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/RF_Logo.png" alt="Railfan Archive" className="w-9 h-9 object-contain rounded-lg"/>
            <span className="text-base font-bold text-white">Railfan Archive</span>
          </div>
          <button onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
            className="text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 border border-transparent hover:border-white/10"
            style={{ color: '#C98A2C' }}
            onMouseOver={e => (e.currentTarget.style.background = 'rgba(201,138,44,0.08)')}
            onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
            {isAuthenticated ? 'Go to Dashboard →' : 'Sign In'}
          </button>
        </div>
      </header>

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
          <button onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
            className="text-xs font-semibold transition-colors"
            style={{ color: '#C98A2C' }}>
            Launch App →
          </button>
        </div>
      </footer>
    </div>
  )
}
