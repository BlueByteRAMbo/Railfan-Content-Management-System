import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authApi } from '../api/services'
import { useAuthStore } from '../store/authStore'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'

// ── Custom Realistic Logo ──────────────────────────────────────────
const RealisticLogo = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
    <rect x="8" y="2" width="8" height="16" rx="2" fill="#222" stroke="#444" />
    {/* Amber signal glowing */}
    <circle cx="12" cy="10" r="2.5" fill="#d98e04" stroke="none" className="drop-shadow-[0_0_6px_rgba(217,142,4,0.8)]" />
    {/* Post */}
    <path d="M12 18v6" strokeWidth="3" stroke="#444" />
    <path d="M8 24h8" stroke="#444" />
  </svg>
)

// ── Custom Realistic Background ──────────────────────────────────
const RealisticBackground = () => (
  <div className="absolute inset-0 z-0 overflow-hidden bg-[#16161a]">
    <svg className="absolute inset-0 w-full h-full object-cover opacity-60" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1000 600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id='signalGlow' cx='50%' cy='50%' r='50%'>
          <stop offset='0%' stopColor='#d98e04' stopOpacity='0.5'/>
          <stop offset='100%' stopColor='#d98e04' stopOpacity='0'/>
        </radialGradient>
      </defs>
      {/* Ground */}
      <path d='M 0 600 L 480 350 L 520 350 L 1000 600 Z' fill='#1a1a20'/>
      {/* Tracks */}
      <path d='M 200 600 L 490 350' stroke='#333' strokeWidth='4'/>
      <path d='M 800 600 L 510 350' stroke='#333' strokeWidth='4'/>
      {/* Track sleepers */}
      <line x1='250' y1='560' x2='750' y2='560' stroke='#222' strokeWidth='5'/>
      <line x1='300' y1='510' x2='700' y2='510' stroke='#222' strokeWidth='4'/>
      <line x1='340' y1='470' x2='660' y2='470' stroke='#222' strokeWidth='3'/>
      <line x1='380' y1='430' x2='620' y2='430' stroke='#222' strokeWidth='2'/>
      <line x1='410' y1='400' x2='590' y2='400' stroke='#222' strokeWidth='1.5'/>
      <line x1='440' y1='375' x2='560' y2='375' stroke='#222' strokeWidth='1'/>
      {/* Glowing signal on the right */}
      <rect x='540' y='280' width='6' height='70' fill='#222'/>
      <rect x='535' y='255' width='16' height='30' rx='2' fill='#111'/>
      <circle cx='543' cy='270' r='4' fill='#d98e04'/>
      <circle cx='543' cy='270' r='50' fill='url(#signalGlow)'/>
    </svg>
    <div className="absolute inset-0 bg-black/40" /> {/* Darkening overlay for contrast */}
  </div>
)

const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
})

type LoginForm = z.infer<typeof loginSchema>

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
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <RealisticBackground />

      <div className="relative w-full max-w-md z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-400 shadow-glow mb-4 border border-brand-500/20">
            <RealisticLogo />
          </div>
          <h1 className="text-2xl font-bold text-white">Railfan Archive</h1>
          <p className="text-slate-400 text-sm mt-1">
            {isRegistering ? 'Create a new admin account' : 'Sign in to manage your train videos'}
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          {authMutation.isError && (
            <div className="mb-6 flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
              <AlertCircle size={18} className="flex-shrink-0" />
              <p className="text-sm">
                {(authMutation.error as any).response?.data?.message || 
                 (isRegistering ? 'Registration failed. Username or email might be taken.' : 'Invalid username or password. Please try again.')}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit((d) => authMutation.mutate(d))} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Username</label>
              <input
                {...register('username')}
                type="text"
                className="form-input"
                placeholder="your_username"
                autoComplete="username"
              />
              {errors.username && (
                <p className="mt-1.5 text-xs text-red-400">{errors.username.message}</p>
              )}
            </div>

            {isRegistering && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                <input
                  {...register('email')}
                  type="email"
                  className="form-input"
                  placeholder="your@email.com"
                  autoComplete="email"
                  required={isRegistering}
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="form-input pr-10"
                  placeholder="••••••••"
                  autoComplete={isRegistering ? "new-password" : "current-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={authMutation.isPending}
              className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {authMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isRegistering ? 'Creating Account...' : 'Signing in...'}
                </>
              ) : (isRegistering ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering)
                reset()
              }}
              className="text-sm text-brand-400 hover:text-brand-300 transition-colors"
            >
              {isRegistering ? 'Already have an account? Sign in' : 'First time here? Create an account'}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Railfan Archive Manager v1.0
        </p>
      </div>
    </div>
  )
}
