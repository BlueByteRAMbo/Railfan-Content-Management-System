import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authApi } from '../api/services'
import { useAuthStore } from '../store/authStore'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'


// ── Railway scene with animated train ─────────────────────────
const AnimatedRailwayScene = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden" style={{ background: '#0e0d0b' }}>
      {/* Keyframe styles injected inline */}
      <style>{`
        @keyframes signalBlink {
          0%, 45%  { opacity: 1; }
          50%, 95% { opacity: 0.3; }
          100%     { opacity: 1; }
        }
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.4; }
          50%      { opacity: 0.9; }
        }
        @keyframes headlightFlicker {
          0%, 90%, 100% { opacity: 0.85; }
          92%, 98%      { opacity: 0.5; }
        }
      `}</style>

      {/* Static SVG scene — sky, tracks, platform, signals */}
      <svg
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 900 600"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#080706"/>
            <stop offset="100%" stopColor="#141210"/>
          </linearGradient>
          <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a1714"/>
            <stop offset="100%" stopColor="#0e0c0a"/>
          </linearGradient>
          <radialGradient id="amberGlow" cx="18%" cy="60%" r="25%">
            <stop offset="0%" stopColor="#C98A2C" stopOpacity="0.25"/>
            <stop offset="100%" stopColor="#C98A2C" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="signalAmbient" cx="72%" cy="42%" r="12%">
            <stop offset="0%" stopColor="#C98A2C" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="#C98A2C" stopOpacity="0"/>
          </radialGradient>
        </defs>

        {/* Sky */}
        <rect width="900" height="600" fill="url(#skyGrad)"/>

        {/* Stars */}
        {[
          [80,45],[160,28],[290,60],[430,20],[550,75],[680,35],[780,55],[830,25],
          [110,120],[350,95],[500,110],[700,90],[820,130],[50,180],[240,160],
          [460,140],[610,170],[750,145],[30,250],[200,230],[400,210],[620,240],
        ].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r={i%3===0?1.2:0.7} fill="#f0ece4"
            style={{ animation:`starTwinkle ${2+i%3}s ${i*0.3}s ease-in-out infinite`, opacity:0.4 }}/>
        ))}

        {/* Distant city glow on horizon */}
        <ellipse cx="450" cy="340" rx="400" ry="60" fill="#1c1612" opacity="0.8"/>

        {/* Ground */}
        <path d="M 0 370 L 900 370 L 900 600 L 0 600 Z" fill="url(#groundGrad)"/>

        {/* Platform right */}
        <rect x="550" y="330" width="350" height="270" fill="#111009"/>
        <rect x="550" y="328" width="350" height="5" fill="#1e1b14"/>
        {/* Platform edge lights */}
        {[570,620,670,720,770,820,870].map((x,i)=>(
          <circle key={i} cx={x} cy={333} r={2} fill="#C98A2C" opacity={0.5}/>
        ))}

        {/* Rails — two perspective lines converging to vanishing point at ~cx=280, cy=300 */}
        {/* Left rail pair */}
        <path d="M 0 430 L 900 370" stroke="#2e2b26" strokeWidth="3.5"/>
        <path d="M 0 455 L 900 388" stroke="#2e2b26" strokeWidth="3.5"/>
        {/* Sleepers (cross-ties) */}
        {Array.from({length:22},(_,i)=>{
          const t = i/21
          const y1 = 430 - t*60
          const y2 = 455 - t*67
          const xLeft = t*900
          return <line key={i} x1={xLeft} y1={y1} x2={xLeft+38} y2={y2} stroke="#201d18" strokeWidth={2.5-t*1.2}/>
        })}

        {/* Headlight ground reflection (ambient amber sweep — near left edge) */}
        <ellipse cx="80" cy="445" rx="160" ry="30" fill="#C98A2C" opacity="0.06"
          style={{ animation:'headlightFlicker 0.4s ease-in-out infinite' }}/>
        <rect x="0" y="0" width="900" height="600" fill="url(#amberGlow)"
          style={{ animation:'headlightFlicker 0.4s 0.1s ease-in-out infinite' }}/>

        {/* Signal gantry right of scene */}
        <rect x="640" y="220" width="7" height="115" fill="#1e1b16" rx="2"/>
        <rect x="638" y="218" width="80" height="6" fill="#1e1b16" rx="2"/>
        {/* Signal head */}
        <rect x="688" y="198" width="26" height="34" rx="3" fill="#0a0908" stroke="#2a2520" strokeWidth="1"/>
        <circle cx="701" cy="215" r="5.5" fill="#C98A2C"
          style={{ animation:'signalBlink 3s 1s ease-in-out infinite' }}/>
        <circle cx="701" cy="215" r="10" fill="#C98A2C" opacity="0.2"
          style={{ animation:'signalBlink 3s 1s ease-in-out infinite' }}/>
        <circle cx="701" cy="215" r="30" fill="url(#signalAmbient)"
          style={{ animation:'signalBlink 3s 1s ease-in-out infinite' }}/>

        {/* Second distant signal */}
        <rect x="340" y="268" width="4" height="75" fill="#1a1814" rx="1"/>
        <rect x="338" y="267" width="48" height="4" fill="#1a1814" rx="1"/>
        <rect x="356" y="255" width="18" height="22" rx="2" fill="#090807" stroke="#1e1b16" strokeWidth="0.8"/>
        <circle cx="365" cy="266" r="4" fill="#3E7C8C" opacity="0.7"
          style={{ animation:'signalBlink 4s 2s ease-in-out infinite' }}/>

        {/* Dark overlay at top — keeps it from being too bright */}
        <rect width="900" height="600" fill="black" opacity="0.28"/>

        {/* ── Locomotive — inside SVG so animateTransform follows rail slope ── */}
        {/*    Track midpoints: x=0→y=442, x=900→y=379 (slope ≈7px per 100u)  */}
        {/*    Loco drawn with wheel-bottom at y=0, body going negative (up)    */}
        <defs>
          <radialGradient id="hlBeam" cx="0%" cy="50%" r="100%">
            <stop offset="0%" stopColor="#C98A2C" stopOpacity="0.8"/>
            <stop offset="60%" stopColor="#C98A2C" stopOpacity="0.1"/>
            <stop offset="100%" stopColor="#C98A2C" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <g style={{ filter:'drop-shadow(0 3px 14px rgba(201,138,44,0.4))' }}>
          <animateTransform
            attributeName="transform"
            type="translate"
            from="1000 374"
            to="-380 444"
            dur="16s"
            repeatCount="indefinite"
          />
          {/* Headlight beam — left */}
          <polygon points="10,-30 -110,-8 -110,-56" fill="url(#hlBeam)" opacity="0.7"/>
          {/* Main body */}
          <rect x="14" y="-55" width="185" height="28" rx="4" fill="#1a1714"/>
          {/* Cab */}
          <rect x="192" y="-66" width="50" height="40" rx="3" fill="#1e1b18"/>
          {/* Cab roof */}
          <rect x="189" y="-70" width="55" height="8" rx="2" fill="#252118"/>
          {/* Cab window */}
          <rect x="207" y="-61" width="22" height="14" rx="2" fill="#0d0c09"/>
          {/* Front nose */}
          <rect x="6" y="-49" width="13" height="22" rx="3" fill="#201d1a"/>
          {/* Headlight */}
          <rect x="4" y="-43" width="9" height="8" rx="1.5" fill="#C98A2C"/>
          <circle cx="8.5" cy="-39" r="7" fill="#C98A2C" opacity="0.25"/>
          {/* Side stripe */}
          <rect x="14" y="-39" width="185" height="3.5" rx="1.5" fill="#C98A2C" opacity="0.5"/>
          <rect x="192" y="-39" width="50" height="3.5" rx="1.5" fill="#C98A2C" opacity="0.5"/>
          {/* Pantograph */}
          <rect x="108" y="-70" width="3.5" height="15" fill="#252118" rx="1"/>
          <line x1="108" y1="-70" x2="93" y2="-82" stroke="#3a3530" strokeWidth="1.5"/>
          <line x1="111.5" y1="-70" x2="124" y2="-82" stroke="#3a3530" strokeWidth="1.5"/>
          <line x1="93" y1="-82" x2="124" y2="-82" stroke="#3a3530" strokeWidth="1.5"/>
          {/* Bogie frames */}
          <rect x="22" y="-19" width="62" height="12" rx="2.5" fill="#161412"/>
          <rect x="150" y="-19" width="62" height="12" rx="2.5" fill="#161412"/>
          {/* Wheels — front bogie */}
          <circle cx="40" cy="-9" r="10" fill="#111" stroke="#2a2520" strokeWidth="1.5"/>
          <circle cx="40" cy="-9" r="5" fill="#1a1714"/>
          <circle cx="40" cy="-9" r="2.2" fill="#C98A2C" opacity="0.7"/>
          <circle cx="68" cy="-9" r="10" fill="#111" stroke="#2a2520" strokeWidth="1.5"/>
          <circle cx="68" cy="-9" r="5" fill="#1a1714"/>
          <circle cx="68" cy="-9" r="2.2" fill="#C98A2C" opacity="0.7"/>
          {/* Wheels — rear bogie */}
          <circle cx="166" cy="-9" r="10" fill="#111" stroke="#2a2520" strokeWidth="1.5"/>
          <circle cx="166" cy="-9" r="5" fill="#1a1714"/>
          <circle cx="166" cy="-9" r="2.2" fill="#C98A2C" opacity="0.7"/>
          <circle cx="194" cy="-9" r="10" fill="#111" stroke="#2a2520" strokeWidth="1.5"/>
          <circle cx="194" cy="-9" r="5" fill="#1a1714"/>
          <circle cx="194" cy="-9" r="2.2" fill="#C98A2C" opacity="0.7"/>
          {/* Buffer */}
          <rect x="0" y="-37" width="9" height="5" rx="1" fill="#1e1b18"/>
          {/* Smoke puffs (use animateTransform per circle) */}
          <circle cx="110" cy="-72" r="6" fill="#2a2520" opacity="0">
            <animate attributeName="cy" from="-72" to="-130" dur="2.8s" begin="0s" repeatCount="indefinite"/>
            <animate attributeName="r" from="5" to="20" dur="2.8s" begin="0s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.55;0.3;0" dur="2.8s" begin="0s" repeatCount="indefinite"/>
          </circle>
          <circle cx="110" cy="-72" r="6" fill="#2a2520" opacity="0">
            <animate attributeName="cy" from="-72" to="-130" dur="2.8s" begin="0.93s" repeatCount="indefinite"/>
            <animate attributeName="r" from="5" to="20" dur="2.8s" begin="0.93s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.55;0.3;0" dur="2.8s" begin="0.93s" repeatCount="indefinite"/>
          </circle>
          <circle cx="110" cy="-72" r="6" fill="#2a2520" opacity="0">
            <animate attributeName="cy" from="-72" to="-130" dur="2.8s" begin="1.87s" repeatCount="indefinite"/>
            <animate attributeName="r" from="5" to="20" dur="2.8s" begin="1.87s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.55;0.3;0" dur="2.8s" begin="1.87s" repeatCount="indefinite"/>
          </circle>
        </g>
      </svg>
    </div>
  )
}

// ── Schema ────────────────────────────────────────────────────
const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
})
type LoginForm = z.infer<typeof loginSchema>

// ── Page ─────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const authMutation = useMutation({
    mutationFn: (data: LoginForm) => {
      if (isRegistering) {
        return authApi.register({ username: data.username, password: data.password, email: data.email! }).then(r => r.data)
      }
      return authApi.login({ username: data.username, password: data.password }).then(r => r.data)
    },
    onSuccess: (data) => {
      setAuth(data)
      navigate('/dashboard')
    },
  })

  return (
    <div className="min-h-screen flex" style={{ background: '#19181c' }}>

      {/* ── Left panel — Animated Railway Scene ── */}
      <div className="hidden lg:flex lg:flex-col lg:w-[58%] relative overflow-hidden">
        <AnimatedRailwayScene />

        {/* Bottom-left identity copy */}
        <div className="absolute bottom-10 left-10 z-20 pointer-events-none">
          <div className="flex items-center gap-3 mb-4">
            <img src="/RF_Logo.png" alt="Railfan Archive" className="w-8 h-8 object-contain" />
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase"
               style={{ color: '#C98A2C' }}>
              Railfan Archive
            </p>
          </div>
          <p className="text-3xl font-semibold leading-snug"
             style={{ color: '#f0ece4', fontFamily: "'Barlow Condensed', system-ui, sans-serif" }}>
            Your footage.<br />Organised.
          </p>
          {/* Live train stat */}
          <div className="mt-5 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"/>
            <span className="text-xs text-slate-500 font-mono">WAP-7 · 12051 · LIVE</span>
          </div>
        </div>
      </div>

      {/* ── Right panel — Form ── */}
      <div
        className="flex-1 flex flex-col justify-between p-8 lg:p-12 relative"
        style={{
          background: '#211f1c',
          borderLeft: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Mobile: mini railway strip */}
        <div className="lg:hidden absolute top-0 left-0 right-0 h-24 overflow-hidden opacity-25 pointer-events-none">
          <svg viewBox="0 0 400 96" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
            <rect width="400" height="96" fill="#0e0d0b"/>
            <path d="M 50 96 L 185 30" stroke="#2e2b26" strokeWidth="3"/>
            <path d="M 80 96 L 195 30" stroke="#2e2b26" strokeWidth="3"/>
            <path d="M 350 96 L 215 30" stroke="#2e2b26" strokeWidth="3"/>
            <path d="M 320 96 L 205 30" stroke="#2e2b26" strokeWidth="3"/>
            <circle cx="200" cy="18" r="6" fill="#C98A2C"/>
            <circle cx="200" cy="18" r="14" fill="#C98A2C" fillOpacity="0.15"/>
          </svg>
        </div>

        {/* Form area */}
        <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto">

          {/* Logo */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 mb-5">
              <img src="/RF_Logo.png" alt="Railfan Archive" className="w-10 h-10 object-contain rounded-lg"/>
              <div>
                <h1 className="text-lg font-bold text-white leading-none">Railfan Archive</h1>
                <p className="text-xs text-slate-500 mt-0.5">Manager v1.0</p>
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-white mb-1">
              {isRegistering ? 'Create account' : 'Welcome back'}
            </h2>
            <p className="text-sm text-slate-400">
              {isRegistering ? 'Set up your admin credentials' : 'Sign in to manage your train videos'}
            </p>
          </div>

          {/* Error */}
          {authMutation.isError && (
            <div className="mb-5 flex items-start gap-3 p-4 rounded-lg bg-red-900/20 border border-red-800/40 text-red-400">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <p className="text-sm leading-relaxed">
                {(() => {
                  const err = authMutation.error as any
                  if (err?.code === 'ECONNABORTED') return 'Connection timed out. The server may still be booting.'
                  if (!err?.response) return 'Cannot connect to the server. It may be sleeping or starting up. Please try again in a few seconds.'
                  return err.response.data?.message ||
                    (isRegistering ? 'Registration failed. Username or email might already be taken.' : 'Invalid username or password.')
                })()}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit((d) => authMutation.mutate(d))} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <input {...register('username')} type="text" className="form-input"
                placeholder="your_username" autoComplete="username"/>
              {errors.username && <p className="mt-1.5 text-xs text-red-400">{errors.username.message}</p>}
            </div>

            {isRegistering && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email</label>
                <input {...register('email')} type="email" className="form-input"
                  placeholder="your@email.com" autoComplete="email" required={isRegistering}/>
                {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <input {...register('password')} type={showPassword ? 'text' : 'password'}
                  className="form-input pr-10" placeholder="••••••••"
                  autoComplete={isRegistering ? 'new-password' : 'current-password'}/>
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPassword ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={authMutation.isPending}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 mt-2">
              {authMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  {isRegistering ? 'Creating Account…' : 'Signing in…'}
                </>
              ) : (isRegistering ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button type="button"
              onClick={() => { setIsRegistering(!isRegistering); reset() }}
              className="text-sm transition-colors"
              style={{ color: '#C98A2C' }}
              onMouseOver={e => (e.currentTarget.style.color = '#e8b86d')}
              onMouseOut={e => (e.currentTarget.style.color = '#C98A2C')}>
              {isRegistering ? 'Already have an account? Sign in' : 'First time here? Create an account'}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-700 mt-6">
          Railfan Archive Manager v1.0
        </p>
      </div>
    </div>
  )
}
