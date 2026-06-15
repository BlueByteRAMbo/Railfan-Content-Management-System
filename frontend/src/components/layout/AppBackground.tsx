import React from 'react';

export default function AppBackground() {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-[var(--bg-base)]">
      {/* Subtle Noise / Grain Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Animated Radial Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-600/10 blur-[120px] animate-pulse-slow mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] rounded-full bg-brand-900/20 blur-[150px] animate-pulse-slow mix-blend-screen" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[40%] left-[20%] w-[30%] h-[30%] rounded-full bg-amber-500/5 blur-[100px] animate-pulse-slow mix-blend-screen" style={{ animationDelay: '4s' }} />
    </div>
  );
}
