import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authApi } from '../api/services'
import { useAuthStore } from '../store/authStore'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'

// ── Signal Lamp logo mark ──────────────────────────────────────
const SignalMark = () => (
  <svg width="40" height="40" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect width="36" height="36" rx="8" fill="#C98A2C" fillOpacity="0.12"/>
    {/* Signal post */}
    <rect x="16.5" y="10" width="3" height="13" rx="1.5" fill="#C98A2C"/>
    {/* Signal head housing */}
    <rect x="14" y="9" width="8" height="6" rx="1.5" fill="#1c1a16" stroke="#C98A2C" strokeWidth="1"/>
    {/* Signal lamp glow */}
    <circle cx="18" cy="12" r="2" fill="#C98A2C"/>
    <circle cx="18" cy="12" r="3.5" fill="#C98A2C" fillOpacity="0.2"/>
    {/* Base bracket */}
    <rect x="13" y="22.5" width="10" height="3.5" rx="1" fill="#C98A2C" fillOpacity="0.55"/>
    {/* Base rail */}
    <rect x="9" y="25.5" width="18" height="2.5" rx="1.2" fill="#C98A2C"/>
  </svg>
)

// ── Railway scene SVG (left panel background) ─────────────────
const RailwayScene = () => (
  <svg
    className="absolute inset-0 w-full h-full"
    preserveAspectRatio="xMidYMid slice"
    viewBox="0 0 800 900"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <radialGradient id="signalGlow1" cx="62%" cy="38%" r="18%">
        <stop offset="0%" stopColor="#C98A2C" stopOpacity="0.6"/>
        <stop offset="100%" stopColor="#C98A2C" stopOpacity="0"/>
      </radialGradient>
      <radialGradient id="skyGrad" cx="50%" cy="0%" r="100%">
        <stop offset="0%" stopColor="#1e1a14"/>
        <stop offset="100%" stopColor="#0e0d0b"/>
      </radialGradient>
      <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1a1714"/>
        <stop offset="100%" stopColor="#111009"/>
      </linearGradient>
      <filter id="blur4">
        <feGaussianBlur stdDeviation="4"/>
      </filter>
    </defs>

    {/* Sky */}
    <rect width="800" height="900" fill="url(#skyGrad)"/>

    {/* Distant city haze */}
    <ellipse cx="400" cy="560" rx="380" ry="80" fill="#1c1810" opacity="0.7"/>

    {/* Ground plane */}
    <path d="M 0 620 L 800 620 L 800 900 L 0 900 Z" fill="url(#groundGrad)"/>

    {/* Converging rails — perspective */}
    {/* Left rail */}
    <path d="M 60 900 L 375 555" stroke="#3a3530" strokeWidth="5" strokeLinecap="round"/>
    <path d="M 110 900 L 385 555" stroke="#3a3530" strokeWidth="5" strokeLinecap="round"/>
    {/* Right rail */}
    <path d="M 690 900 L 415 555" stroke="#3a3530" strokeWidth="5" strokeLinecap="round"/>
    <path d="M 740 900 L 425 555" stroke="#3a3530" strokeWidth="5" strokeLinecap="round"/>

    {/* Sleepers — closer ones larger */}
    {[
      [70, 855, 730, 855, 8],
      [115, 800, 690, 800, 6],
      [150, 755, 655, 755, 5],
      [185, 715, 620, 715, 4],
      [215, 680, 590, 680, 3],
      [240, 650, 565, 650, 2.5],
      [263, 625, 543, 625, 2],
      [280, 605, 527, 605, 1.5],
      [295, 588, 513, 588, 1],
    ].map(([x1, y, x2, , w], i) => (
      <line key={i} x1={x1} y1={y} x2={x2} y2={y} stroke="#2a2520" strokeWidth={w}/>
    ))}

    {/* Platform edge on right */}
    <rect x="480" y="600" width="320" height="300" fill="#161412"/>
    <rect x="480" y="598" width="320" height="4" fill="#2a2520"/>

    {/* Signal gantry — right side */}
    {/* Post */}
    <rect x="490" y="430" width="8" height="175" fill="#252220" rx="2"/>
    {/* Cross arm */}
    <rect x="488" y="428" width="120" height="6" fill="#252220" rx="2"/>
    {/* Signal head housing */}
    <rect x="572" y="406" width="28" height="36" rx="3" fill="#111" stroke="#3a3530" strokeWidth="1"/>
    {/* Amber signal lamp */}
    <circle cx="586" cy="424" r="6" fill="#C98A2C"/>
    <circle cx="586" cy="424" r="10" fill="url(#signalGlow1)"/>
    {/* Glow halo on scene */}
    <circle cx="586" cy="424" r="50" fill="#C98A2C" opacity="0.07" filter="url(#blur4)"/>

    {/* Second gantry — farther, left side */}
    <rect x="268" y="480" width="5" height="120" fill="#201e1b" rx="1"/>
    <rect x="266" y="479" width="70" height="4" fill="#201e1b" rx="1"/>
    <rect x="298" y="464" width="18" height="24" rx="2" fill="#111" stroke="#2a2520" strokeWidth="1"/>
    <circle cx="307" cy="476" r="4" fill="#3E7C8C" opacity="0.8"/>

    {/* Stars */}
    {[
      [100, 80], [200, 40], [350, 120], [500, 60], [650, 90], [720, 30],
      [130, 160], [420, 200], [580, 140], [750, 180], [50, 240], [670, 260],
    ].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={Math.random() > 0.5 ? 1.2 : 0.7} fill="#f0ece4" opacity={0.4 + Math.random() * 0.3}/>
    ))}

    {/* Darkening overlay at bottom for contrast with right panel */}
    <rect x="0" y="0" width="800" height="900" fill="black" opacity="0.35"/>
  </svg>
)

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

      {/* ── Left panel — Railway scene (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:flex-col lg:w-[58%] relative overflow-hidden">
        <RailwayScene />

        {/* Bottom-left identity copy */}
        <div className="absolute bottom-10 left-10 z-10">
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase mb-2"
             style={{ color: '#C98A2C' }}>
            Railfan Archive
          </p>
          <p className="text-2xl font-medium leading-snug" style={{ color: '#f0ece4', fontFamily: "'Barlow Condensed', system-ui, sans-serif" }}>
            Your footage.<br />Organised.
          </p>
        </div>
      </div>

      {/* ── Right panel — Form ── */}
      <div
        className="flex-1 flex flex-col justify-between p-8 lg:p-12 relative"
        style={{
          background: '#211f1c',
          borderLeft: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {/* Mobile: subtle top rail scene strip */}
        <div className="lg:hidden absolute top-0 left-0 right-0 h-28 overflow-hidden opacity-30 pointer-events-none">
          <svg viewBox="0 0 400 112" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
            <rect width="400" height="112" fill="#141210"/>
            <path d="M 60 112 L 188 40" stroke="#3a3530" strokeWidth="3"/>
            <path d="M 85 112 L 196 40" stroke="#3a3530" strokeWidth="3"/>
            <path d="M 340 112 L 212 40" stroke="#3a3530" strokeWidth="3"/>
            <path d="M 315 112 L 204 40" stroke="#3a3530" strokeWidth="3"/>
            <circle cx="200" cy="22" r="5" fill="#C98A2C"/>
            <circle cx="200" cy="22" r="12" fill="#C98A2C" fillOpacity="0.15"/>
          </svg>
        </div>

        {/* Form area — vertically centred */}
        <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto">

          {/* Logo mark */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 mb-5">
              <SignalMark />
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

          {/* Error alert */}
          {authMutation.isError && (
            <div className="mb-5 flex items-start gap-3 p-4 rounded-lg bg-red-900/20 border border-red-800/40 text-red-400">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <p className="text-sm leading-relaxed">
                {(() => {
                  const err = authMutation.error as any
                  if (err?.code === 'ECONNABORTED') return 'Connection timed out. The server may still be booting. Please try again.'
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
              <input
                {...register('username')}
                type="text"
                className="form-input"
                placeholder="your_username"
                autoComplete="username"
              />
              {errors.username && <p className="mt-1.5 text-xs text-red-400">{errors.username.message}</p>}
            </div>

            {isRegistering && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className="form-input"
                  placeholder="your@email.com"
                  autoComplete="email"
                  required={isRegistering}
                />
                {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="form-input pr-10"
                  placeholder="••••••••"
                  autoComplete={isRegistering ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={authMutation.isPending}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 mt-2"
            >
              {authMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isRegistering ? 'Creating Account…' : 'Signing in…'}
                </>
              ) : (isRegistering ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => { setIsRegistering(!isRegistering); reset() }}
              className="text-sm transition-colors"
              style={{ color: '#C98A2C' }}
              onMouseOver={e => (e.currentTarget.style.color = '#e8b86d')}
              onMouseOut={e => (e.currentTarget.style.color = '#C98A2C')}
            >
              {isRegistering ? 'Already have an account? Sign in' : 'First time here? Create an account'}
            </button>
          </div>
        </div>

        {/* Bottom version string */}
        <p className="text-center text-xs text-slate-600 mt-6">
          Railfan Archive Manager v1.0
        </p>
      </div>
    </div>
  )
}
