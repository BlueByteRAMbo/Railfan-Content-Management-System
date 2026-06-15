import { motion } from 'framer-motion'

export default function SignalLoader({ message = "LOADING..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-8 animate-fade-in">
      {/* Signal Post Container */}
      <div className="bg-[#1a1a20] p-3 rounded-full border border-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex flex-col gap-2 relative">
        {/* Post Stand */}
        <div className="absolute -z-10 top-full left-1/2 -translate-x-1/2 w-2 h-10 bg-gradient-to-b from-[#1a1a20] to-transparent" />
        
        {/* Red */}
        <motion.div 
          className="w-5 h-5 rounded-full bg-red-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
          animate={{ 
            backgroundColor: ['#7f1d1d', '#ef4444', '#7f1d1d'], 
            boxShadow: [
              'inset 0 2px 4px rgba(0,0,0,0.6)', 
              '0 0 20px rgba(239,68,68,0.8), inset 0 2px 4px rgba(0,0,0,0.1)', 
              'inset 0 2px 4px rgba(0,0,0,0.6)'
            ] 
          }}
          transition={{ duration: 1.5, repeat: Infinity, times: [0, 0.1, 0.4], ease: "easeInOut" }}
        />
        {/* Yellow */}
        <motion.div 
          className="w-5 h-5 rounded-full bg-amber-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
          animate={{ 
            backgroundColor: ['#78350f', '#f59e0b', '#78350f'], 
            boxShadow: [
              'inset 0 2px 4px rgba(0,0,0,0.6)', 
              '0 0 20px rgba(245,158,11,0.8), inset 0 2px 4px rgba(0,0,0,0.1)', 
              'inset 0 2px 4px rgba(0,0,0,0.6)'
            ] 
          }}
          transition={{ duration: 1.5, repeat: Infinity, times: [0, 0.1, 0.4], delay: 0.5, ease: "easeInOut" }}
        />
        {/* Green */}
        <motion.div 
          className="w-5 h-5 rounded-full bg-emerald-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
          animate={{ 
            backgroundColor: ['#064e3b', '#10b981', '#064e3b'], 
            boxShadow: [
              'inset 0 2px 4px rgba(0,0,0,0.6)', 
              '0 0 20px rgba(16,185,129,0.8), inset 0 2px 4px rgba(0,0,0,0.1)', 
              'inset 0 2px 4px rgba(0,0,0,0.6)'
            ] 
          }}
          transition={{ duration: 1.5, repeat: Infinity, times: [0, 0.1, 0.4], delay: 1, ease: "easeInOut" }}
        />
      </div>
      <p className="text-xs font-bold text-slate-500 tracking-[0.2em] uppercase">{message}</p>
    </div>
  )
}
