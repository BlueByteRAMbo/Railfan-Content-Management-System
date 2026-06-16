import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authApi } from '../api/services'
import { useAuthStore } from '../store/authStore'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'


// ── Video Background ───────────────────────────────────────────
const VideoBackground = () => {
  return (
    <div className="absolute inset-0 z-0 bg-[#0a0908]">
      {/* The video loop */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/RF_BG.mp4" type="video/mp4" />
      </video>
      
      {/* Dark gradient overlay for text readability and cinematic feel */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to right, rgba(20,18,16,0.85) 0%, rgba(20,18,16,0.4) 40%, rgba(25,24,28,1) 100%)'
        }}
      />
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
        <VideoBackground />

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
