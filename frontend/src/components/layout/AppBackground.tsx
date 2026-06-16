export default function AppBackground() {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* Subtle film-grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.025] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Amber glow — top left, warm signal lamp hue */}
      <div
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full animate-pulse-slow mix-blend-screen"
        style={{ background: 'rgba(201,138,44,0.08)', filter: 'blur(120px)', animationDelay: '0s' }}
      />
      {/* Deep amber/brown — bottom right, muted */}
      <div
        className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] rounded-full animate-pulse-slow mix-blend-screen"
        style={{ background: 'rgba(154,104,32,0.12)', filter: 'blur(150px)', animationDelay: '2s' }}
      />
      {/* Slate teal accent — centre-left, very subtle */}
      <div
        className="absolute top-[40%] left-[15%] w-[25%] h-[25%] rounded-full animate-pulse-slow mix-blend-screen"
        style={{ background: 'rgba(62,124,140,0.05)', filter: 'blur(100px)', animationDelay: '4s' }}
      />
    </div>
  )
}
